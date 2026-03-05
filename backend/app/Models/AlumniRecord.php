<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AlumniRecord extends Model
{
    protected $fillable = [
        'first_name',
        'last_name',
        'section',
        'roll_number',
        'profile_image_path',
        'is_registered',
    ];

    protected function casts(): array
    {
        return [
            'is_registered' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->hasOne(User::class, 'alumni_record_id');
    }

    public function getFullNameAttribute(): string
    {
        return $this->first_name . ' ' . $this->last_name;
    }
}
