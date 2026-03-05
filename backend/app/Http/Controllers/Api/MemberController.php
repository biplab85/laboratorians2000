<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ImageHelper;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MemberController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('alumniRecord')->where('is_active', true);

        if ($search = $request->input('search')) {
            $query->whereHas('alumniRecord', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%");
            });
        }

        if ($section = $request->input('section')) {
            $query->whereHas('alumniRecord', function ($q) use ($section) {
                $q->where('section', $section);
            });
        }

        if ($bloodGroup = $request->input('blood_group')) {
            $query->where('blood_group', $bloodGroup);
        }

        $members = $query->paginate(12)->through(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->full_name,
                'first_name' => $user->alumniRecord->first_name,
                'last_name' => $user->alumniRecord->last_name,
                'section' => $user->alumniRecord->section,
                'roll_number' => $user->alumniRecord->roll_number,
                'email' => $user->email,
                'phone' => $user->phone,
                'profile_image' => ImageHelper::profileImageUrl($user->profile_image),
                'school_photo' => ImageHelper::schoolPhotoUrl($user->alumniRecord->profile_image_path),
                'blood_group' => $user->blood_group,
                'occupation' => $user->occupation,
                'current_city' => $user->current_city,
                'current_country' => $user->current_country,
            ];
        });

        return response()->json($members);
    }

    public function show($id)
    {
        $user = User::with('alumniRecord')->findOrFail($id);

        return response()->json([
            'id' => $user->id,
            'name' => $user->full_name,
            'first_name' => $user->alumniRecord?->first_name,
            'last_name' => $user->alumniRecord?->last_name,
            'section' => $user->alumniRecord?->section,
            'roll_number' => $user->alumniRecord?->roll_number,
            'email' => $user->email,
            'phone' => $user->phone,
            'profile_image' => ImageHelper::profileImageUrl($user->profile_image),
            'school_photo' => ImageHelper::schoolPhotoUrl($user->alumniRecord?->profile_image_path),
            'blood_group' => $user->blood_group,
            'current_address' => $user->current_address,
            'current_city' => $user->current_city,
            'current_country' => $user->current_country,
            'occupation' => $user->occupation,
            'company_name' => $user->company_name,
            'designation' => $user->designation,
            'bio' => $user->bio,
            'facebook_url' => $user->facebook_url,
            'linkedin_url' => $user->linkedin_url,
            'whatsapp_number' => $user->whatsapp_number,
            'emergency_contact_name' => $user->emergency_contact_name,
            'emergency_contact_phone' => $user->emergency_contact_phone,
            'emergency_contact_relation' => $user->emergency_contact_relation,
            'favorite_memory' => $user->favorite_memory,
            'favorite_teacher' => $user->favorite_teacher,
            'favorite_hangout' => $user->favorite_hangout,
            'school_nick_name' => $user->school_nick_name,
            'best_friend' => $user->best_friend,
            'school_house' => $user->school_house,
            'home_district' => $user->home_district,
            'academic_qualification' => $user->academic_qualification,
            'business_services' => $user->business_services,
            'has_business_services' => (bool) $user->has_business_services,
            'is_active' => (bool) $user->is_active,
            'joined_at' => $user->created_at->format('M d, Y'),
            'banner_type' => $user->banner_type,
            'banner_value' => $user->banner_type === 'image'
                ? ImageHelper::bannerImageUrl($user->banner_value)
                : $user->banner_value,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'phone' => 'nullable|string',
            'blood_group' => 'nullable|string',
            'current_address' => 'nullable|string',
            'current_city' => 'nullable|string',
            'current_country' => 'nullable|string',
            'occupation' => 'nullable|string',
            'company_name' => 'nullable|string',
            'designation' => 'nullable|string',
            'bio' => 'nullable|string',
            'facebook_url' => 'nullable|url',
            'linkedin_url' => 'nullable|url',
            'whatsapp_number' => 'nullable|string',
            'emergency_contact_name' => 'nullable|string',
            'emergency_contact_phone' => 'nullable|string',
            'emergency_contact_relation' => 'nullable|string',
            'favorite_memory' => 'nullable|string',
            'favorite_teacher' => 'nullable|string',
            'favorite_hangout' => 'nullable|string',
            'business_services' => 'nullable|string',
            'has_business_services' => 'nullable|boolean',
            'school_nick_name' => 'nullable|string',
            'best_friend' => 'nullable|string',
            'school_house' => 'nullable|string',
            'home_district' => 'nullable|string',
            'academic_qualification' => 'nullable|string',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => $user->fresh()->load('alumniRecord'),
        ]);
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|current_password',
            'password' => ['required', 'confirmed', \Illuminate\Validation\Rules\Password::defaults()],
        ]);

        $request->user()->update([
            'password' => $request->password,
        ]);

        return response()->json([
            'message' => 'Password updated successfully.',
        ]);
    }

    public function updateProfileImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        $user = $request->user();

        // Delete old profile image if exists
        if ($user->profile_image) {
            Storage::disk('public')->delete('profile-images/' . $user->profile_image);
        }

        $file = $request->file('image');
        $filename = 'user_' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();
        $file->storeAs('profile-images', $filename, 'public');

        $user->update(['profile_image' => $filename]);

        $size = $file->getSize();
        $imageSize = getimagesize($file->getPathname());

        return response()->json([
            'message' => 'Profile image updated successfully.',
            'image_url' => ImageHelper::profileImageUrl($filename),
            'filename' => $file->getClientOriginalName(),
            'size' => $size,
            'dimensions' => $imageSize ? ($imageSize[0] . ' x ' . $imageSize[1]) : null,
        ]);
    }

    public function deleteProfileImage(Request $request)
    {
        $user = $request->user();

        if ($user->profile_image) {
            Storage::disk('public')->delete('profile-images/' . $user->profile_image);
            $user->update(['profile_image' => null]);
        }

        return response()->json([
            'message' => 'Profile image deleted.',
        ]);
    }

    public function updateBanner(Request $request)
    {
        $request->validate([
            'type' => 'required|in:image,gradient,solid',
            'value' => 'required_unless:type,image|string',
            'image' => 'required_if:type,image|file|max:10240',
        ]);

        $user = $request->user();
        $type = $request->input('type');

        // Delete old banner image if exists
        if ($user->banner_type === 'image' && $user->banner_value) {
            Storage::disk('public')->delete('banners/' . $user->banner_value);
        }

        if ($type === 'image') {
            $file = $request->file('image');
            $filename = 'banner_' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->storeAs('banners', $filename, 'public');

            $user->update([
                'banner_type' => 'image',
                'banner_value' => $filename,
            ]);

            return response()->json([
                'message' => 'Banner updated successfully.',
                'banner_type' => 'image',
                'banner_value' => ImageHelper::bannerImageUrl($filename),
            ]);
        }

        $user->update([
            'banner_type' => $type,
            'banner_value' => $request->input('value'),
        ]);

        return response()->json([
            'message' => 'Banner updated successfully.',
            'banner_type' => $type,
            'banner_value' => $request->input('value'),
        ]);
    }

    public function deleteBanner(Request $request)
    {
        $user = $request->user();

        if ($user->banner_type === 'image' && $user->banner_value) {
            Storage::disk('public')->delete('banners/' . $user->banner_value);
        }

        $user->update([
            'banner_type' => null,
            'banner_value' => null,
        ]);

        return response()->json([
            'message' => 'Banner reset to default.',
            'banner_type' => null,
            'banner_value' => null,
        ]);
    }
}
