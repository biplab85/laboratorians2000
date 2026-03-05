<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UrgentRequest extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'type_of_emergency',
        'urgency_level',
        'date_needed',
        'location',
        'contact_person',
        'contact_number',
        'description',
        'attachment',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'date_needed' => 'date',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
