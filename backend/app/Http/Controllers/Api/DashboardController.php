<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ImageHelper;
use App\Http\Controllers\Controller;
use App\Models\AlumniRecord;
use App\Models\ProfessionalNotice;
use App\Models\UrgentRequest;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats()
    {
        $totalMembers = AlumniRecord::count();
        $activeMembers = User::where('is_active', true)->count();

        return response()->json([
            'total_members' => $totalMembers,
            'active_members' => $activeMembers,
            'professional_notices' => ProfessionalNotice::where('status', 'active')->count(),
            'urgent_requests' => UrgentRequest::where('status', 'open')->count(),
            'registered_this_week' => User::where('created_at', '>=', now()->subWeek())->count(),
            'registered_users' => User::count(),
            'notices_this_month' => ProfessionalNotice::where('created_at', '>=', now()->startOfMonth())->count(),
            'critical_requests' => UrgentRequest::where('status', 'open')->where('urgency_level', 'critical')->count(),
        ]);
    }

    public function recentAlumni()
    {
        $users = User::with('alumniRecord')
            ->where('is_active', true)
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->full_name,
                    'section' => $user->alumniRecord->section,
                    'roll_number' => $user->alumniRecord->roll_number,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'profile_image' => ImageHelper::schoolPhotoUrl($user->alumniRecord->profile_image_path),
                    'joined_at' => $user->created_at->format('M d, Y'),
                    'blood_group' => $user->blood_group,
                    'occupation' => $user->occupation,
                    'current_city' => $user->current_city,
                    'current_country' => $user->current_country,
                ];
            });

        return response()->json($users);
    }

    public function recentUrgentRequests()
    {
        $requests = UrgentRequest::with('user.alumniRecord')
            ->where('status', 'open')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($request) {
                return [
                    'id' => $request->id,
                    'title' => $request->title,
                    'type' => $request->type_of_emergency,
                    'urgency_level' => $request->urgency_level,
                    'user_name' => $request->user->full_name,
                    'created_at' => $request->created_at->diffForHumans(),
                ];
            });

        return response()->json($requests);
    }
}
