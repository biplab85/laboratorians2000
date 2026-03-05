<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfessionalNotice extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'requirement_type',
        'industry',
        'location',
        'details',
        'attachment',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
