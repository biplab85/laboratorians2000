<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GalleryImage extends Model
{
    protected $fillable = [
        'user_id',
        'filename',
        'original_name',
        'title',
        'caption',
        'alt_text',
        'description',
        'size',
        'width',
        'height',
        'sort_order',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('ordered', function ($query) {
            $query->orderBy('sort_order');
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
