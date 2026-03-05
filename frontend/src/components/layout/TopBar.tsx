"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import api from "@/lib/api";
import {
  AlertTriangle,
  Bell,
  Briefcase,
  ChevronDown,
  Loader2,
  LogOut,
  Menu,
  Settings,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface TopBarNotification {
  id: number;
  type: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

interface TopBarProps {
  pageTitle?: string;
}

export function TopBar({ pageTitle }: TopBarProps) {
  const { user, logout } = useAuth();
  const { setMobileOpen } = useSidebar();
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<TopBarNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifHasMore, setNotifHasMore] = useState(false);
  const [notifLoadingMore, setNotifLoadingMore] = useState(false);
  const notifPageRef = useRef(2);
  const notifLoadingMoreRef = useRef(false);

  const fetchNotifications = () => {
    notifPageRef.current = 2;
    api
      .get("/notifications?page=1&per_page=5")
      .then((res) => {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unread_count);
        setNotifHasMore(res.data.has_more ?? false);
      })
      .catch(() => {});
  };

  const loadMoreNotifs = async () => {
    if (notifLoadingMoreRef.current || !notifHasMore) return;
    notifLoadingMoreRef.current = true;
    setNotifLoadingMore(true);
    try {
      const res = await api.get(`/notifications?page=${notifPageRef.current}&per_page=5`);
      notifPageRef.current += 1;
      setNotifications((prev) => [...prev, ...res.data.notifications]);
      setNotifHasMore(res.data.has_more ?? false);
      setUnreadCount(res.data.unread_count);
    } catch {
      // silently fail
    } finally {
      notifLoadingMoreRef.current = false;
      setNotifLoadingMore(false);
    }
  };

  const handleNotifScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
      loadMoreNotifs();
    }
  };

  useEffect(() => {
    fetchNotifications();
    window.addEventListener("notifications:refresh", fetchNotifications);
    return () => window.removeEventListener("notifications:refresh", fetchNotifications);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`
    : "U";

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-9 w-9 cursor-pointer hover:bg-accent"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/favicon.svg"
          alt="lab2000"
          className="hidden w-6 h-6 shrink-0"
        />

        <div>
          <h1 className="text-lg font-semibold text-foreground leading-tight">
            {pageTitle || "Dashboard"}
          </h1>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        <ThemeToggle />

        <div className="relative" ref={notifRef}>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full cursor-pointer hover:bg-accent relative"
            onClick={() => setNotifOpen(!notifOpen)}
          >
            <Bell className="h-4 w-4 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </Button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-[360px] rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                <h3 className="text-sm font-semibold text-foreground">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="max-h-[380px] overflow-y-auto divide-y divide-border/40" onScroll={handleNotifScroll}>
                {notifications.map((notif) => {
                  const isUnread = !notif.read_at;
                  return (
                    <div
                      key={notif.id}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer ${isUnread ? "bg-primary/[0.03]" : ""}`}
                    >
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 ${
                          notif.type === "urgent"
                            ? "bg-destructive/10 text-destructive"
                            : notif.type === "registration"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-blue-500/10 text-blue-500"
                        }`}
                      >
                        {notif.type === "urgent" && (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                        {notif.type === "registration" && (
                          <UserPlus className="h-4 w-4" />
                        )}
                        {notif.type === "login" && (
                          <Briefcase className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-sm truncate ${isUnread ? "font-semibold text-foreground" : "font-medium text-foreground/80"}`}
                          >
                            {notif.title}
                          </p>
                          {isUnread && (
                            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {notif.body}
                        </p>
                        <p className="text-[11px] text-muted-foreground/60 mt-1">
                          {new Date(notif.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {notifLoadingMore && (
                  <div className="flex justify-center py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <div className="px-4 py-2.5 border-t border-border/50 bg-muted/20">
                <button
                  onClick={() => {
                    setNotifOpen(false);
                    router.push("/notifications");
                  }}
                  className="text-xs font-medium text-primary hover:text-primary/80 transition-colors w-full text-center cursor-pointer"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-8 bg-border mx-1 hidden sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2.5 h-10 px-2 cursor-pointer hover:bg-accent rounded-xl"
            >
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarImage
                  src={user?.profile_image || user?.school_photo || ""}
                />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-semibold text-foreground leading-tight">
                  {user?.first_name || "User"}
                </span>
                <span className="text-[11px] text-muted-foreground leading-tight">
                  Section {user?.section}
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 p-1.5">
            <div className="px-3 py-2.5">
              <p className="text-sm font-semibold text-foreground">
                {user?.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {user?.email}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/account-settings"
                className="cursor-pointer rounded-lg"
              >
                <Settings className="h-4 w-4 mr-2" />
                Account Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-destructive focus:text-destructive cursor-pointer rounded-lg"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
