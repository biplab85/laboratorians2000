<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\ProfessionalNotice;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfessionalNoticeController extends Controller
{
    public function index()
    {
        $notices = ProfessionalNotice::with('user.alumniRecord')
            ->latest()
            ->get()
            ->map(function ($notice) {
                return [
                    'id' => $notice->id,
                    'title' => $notice->title,
                    'requirement_type' => $notice->requirement_type,
                    'industry' => $notice->industry,
                    'location' => $notice->location,
                    'details' => $notice->details,
                    'status' => $notice->status,
                    'created_at' => $notice->created_at->toISOString(),
                    'user' => [
                        'alumni_record' => [
                            'first_name' => $notice->user->alumniRecord->first_name ?? '',
                            'last_name' => $notice->user->alumniRecord->last_name ?? '',
                        ],
                    ],
                ];
            });

        return response()->json($notices);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'requirement_type' => 'nullable|string|max:255',
            'industry' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'details' => 'required|string',
            'attachment' => 'nullable|file|max:65536',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['status'] = 'active';

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->storeAs('attachments/notices', $filename, 'public');
            $validated['attachment'] = $filename;
        }

        $notice = ProfessionalNotice::create($validated);
        $notice->load('user.alumniRecord');

        // Notify all users including the creator
        $posterName = $notice->user->full_name;
        $allUserIds = User::pluck('id');
        $notifications = $allUserIds->map(fn ($uid) => [
            'user_id' => $uid,
            'type' => 'professional',
            'title' => $notice->title,
            'body' => "Posted by {$posterName}" . ($notice->industry ? " — {$notice->industry}" : ''),
            'created_at' => now(),
            'updated_at' => now(),
        ])->toArray();
        Notification::insert($notifications);

        return response()->json([
            'id' => $notice->id,
            'title' => $notice->title,
            'requirement_type' => $notice->requirement_type,
            'industry' => $notice->industry,
            'location' => $notice->location,
            'details' => $notice->details,
            'status' => $notice->status,
            'created_at' => $notice->created_at->toISOString(),
            'user' => [
                'alumni_record' => [
                    'first_name' => $notice->user->alumniRecord->first_name ?? '',
                    'last_name' => $notice->user->alumniRecord->last_name ?? '',
                ],
            ],
        ], 201);
    }
}
