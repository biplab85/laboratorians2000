<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationSetting extends Model
{
    protected $fillable = [
        'user_id',
        'email_on_login',
        'email_on_registration',
        'email_on_urgent',
        'inapp_on_login',
        'inapp_on_registration',
        'inapp_on_urgent',
    ];

    protected function casts(): array
    {
        return [
            'email_on_login' => 'boolean',
            'email_on_registration' => 'boolean',
            'email_on_urgent' => 'boolean',
            'inapp_on_login' => 'boolean',
            'inapp_on_registration' => 'boolean',
            'inapp_on_urgent' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
