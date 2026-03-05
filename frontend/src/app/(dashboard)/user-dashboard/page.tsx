"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import {
  AlertTriangle,
  ArrowUpRight,
  Briefcase,
  Calendar,
  Clock,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Mail,
  MapPin,
  MapPinned,
  Phone,
  PhoneCall,
  Trash2,
  TrendingUp,
  UserCheck,
  User as UserIcon,
  Users,
} from "lucide-react";
import Link from "next/link";
import { HoverCard } from "radix-ui";
import { useEffect, useState } from "react";

interface Stats {
  total_members: number;
  active_members: number;
  professional_notices: number;
  urgent_requests: number;
  registered_this_week?: number;
  registered_users?: number;
  notices_this_month?: number;
  critical_requests?: number;
}

interface AlumniMember {
  id: number;
  name: string;
  section: string;
  roll_number: number;
  email: string;
  phone: string;
  profile_image: string | null;
  joined_at: string;
  blood_group?: string | null;
  occupation?: string | null;
  current_city?: string | null;
  current_country?: string | null;
}

interface UrgentRequest {
  id: number;
  title: string;
  type: string;
  urgency_level: string;
  user_name: string;
  created_at: string;
}

interface UrgentRequestDetail {
  id: number;
  title: string;
  type_of_emergency: string;
  urgency_level: string;
  date_needed: string | null;
  location: string | null;
  contact_person: string | null;
  contact_number: string | null;
  description: string;
  attachment: string | null;
  status: string;
  created_at: string;
  user_name: string;
  notification_id: number | null;
  read_at: string | null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [alumni, setAlumni] = useState<AlumniMember[]>([]);
  const [urgentRequests, setUrgentRequests] = useState<UrgentRequest[]>([]);
  const [urgentVisible, setUrgentVisible] = useState(10);
  const [loading, setLoading] = useState(true);

  // Urgent Request detail dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] =
    useState<UrgentRequestDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleRequestClick = async (reqId: number) => {
    setDialogOpen(true);
    setDetailLoading(true);
    setSelectedDetail(null);
    try {
      const res = await api.get(`/urgent-requests/${reqId}`);
      setSelectedDetail(res.data);
    } catch {
      // failed to load
    } finally {
      setDetailLoading(false);
    }
  };

