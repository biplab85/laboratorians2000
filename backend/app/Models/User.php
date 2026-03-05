<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'alumni_record_id',
        'email',
        'phone',
        'password',
        'is_active',
        'blood_group',
        'current_address',
        'current_city',
        'current_country',
        'occupation',
        'company_name',
        'designation',
        'bio',
        'facebook_url',
        'linkedin_url',
        'whatsapp_number',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relation',
        'profile_image',
        'banner_type',
        'banner_value',
        'favorite_memory',
        'favorite_teacher',
        'favorite_hangout',
        'business_services',
        'has_business_services',
        'school_nick_name',
        'best_friend',
        'school_house',
        'home_district',
        'academic_qualification',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'has_business_services' => 'boolean',
        ];
    }

    public function alumniRecord()
    {
        return $this->belongsTo(AlumniRecord::class);
    }

    public function notificationSettings()
    {
        return $this->hasOne(NotificationSetting::class);
    }

    public function urgentRequests()
    {
        return $this->hasMany(UrgentRequest::class);
    }

    public function professionalNotices()
    {
        return $this->hasMany(ProfessionalNotice::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function preference()
    {
        return $this->hasOne(UserPreference::class);
    }

    public function galleryImages()
    {
        return $this->hasMany(GalleryImage::class);
    }

    public function getFullNameAttribute(): string
    {
        return $this->alumniRecord
            ? $this->alumniRecord->first_name . ' ' . $this->alumniRecord->last_name
            : 'Unknown';
    }
}
