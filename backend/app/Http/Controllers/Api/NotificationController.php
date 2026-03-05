<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $page    = max(1, (int) $request->query('page', 1));
        $perPage = max(1, min(50, (int) $request->query('per_page', 10)));
        $offset  = ($page - 1) * $perPage;

        $base  = Notification::where('user_id', $request->user()->id)->latest();
        $total = (clone $base)->count();

        $notifications = (clone $base)
            ->offset($offset)
            ->limit($perPage)
            ->get()
            ->map(function ($notification) {
                return [
                    'id'         => $notification->id,
                    'type'       => $notification->type,
                    'title'      => $notification->title,
                    'body'       => $notification->body,
                    'read_at'    => $notification->read_at?->toISOString(),
                    'created_at' => $notification->created_at->toISOString(),
                ];
            });

        $unreadCount = Notification::where('user_id', $request->user()->id)
            ->unread()
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count'  => $unreadCount,
            'has_more'      => ($offset + $perPage) < $total,
        ]);
    }

    public function show(Request $request, $id)
    {
        $notification = Notification::where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json([
            'id' => $notification->id,
            'type' => $notification->type,
            'title' => $notification->title,
            'body' => $notification->body,
            'read_at' => $notification->read_at?->toISOString(),
            'created_at' => $notification->created_at->toISOString(),
        ]);
    }

    public function markAsRead(Request $request, $id)
    {
        $notification = Notification::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $notification->update(['read_at' => now()]);

        return response()->json(['message' => 'Notification marked as read.']);
    }

    public function markAllRead(Request $request)
    {
        Notification::where('user_id', $request->user()->id)
            ->unread()
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read.']);
    }

    public function batchRead(Request $request)
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'integer']);

        Notification::where('user_id', $request->user()->id)
            ->whereIn('id', $request->ids)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'Selected notifications marked as read.']);
    }

    public function batchUnread(Request $request)
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'integer']);

        Notification::where('user_id', $request->user()->id)
            ->whereIn('id', $request->ids)
            ->whereNotNull('read_at')
            ->update(['read_at' => null]);

        return response()->json(['message' => 'Selected notifications marked as unread.']);
    }

    public function batchDelete(Request $request)
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'integer']);

        Notification::where('user_id', $request->user()->id)
            ->whereIn('id', $request->ids)
            ->delete();

        return response()->json(['message' => 'Selected notifications deleted.']);
    }

    public function trash(Request $request)
    {
        $notifications = Notification::onlyTrashed()
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'title' => $notification->title,
                    'body' => $notification->body,
                    'read_at' => $notification->read_at?->toISOString(),
                    'created_at' => $notification->created_at->toISOString(),
                ];
            });

        return response()->json(['notifications' => $notifications]);
    }

    public function restore(Request $request)
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'integer']);

        Notification::onlyTrashed()
            ->where('user_id', $request->user()->id)
            ->whereIn('id', $request->ids)
            ->restore();

        return response()->json(['message' => 'Selected notifications restored.']);
    }
}