  const handleMarkRead = async () => {
    if (!selectedDetail?.notification_id) return;
    setActionLoading(true);
    try {
      await api.post("/notifications/batch-read", {
        ids: [selectedDetail.notification_id],
      });
      setSelectedDetail((prev) =>
        prev ? { ...prev, read_at: new Date().toISOString() } : prev,
      );
    } catch {
      /* ignore */
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkUnread = async () => {
    if (!selectedDetail?.notification_id) return;
    setActionLoading(true);
    try {
      await api.post("/notifications/batch-unread", {
        ids: [selectedDetail.notification_id],
      });
      setSelectedDetail((prev) => (prev ? { ...prev, read_at: null } : prev));
    } catch {
      /* ignore */
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteNotification = async () => {
    if (!selectedDetail?.notification_id) return;
    setActionLoading(true);
    try {
      await api.post("/notifications/batch-delete", {
        ids: [selectedDetail.notification_id],
      });
      setUrgentRequests((prev) =>
        prev.filter((r) => r.id !== selectedDetail.id),
      );
      setDialogOpen(false);
    } catch {
      /* ignore */
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, alumniRes, urgentRes] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/dashboard/recent-alumni"),
          api.get("/dashboard/recent-urgent"),
        ]);
        setStats(statsRes.data);
        setAlumni(alumniRes.data);
        setUrgentRequests(urgentRes.data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    {
      label: "Total Members",
      value: stats?.total_members ?? 0,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/40",
      ringColor: "ring-blue-100 dark:ring-blue-900/40",
      gradient:
        "from-blue-500/[0.07] via-transparent to-transparent dark:from-blue-500/[0.12]",
      accentBorder:
        "group-hover:border-blue-200 dark:group-hover:border-blue-800/60",
      glowColor:
        "group-hover:shadow-blue-500/[0.08] dark:group-hover:shadow-blue-500/[0.15]",
    },
    {
      label: "Active Members",
      value: stats?.active_members ?? 0,
      icon: UserCheck,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      ringColor: "ring-emerald-100 dark:ring-emerald-900/40",
      gradient:
        "from-emerald-500/[0.07] via-transparent to-transparent dark:from-emerald-500/[0.12]",
      accentBorder:
        "group-hover:border-emerald-200 dark:group-hover:border-emerald-800/60",
      glowColor:
        "group-hover:shadow-emerald-500/[0.08] dark:group-hover:shadow-emerald-500/[0.15]",
    },
    {
      label: "Professional Notices",
      value: stats?.professional_notices ?? 0,
      icon: Briefcase,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      ringColor: "ring-amber-100 dark:ring-amber-900/40",
      gradient:
        "from-amber-500/[0.07] via-transparent to-transparent dark:from-amber-500/[0.12]",
      accentBorder:
        "group-hover:border-amber-200 dark:group-hover:border-amber-800/60",
      glowColor:
        "group-hover:shadow-amber-500/[0.08] dark:group-hover:shadow-amber-500/[0.15]",
    },
    {
      label: "Urgent Requests",
      value: stats?.urgent_requests ?? 0,
      icon: AlertTriangle,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950/40",
      ringColor: "ring-rose-100 dark:ring-rose-900/40",
      gradient:
        "from-rose-500/[0.07] via-transparent to-transparent dark:from-rose-500/[0.12]",
      accentBorder:
        "group-hover:border-rose-200 dark:group-hover:border-rose-800/60",
      glowColor:
        "group-hover:shadow-rose-500/[0.08] dark:group-hover:shadow-rose-500/[0.15]",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1400px]">
      {/* Welcome Banner */}
      <div className="dashboardWlcomeStrip relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 via-primary to-primary/80 p-6 md:p-8 text-primary-foreground shadow-lg shadow-primary/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-20 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/[0.03] rounded-full" />
        <div className="relative z-10">
          <p className="text-primary-foreground/70 text-sm font-medium mb-1">
            Welcome back,
          </p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {user?.name}
          </h1>
          <p className="text-primary-foreground/60 text-sm mt-2 max-w-lg">
            Stay connected with your batchmates. Here&apos;s what&apos;s
            happening in the Laboratorians 2000 community.
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const registrationRate = stats?.total_members
            ? Math.round(
                ((stats?.registered_users ?? 0) / stats.total_members) * 100,
              )
            : 0;
          const activeRate = stats?.total_members
            ? Math.round((stats.active_members / stats.total_members) * 100)
            : 0;

          return (
            <div
              key={card.label}
              className={`group relative bg-card border border-border rounded-2xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden ${card.accentBorder} ${card.glowColor}`}
            >
              {/* Subtle gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.gradient} pointer-events-none`}
              />

              <div className="relative z-10">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 ${card.bg} rounded-xl flex items-center justify-center ring-1 ${card.ringColor} group-hover:scale-110 transition-transform duration-300 shrink-0`}
                  >
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-foreground tracking-tight">
                        {card.value}
                      </p>
                      <TrendingUp className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 group-hover:-translate-y-0.5 transition-all duration-300" />
                    </div>
                    <p className="text-xs text-muted-foreground font-medium -mt-0.5">
                      {card.label}
                    </p>
                  </div>
                </div>

                {/* --- Card-specific sub-metrics --- */}
                {card.label === "Total Members" && (
                  <div className="mt-3 pt-2.5 border-t border-border/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">
                        Registered accounts
                      </span>
                      <span className="text-[11px] font-semibold text-foreground">
                        {stats?.registered_users ?? 0}{" "}
                        <span className="text-muted-foreground font-normal">
                          / {stats?.total_members ?? 0}
                        </span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-500"
                        style={{ width: `${registrationRate}%` }}
                      />
                    </div>
                    {(stats?.registered_this_week ?? 0) > 0 && (
                      <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                        +{stats?.registered_this_week} joined this week
                      </p>
                    )}
                  </div>
                )}

                {card.label === "Active Members" && (
                  <div className="mt-3 pt-2.5 border-t border-border/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">
                        Activity rate
                      </span>
                      <span className="text-[11px] font-semibold text-foreground">
                        {activeRate}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${activeRate}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Community active
                      </span>
                    </div>
                  </div>
                )}

                {card.label === "Professional Notices" && (
                  <div className="mt-3 pt-2.5 border-t border-border/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">
                        Posted this month
                      </span>
                      <span className="text-[11px] font-semibold text-foreground">
                        {stats?.notices_this_month ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex h-2 w-2 rounded-full bg-amber-500" />
                      <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                        {(stats?.professional_notices ?? 0) > 0
                          ? `${stats?.professional_notices} currently active`
                          : "No active notices"}
                      </span>
                    </div>
                  </div>
                )}

                {card.label === "Urgent Requests" && (
                  <div className="mt-3 pt-2.5 border-t border-border/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">
                        Critical level
                      </span>
                      <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                        {stats?.critical_requests ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {(stats?.critical_requests ?? 0) > 0 ? (
                        <>
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                          </span>
                          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                            Needs attention
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                            No critical issues
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        {/* Alumni Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-5 md:px-6 border-b border-border">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Registered Alumni
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Recently joined members
              </p>
            </div>
            <Link
              href="/members"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium cursor-pointer transition-colors"
            >
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block dashboard-scroller max-h-[460px] overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-border bg-muted/30 backdrop-blur-sm">
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[40%]">
                    Member
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[15%]">
                    Section
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[25%]">
                    Contact
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[20%]">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {alumni.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-10 text-center text-muted-foreground text-sm"
                    >
                      No registered alumni found.
                    </td>
                  </tr>
                ) : (
                  alumni.map((member, idx) => (
                    <tr
                      key={member.id}
                      className={`hover:bg-muted/30 transition-colors cursor-pointer ${
                        idx !== alumni.length - 1
                          ? "border-b border-border/50"
                          : ""
                      }`}
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3 group">
                          <Link href={`/members/${member.id}`}>
                            <Avatar className="h-9 w-9 ring-1 ring-border">
                              <AvatarImage src={member.profile_image || ""} />
                              <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                {member.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </Link>
                          <div>
                            <HoverCard.Root openDelay={300} closeDelay={150}>
                              <HoverCard.Trigger asChild>
                                <Link
                                  href={`/members/${member.id}`}
                                  className="text-sm font-medium text-foreground group-hover:text-primary transition-colors"
                                >
                                  {member.name}
                                </Link>
                              </HoverCard.Trigger>
                              <HoverCard.Portal>
                                <HoverCard.Content
                                  side="bottom"
                                  align="start"
                                  sideOffset={8}
                                  className="z-50 w-72 rounded-2xl border border-border bg-card shadow-xl shadow-black/[0.08] dark:shadow-black/30 overflow-hidden animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
                                >
                                  {/* Cover gradient + Avatar */}
                                  <div className="relative h-16 bg-gradient-to-br from-primary/80 via-primary/60 to-primary/40">
                                    <div className="absolute -bottom-5 left-4">
                                      <Avatar className="h-12 w-12 ring-2 ring-card shadow-md">
                                        <AvatarImage
                                          src={member.profile_image || ""}
                                        />
                                        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                                          {member.name.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                    </div>
                                  </div>

                                  {/* Info */}
                                  <div className="pt-7 pb-4 px-4 space-y-2.5">
                                    <div>
                                      <p className="text-sm font-semibold text-foreground">
                                        {member.name}
                                      </p>
                                      <p className="text-[11px] text-muted-foreground">
                                        Section {member.section} &middot; Roll #
                                        {member.roll_number}
                                      </p>
                                    </div>

                                    {member.occupation && (
                                      <p className="text-xs text-foreground/80">
                                        {member.occupation}
                                      </p>
                                    )}

                                    <div className="space-y-1.5 text-xs text-muted-foreground">
                                      {member.email && (
                                        <div className="flex items-center gap-2">
                                          <Mail className="h-3 w-3 shrink-0 text-violet-500" />
                                          <span className="truncate">
                                            {member.email}
                                          </span>
                                        </div>
                                      )}
                                      {member.phone && (
                                        <div className="flex items-center gap-2">
                                          <Phone className="h-3 w-3 shrink-0 text-emerald-500" />
                                          <span>{member.phone}</span>
                                        </div>
                                      )}
                                      {(member.current_city ||
                                        member.current_country) && (
                                        <div className="flex items-center gap-2">
                                          <MapPin className="h-3 w-3 shrink-0 text-orange-500" />
                                          <span>
                                            {[
                                              member.current_city,
                                              member.current_country,
                                            ]
                                              .filter(Boolean)
                                              .join(", ")}
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                                      {member.blood_group && (
                                        <span className="text-[10px] font-medium bg-red-500/10 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded">
                                          {member.blood_group}
                                        </span>
                                      )}
                                      <span className="text-[10px] text-muted-foreground/60">
                                        Joined {member.joined_at}
                                      </span>
                                    </div>
                                  </div>
                                </HoverCard.Content>
                              </HoverCard.Portal>
                            </HoverCard.Root>
                            <p className="text-xs text-muted-foreground">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-muted text-xs font-medium text-foreground">
                          {member.section}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-muted-foreground">
                        {member.phone || "—"}
                      </td>
                      <td className="px-6 py-3.5 text-sm text-muted-foreground">
                        {member.joined_at || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden dashboard-scroller max-h-[400px] overflow-y-auto p-4 space-y-2">
            {alumni.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">
                No registered alumni found.
              </p>
            ) : (
              alumni.map((member) => (
                <Link
                  key={member.id}
                  href={`/members/${member.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  <Avatar className="h-10 w-10 ring-1 ring-border">
                    <AvatarImage src={member.profile_image || ""} />
                    <AvatarFallback className="bg-primary/5 text-primary text-sm font-bold">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {member.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Section {member.section} &middot; {member.email}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Urgent Requests Panel */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-5 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">
                Urgent Requests
              </h2>
              <Link
                href="/urgent-section"
                className="text-xs text-primary hover:text-primary/80 font-medium cursor-pointer transition-colors"
              >
                View all
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Latest community requests
            </p>
          </div>

          <div className="dashboard-scroller max-h-[420px] overflow-y-auto p-4 flex-1">
            {urgentRequests.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="h-5 w-5 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  No urgent requests
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  All clear for now
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {urgentRequests.slice(0, urgentVisible).map((req) => (
                  <div
                    key={req.id}
                    onClick={() => handleRequestClick(req.id)}
                    className="p-3.5 rounded-xl bg-muted/20 border border-border/50 hover:border-border hover:bg-muted/30 hover:shadow-sm transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-medium text-foreground leading-snug">
                        {req.title}
                      </h3>
                      <Badge
                        variant={
                          req.urgency_level === "critical"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-[10px] shrink-0 px-2 py-0.5 rounded-md font-semibold"
                      >
                        {req.urgency_level}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{req.type}</p>
                    <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-border/30">
                      <span className="text-xs text-muted-foreground font-medium">
                        {req.user_name}
                      </span>
                      <span className="text-[11px] text-muted-foreground/60">
                        {req.created_at}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {urgentVisible < urgentRequests.length && (
              <div className="flex justify-center pt-3">
                <button
                  onClick={() => setUrgentVisible((c) => c + 10)}
                  className="text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
                >
                  View More
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Urgent Request Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <DialogTitle className="sr-only">Loading</DialogTitle>
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : selectedDetail ? (
            <>
              <DialogHeader className="pr-8">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <DialogTitle className="text-base leading-snug">
                      {selectedDetail.title}
                    </DialogTitle>
                    <DialogDescription className="mt-1">
                      {selectedDetail.type_of_emergency}
                    </DialogDescription>
                  </div>
                  <Badge
                    variant={
                      selectedDetail.urgency_level === "critical"
                        ? "destructive"
                        : "secondary"
                    }
                    className="text-[10px] shrink-0 px-2 py-0.5 rounded-md font-semibold mt-0.5"
                  >
                    {selectedDetail.urgency_level}
                  </Badge>
                </div>
              </DialogHeader>

              {/* Read status indicator */}
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`inline-flex h-2 w-2 rounded-full ${selectedDetail.read_at ? "bg-muted-foreground/30" : "bg-primary"}`}
                />
                <span className="text-muted-foreground">
                  {selectedDetail.read_at ? "Read" : "Unread"}
                </span>
                {selectedDetail.status && (
                  <>
                    <span className="text-border">|</span>
                    <span
                      className={`font-medium ${selectedDetail.status === "open" ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}
                    >
                      {selectedDetail.status}
                    </span>
                  </>
                )}
              </div>

              {/* Detail fields */}
              <div className="space-y-3 text-sm">
                {selectedDetail.description && (
                  <div className="bg-muted/30 border border-border/50 rounded-lg p-3">
                    <div
                      className="text-foreground leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_strong]:font-semibold [&_em]:italic"
                      dangerouslySetInnerHTML={{ __html: selectedDetail.description }}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <UserIcon className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                    <span>{selectedDetail.user_name}</span>
                  </div>
                  {selectedDetail.location && (
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <MapPinned className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                      <span>{selectedDetail.location}</span>
                    </div>
                  )}
                  {selectedDetail.contact_person && (
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-violet-500" />
                      <span>{selectedDetail.contact_person}</span>
                    </div>
                  )}
                  {selectedDetail.contact_number && (
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <PhoneCall className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      <span>{selectedDetail.contact_number}</span>
                    </div>
                  )}
                  {selectedDetail.date_needed && (
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                      <span>Needed by {selectedDetail.date_needed}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                    <span>
                      {new Date(selectedDetail.created_at).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                  </div>
                </div>

                {selectedDetail.attachment && (
                  <a
                    href={selectedDetail.attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-primary hover:underline font-medium"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    View Attachment
                  </a>
                )}
              </div>

              {/* Action buttons */}
              {selectedDetail.notification_id ? (
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  {selectedDetail.read_at ? (
                    <button
                      onClick={handleMarkUnread}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted hover:bg-muted/80 text-foreground transition-colors disabled:opacity-50"
                    >
                      <EyeOff className="h-3.5 w-3.5" />
                      Mark Unread
                    </button>
                  ) : (
                    <button
                      onClick={handleMarkRead}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 hover:bg-primary/20 text-primary transition-colors disabled:opacity-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={handleDeleteNotification}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                  {actionLoading && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground ml-auto" />
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground/60 pt-2 border-t border-border">
                  No linked notification found for this request.
                </p>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <DialogTitle className="sr-only">Error</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Failed to load request details.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
