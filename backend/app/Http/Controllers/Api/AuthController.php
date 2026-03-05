<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ImageHelper;
use App\Http\Controllers\Controller;
use App\Models\AlumniRecord;
use App\Models\NotificationSetting;
use App\Models\User;
use App\Models\UserPreference;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rules;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->getRawOriginal('password'))) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 401);
        }

        $user->load('alumniRecord');
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'name' => $user->full_name,
                'first_name' => $user->alumniRecord->first_name,
                'last_name' => $user->alumniRecord->last_name,
                'section' => $user->alumniRecord->section,
                'roll_number' => $user->alumniRecord->roll_number,
                'profile_image' => ImageHelper::profileImageUrl($user->profile_image),
                'school_photo' => ImageHelper::schoolPhotoUrl($user->alumniRecord->profile_image_path),
                'is_active' => $user->is_active,
            ],
            'token' => $token,
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'alumni_record_id' => 'required|exists:alumni_records,id',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'photo_confirmed' => 'required|boolean|accepted',
        ]);

        $alumniRecord = AlumniRecord::findOrFail($request->alumni_record_id);

        if ($alumniRecord->is_registered) {
            return response()->json([
                'message' => 'This alumni has already been registered.',
            ], 422);
        }

        $user = User::create([
            'alumni_record_id' => $alumniRecord->id,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => $request->password,
        ]);

        $alumniRecord->update(['is_registered' => true]);

        NotificationSetting::create([
            'user_id' => $user->id,
        ]);

        UserPreference::create([
            'user_id' => $user->id,
            'theme' => 'light',
        ]);

        return response()->json([
            'message' => 'Registration successful! You can now log in.',
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'name' => $alumniRecord->full_name,
            ],
        ], 201);
    }

    public function verifyAlumni(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'section' => 'required|string|in:A,B,C,D',
            'roll_number' => 'required|integer|min:1|max:71',
        ]);

        $record = AlumniRecord::where('first_name', $request->first_name)
            ->where('last_name', $request->last_name)
            ->where('section', $request->section)
            ->where('roll_number', $request->roll_number)
            ->first();

        if (!$record) {
            return response()->json([
                'found' => false,
                'message' => 'No matching alumni record found. Please check your name, section, and roll number.',
            ], 404);
        }

        if ($record->is_registered) {
            return response()->json([
                'found' => true,
                'already_registered' => true,
                'message' => 'This alumni has already registered an account.',
                'alumni' => [
                    'id' => $record->id,
                    'first_name' => $record->first_name,
                    'last_name' => $record->last_name,
                    'section' => $record->section,
                    'roll_number' => $record->roll_number,
                    'profile_image' => ImageHelper::schoolPhotoUrl($record->profile_image_path),
                ],
            ], 409);
        }

        return response()->json([
            'found' => true,
            'already_registered' => false,
            'alumni' => [
                'id' => $record->id,
                'first_name' => $record->first_name,
                'last_name' => $record->last_name,
                'section' => $record->section,
                'roll_number' => $record->roll_number,
                'profile_image' => ImageHelper::schoolPhotoUrl($record->profile_image_path),
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }

    public function user(Request $request)
    {
        $user = $request->user();
        $user->load('alumniRecord', 'preference');

        return response()->json([
            'id' => $user->id,
            'email' => $user->email,
            'name' => $user->full_name,
            'first_name' => $user->alumniRecord->first_name,
            'last_name' => $user->alumniRecord->last_name,
            'section' => $user->alumniRecord->section,
            'roll_number' => $user->alumniRecord->roll_number,
            'phone' => $user->phone,
            'profile_image' => ImageHelper::profileImageUrl($user->profile_image),
            'school_photo' => ImageHelper::schoolPhotoUrl($user->alumniRecord->profile_image_path),
            'is_active' => $user->is_active,
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
            'business_services' => $user->business_services,
            'has_business_services' => $user->has_business_services,
            'school_nick_name' => $user->school_nick_name,
            'best_friend' => $user->best_friend,
            'school_house' => $user->school_house,
            'home_district' => $user->home_district,
            'academic_qualification' => $user->academic_qualification,
            'theme' => $user->preference?->theme ?? 'light',
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $status = Password::sendResetLink($request->only('email'));

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'message' => 'Password reset link sent to your email.',
            ]);
        }

        return response()->json([
            'message' => 'Unable to send reset link. Please check your email address.',
        ], 422);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'Password has been reset successfully.',
            ]);
        }

        return response()->json([
            'message' => 'Failed to reset password. The token may be invalid or expired.',
        ], 422);
    }
}
