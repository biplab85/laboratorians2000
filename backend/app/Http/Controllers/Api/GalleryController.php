<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GalleryImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GalleryController extends Controller
{
    public function index(Request $request)
    {
        $images = $request->user()->galleryImages()->get()->map(function ($img) {
            $img->url = url('storage/gallery/' . $img->filename);
            return $img;
        });

        return response()->json($images);
    }

    public function store(Request $request)
    {
        $request->validate([
            'images' => 'required|array|min:1',
            'images.*' => 'image|max:10240',
        ]);

        $maxOrder = $request->user()->galleryImages()->withoutGlobalScopes()->max('sort_order') ?? -1;
        $created = [];

        foreach ($request->file('images') as $file) {
            $maxOrder++;
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $file->storeAs('gallery', $filename, 'public');

            $dimensions = @getimagesize($file->getRealPath());
            $width = $dimensions ? $dimensions[0] : null;
            $height = $dimensions ? $dimensions[1] : null;

            $image = GalleryImage::create([
                'user_id' => $request->user()->id,
                'filename' => $filename,
                'original_name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'width' => $width,
                'height' => $height,
                'sort_order' => $maxOrder,
            ]);

            $image->url = url('storage/gallery/' . $image->filename);
            $created[] = $image;
        }

        return response()->json($created, 201);
    }

    public function update(Request $request, $id)
    {
        $image = GalleryImage::where('user_id', $request->user()->id)->findOrFail($id);

        $request->validate([
            'title' => 'nullable|string|max:255',
            'caption' => 'nullable|string|max:2000',
            'alt_text' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:5000',
        ]);

        $image->update($request->only(['title', 'caption', 'alt_text', 'description']));
        $image->url = url('storage/gallery/' . $image->filename);

        return response()->json($image);
    }

    public function destroy(Request $request, $id)
    {
        $image = GalleryImage::where('user_id', $request->user()->id)->findOrFail($id);

        Storage::disk('public')->delete('gallery/' . $image->filename);
        $image->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function replace(Request $request, $id)
    {
        $image = GalleryImage::where('user_id', $request->user()->id)->findOrFail($id);

        $request->validate([
            'image' => 'required|image|max:10240',
        ]);

        // Delete old file
        Storage::disk('public')->delete('gallery/' . $image->filename);

        // Store new file
        $file = $request->file('image');
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $file->storeAs('gallery', $filename, 'public');

        $dimensions = @getimagesize($file->getRealPath());
        $width = $dimensions ? $dimensions[0] : null;
        $height = $dimensions ? $dimensions[1] : null;

        $image->update([
            'filename' => $filename,
            'original_name' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
            'width' => $width,
            'height' => $height,
        ]);

        $image->url = url('storage/gallery/' . $image->filename);

        return response()->json($image);
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'order' => 'required|array',
            'order.*' => 'integer',
        ]);

        foreach ($request->order as $index => $id) {
            GalleryImage::where('id', $id)
                ->where('user_id', $request->user()->id)
                ->update(['sort_order' => $index]);
        }

        return response()->json(['message' => 'Reordered']);
    }
}
