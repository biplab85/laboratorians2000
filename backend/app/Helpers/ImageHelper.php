<?php

namespace App\Helpers;

class ImageHelper
{
    public static function schoolPhotoUrl(?string $filename): ?string
    {
        if (!$filename) return null;
        return url('storage/school-photos/' . $filename);
    }

    public static function profileImageUrl(?string $filename): ?string
    {
        if (!$filename) return null;
        return url('storage/profile-images/' . $filename);
    }

    public static function bannerImageUrl(?string $filename): ?string
    {
        if (!$filename) return null;
        return url('storage/banners/' . $filename);
    }

    public static function galleryImageUrl(?string $filename): ?string
    {
        if (!$filename) return null;
        return url('storage/gallery/' . $filename);
    }
}
