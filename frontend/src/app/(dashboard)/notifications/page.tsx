'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Bell, Briefcase, CheckCheck, Loader2, AlertTriangle, UserPlus, LogIn, Inbox, Trash2, RotateCcw, Mail, MailOpen } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface Notification {
  id: number;
  type: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

const typeConfig: Record<string, { icon: typeof Bell; bg: string; color: string; label: string }> = {
  urgent: { icon: AlertTriangle, bg: 'bg-destructive/10', color: 'text-destructive', label: 'Urgent' },
  professional: { icon: Briefcase, bg: 'bg-blue-500/10', color: 'text-blue-500', label: 'Professional' },
  registration: { icon: UserPlus, bg: 'bg-emerald-500/10', color: 'text-emerald-500', label: 'Registration' },
  login: { icon: LogIn, bg: 'bg-blue-500/10', color: 'text-blue-500', label: 'Login' },
};

function getTypeConfig(type: string) {
  return typeConfig[type] || { icon: Bell, bg: 'bg-muted', color: 'text-muted-foreground', label: type };
}

function timeAgo(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [trashedNotifications, setTrashedNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<'inbox' | 'trash'>('inbox');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const inboxPageRef = useRef(2);
  const loadingMoreRef = useRef(false);

  const visibleList = viewMode === 'inbox' ? notifications : trashedNotifications;

  const fetchNotifications = async () => {
    inboxPageRef.current = 2;
    try {
      const res = await api.get('/notifications?page=1&per_page=10');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unread_count);
      setHasMore(res.data.has_more ?? false);
    } catch {
      toast.error('Failed to load notifications.');
    }
  };

  const loadMore = async () => {
    if (loadingMoreRef.current || !hasMore) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const res = await api.get(`/notifications?page=${inboxPageRef.current}&per_page=10`);
      inboxPageRef.current += 1;
      setNotifications((prev) => [...prev, ...res.data.notifications]);
      setHasMore(res.data.has_more ?? false);
    } catch {
      // silently fail
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  };

  const fetchTrash = async () => {
    try {
      const res = await api.get('/notifications/trash');
      setTrashedNotifications(res.data.notifications);
    } catch {
      toast.error('Failed to load trash.');
    }
  };

  useEffect(() => {
    Promise.all([fetchNotifications(), fetchTrash()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (viewMode !== 'inbox' || !hasMore || loadingMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, hasMore, loadingMore]);

  // Auto-select first item when switching views or when list changes
  useEffect(() => {
    if (visibleList.length > 0 && !visibleList.find((n) => n.id === selectedId)) {
      setSelectedId(visibleList[0].id);
    } else if (visibleList.length === 0) {
      setSelectedId(null);
    }
  }, [viewMode, visibleList.length]);

  const selected = visibleList.find((n) => n.id === selectedId) || null;

  const handleSelect = async (notif: Notification) => {
    setSelectedId(notif.id);

    if (viewMode === 'inbox' && !notif.read_at) {
      try {
        await api.post(`/notifications/${notif.id}/read`);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // silently fail
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
      setUnreadCount(0);
      toast.success('All notifications marked as read.');
    } catch {
      toast.error('Failed to mark all as read.');
    }
  };

  const toggleCheckbox = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === visibleList.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(visibleList.map((n) => n.id)));
    }
  };

  const handleBatchRead = async () => {
    if (selectedIds.size === 0) return;
    setActionLoading(true);
    try {
      await api.post('/notifications/batch-read', { ids: Array.from(selectedIds) });
      setNotifications((prev) =>
        prev.map((n) =>
          selectedIds.has(n.id) ? { ...n, read_at: n.read_at || new Date().toISOString() } : n
        )
      );
      const newlyRead = notifications.filter((n) => selectedIds.has(n.id) && !n.read_at).length;
      setUnreadCount((prev) => Math.max(0, prev - newlyRead));
      setSelectedIds(new Set());
      toast.success('Marked as read.');
    } catch {
      toast.error('Failed to mark as read.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBatchUnread = async () => {
    if (selectedIds.size === 0) return;
    setActionLoading(true);
    try {
      await api.post('/notifications/batch-unread', { ids: Array.from(selectedIds) });
      const newlyUnread = notifications.filter((n) => selectedIds.has(n.id) && n.read_at).length;
      setNotifications((prev) =>
        prev.map((n) =>
          selectedIds.has(n.id) ? { ...n, read_at: null } : n
        )
      );
      setUnreadCount((prev) => prev + newlyUnread);
      setSelectedIds(new Set());
      toast.success('Marked as unread.');
    } catch {
      toast.error('Failed to mark as unread.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    setActionLoading(true);
    try {
      await api.post('/notifications/batch-delete', { ids: Array.from(selectedIds) });
      const deletedNotifs = notifications.filter((n) => selectedIds.has(n.id));
      const deletedUnread = deletedNotifs.filter((n) => !n.read_at).length;
      setNotifications((prev) => prev.filter((n) => !selectedIds.has(n.id)));
      setTrashedNotifications((prev) => [...deletedNotifs, ...prev]);
      setUnreadCount((prev) => Math.max(0, prev - deletedUnread));
      setSelectedIds(new Set());
      toast.success('Notifications deleted.');
    } catch {
      toast.error('Failed to delete notifications.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    if (selectedIds.size === 0) return;
    setActionLoading(true);
    try {
      await api.post('/notifications/restore', { ids: Array.from(selectedIds) });
      const restoredNotifs = trashedNotifications.filter((n) => selectedIds.has(n.id));
      setTrashedNotifications((prev) => prev.filter((n) => !selectedIds.has(n.id)));
      setNotifications((prev) => [...restoredNotifs, ...prev].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
      const restoredUnread = restoredNotifs.filter((n) => !n.read_at).length;
      setUnreadCount((prev) => prev + restoredUnread);
      setSelectedIds(new Set());
      toast.success('Notifications restored.');
    } catch {
      toast.error('Failed to restore notifications.');
    } finally {
      setActionLoading(false);
    }
  };

  const switchView = (mode: 'inbox' | 'trash') => {
    setViewMode(mode);
    setSelectedIds(new Set());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const allChecked = visibleList.length > 0 && selectedIds.size === visibleList.length;
  const someChecked = selectedIds.size > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Stay updated with the latest alerts and activities
          </p>
        </div>
        <div className="flex items-center gap-2">
          {viewMode === 'inbox' && unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="rounded-full gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </Button>
          )}
          <Button
            variant={viewMode === 'trash' ? 'default' : 'outline'}
            size="sm"
            onClick={() => switchView(viewMode === 'inbox' ? 'trash' : 'inbox')}
            className="rounded-full gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {viewMode === 'trash' ? 'Back to Inbox' : `Trash${trashedNotifications.length > 0 ? ` (${trashedNotifications.length})` : ''}`}
          </Button>
        </div>
      </div>

      {visibleList.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="flex flex-col items-center justify-center py-20">
            {viewMode === 'trash' ? (
              <>
                <Trash2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-1">Trash is empty</h3>
                <p className="text-sm text-muted-foreground">
                  Deleted notifications will appear here.
                </p>
              </>
            ) : (
              <>
                <Inbox className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-1">No notifications yet</h3>
                <p className="text-sm text-muted-foreground">
                  When something happens, you&apos;ll see it here.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
          {/* Left Panel — Notification List */}
          <Card className="border border-border overflow-hidden">
            {/* List Header with select-all and actions */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
              <Checkbox
                checked={allChecked}
                onCheckedChange={toggleSelectAll}
                aria-label="Select all notifications"
              />
              {someChecked ? (
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <span className="text-xs text-muted-foreground mr-1 shrink-0">
                    {selectedIds.size} selected
                  </span>
                  {viewMode === 'inbox' ? (
                    <>
                      <Button variant="ghost" size="sm" onClick={handleBatchRead} disabled={actionLoading} className="h-7 px-2 gap-1 text-xs">
                        <MailOpen className="h-3.5 w-3.5" />
                        Read
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleBatchUnread} disabled={actionLoading} className="h-7 px-2 gap-1 text-xs">
                        <Mail className="h-3.5 w-3.5" />
                        Unread
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleBatchDelete} disabled={actionLoading} className="h-7 px-2 gap-1 text-xs text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={handleRestore} disabled={actionLoading} className="h-7 px-2 gap-1 text-xs">
                      <RotateCcw className="h-3.5 w-3.5" />
                      Restore
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">
                    {viewMode === 'trash' ? 'Trash' : 'All Notifications'}
                  </h3>
                  {viewMode === 'inbox' && unreadCount > 0 && (
                    <span className="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="max-h-[calc(100vh-280px)] overflow-y-auto divide-y divide-border/40">
              {visibleList.map((notif) => {
                const config = getTypeConfig(notif.type);
                const Icon = config.icon;
                const isSelected = notif.id === selectedId;
                const isUnread = !notif.read_at;
                const isChecked = selectedIds.has(notif.id);

                return (
                  <div
                    key={notif.id}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                      isSelected
                        ? 'bg-primary/[0.06] border-l-2 border-l-primary'
                        : 'hover:bg-accent/50 border-l-2 border-l-transparent'
                    } ${isUnread && viewMode === 'inbox' ? 'bg-primary/[0.03]' : ''}`}
                  >
                    <div className="flex-shrink-0 pt-1" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleCheckbox(notif.id)}
                        aria-label={`Select ${notif.title}`}
                      />
                    </div>
                    <button
                      onClick={() => handleSelect(notif)}
                      className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer"
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 ${config.bg}`}>
                        <Icon className={`h-4 w-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm truncate ${isUnread && viewMode === 'inbox' ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'}`}>
                            {notif.title}
                          </p>
                          {isUnread && viewMode === 'inbox' && (
                            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{notif.body}</p>
                        <p className="text-[11px] text-muted-foreground/60 mt-1">{timeAgo(notif.created_at)}</p>
                      </div>
                    </button>
                  </div>
                );
              })}
              {viewMode === 'inbox' && (
                <>
                  {loadingMore && (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  )}
                  <div ref={sentinelRef} />
                </>
              )}
            </div>
          </Card>

          {/* Right Panel — Detail */}
          <Card className="border border-border lg:sticky lg:top-24 h-fit">
            {selected ? (
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-6">
                  {(() => {
                    const config = getTypeConfig(selected.type);
                    const Icon = config.icon;
                    return (
                      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${config.bg}`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                    );
                  })()}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-foreground">{selected.title}</h2>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="secondary" className="text-[11px]">
                        {getTypeConfig(selected.type).label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(selected.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                  {selected.body}
                </div>
              </CardContent>
            ) : (
              <CardContent className="flex flex-col items-center justify-center py-20">
                <Bell className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">Select a notification to view details</p>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
