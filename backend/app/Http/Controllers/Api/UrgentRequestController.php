<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\UrgentRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UrgentRequestController extends Controller
{
    public function index()
    {
        $requests = UrgentRequest::with('user.alumniRecord')
            ->latest()
            ->get()
            ->map(function ($request) {
                return [
                    'id' => $request->id,
                    'title' => $request->title,
                    'type_of_emergency' => $request->type_of_emergency,
                    'urgency_level' => $request->urgency_level,
                    'date_needed' => $request->date_needed?->format('Y-m-d'),
                    'location' => $request->location,
                    'contact_person' => $request->contact_person,
                    'contact_number' => $request->contact_number,
                    'description' => $request->description,
                    'status' => $request->status,
                    'created_at' => $request->created_at->toISOString(),
                    'user_name' => $request->user->full_name,
                ];
            });

        return response()->json($requests);
    }

    public function show(Request $request, $id)
    {
        $urgentRequest = UrgentRequest::with('user.alumniRecord')->findOrFail($id);

        // Find the matching notification for the authenticated user
        $notification = Notification::where('user_id', $request->user()->id)
            ->where('type', 'urgent')
            ->where('title', $urgentRequest->title)
            ->latest()
            ->first();

        return response()->json([
            'id' => $urgentRequest->id,
            'title' => $urgentRequest->title,
            'type_of_emergency' => $urgentRequest->type_of_emergency,
            'urgency_level' => $urgentRequest->urgency_level,
            'date_needed' => $urgentRequest->date_needed?->format('Y-m-d'),
            'location' => $urgentRequest->location,
            'contact_person' => $urgentRequest->contact_person,
            'contact_number' => $urgentRequest->contact_number,
            'description' => $urgentRequest->description,
            'attachment' => $urgentRequest->attachment
                ? url('storage/attachments/urgent/' . $urgentRequest->attachment)
                : null,
            'status' => $urgentRequest->status,
            'created_at' => $urgentRequest->created_at->toISOString(),
            'user_name' => $urgentRequest->user->full_name,
            'notification_id' => $notification?->id,
            'read_at' => $notification?->read_at?->toISOString(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type_of_emergency' => 'required|string|max:255',
            'urgency_level' => 'required|string|in:low,medium,high,critical',
            'date_needed' => 'nullable|date',
            'location' => 'nullable|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:255',
            'description' => 'required|string',
            'attachment' => 'nullable|file|max:65536',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['status'] = 'open';

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->storeAs('attachments/urgent', $filename, 'public');
            $validated['attachment'] = $filename;
        }

        $urgentRequest = UrgentRequest::create($validated);
        $urgentRequest->load('user.alumniRecord');

        // Notify all users including the creator
        $posterName = $urgentRequest->user->full_name;
        $allUserIds = User::pluck('id');
        $notifications = $allUserIds->map(fn ($uid) => [
            'user_id' => $uid,
            'type' => 'urgent',
            'title' => $urgentRequest->title,
            'body' => "{$urgentRequest->type_of_emergency}" . ($urgentRequest->location ? " — {$urgentRequest->location}" : '') . " (Posted by {$posterName})",
            'created_at' => now(),
            'updated_at' => now(),
        ])->toArray();
        Notification::insert($notifications);

        return response()->json([
            'id' => $urgentRequest->id,
            'title' => $urgentRequest->title,
            'type_of_emergency' => $urgentRequest->type_of_emergency,
            'urgency_level' => $urgentRequest->urgency_level,
            'date_needed' => $urgentRequest->date_needed?->format('Y-m-d'),
            'location' => $urgentRequest->location,
            'contact_person' => $urgentRequest->contact_person,
            'contact_number' => $urgentRequest->contact_number,
            'description' => $urgentRequest->description,
            'status' => $urgentRequest->status,
            'created_at' => $urgentRequest->created_at->toISOString(),
            'user_name' => $urgentRequest->user->full_name,
        ], 201);
    }
}
