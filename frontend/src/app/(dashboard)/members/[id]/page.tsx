"use client";

import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  BookOpen,
  Briefcase,
  Building2,
  Camera,
  Check,
  Droplets,
  Facebook,
  GraduationCap,
  Heart,
  Home as HomeIcon,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  Palette,
  Phone,
  RotateCcw,
  Upload,
  User as UserIcon,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const BANNER_GRADIENTS = [
  { label: "Sunset", value: "linear-gradient(135deg, #f97316, #ec4899)" },
  { label: "Ocean", value: "linear-gradient(135deg, #06b6d4, #3b82f6)" },
  { label: "Forest", value: "linear-gradient(135deg, #22c55e, #14b8a6)" },
  { label: "Twilight", value: "linear-gradient(135deg, #8b5cf6, #6366f1)" },
  { label: "Rose", value: "linear-gradient(135deg, #f43f5e, #e11d48)" },
  { label: "Amber", value: "linear-gradient(135deg, #f59e0b, #ef4444)" },
  { label: "Slate", value: "linear-gradient(135deg, #475569, #1e293b)" },
  { label: "Midnight", value: "linear-gradient(135deg, #1e1b4b, #0f172a)" },
];

const BANNER_COLORS = [
  { label: "Coral", value: "#E8604C" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Emerald", value: "#10b981" },
  { label: "Violet", value: "#8b5cf6" },
  { label: "Rose", value: "#f43f5e" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Cyan", value: "#06b6d4" },
  { label: "Slate", value: "#475569" },
  { label: "Zinc", value: "#27272a" },
  { label: "Stone", value: "#78716c" },
];

interface MemberProfile {
  id: number;
  name: string;
  first_name: string | null;
  last_name: string | null;
  section: string | null;
  roll_number: number | null;
  email: string;
  phone: string | null;
  profile_image: string | null;
  school_photo: string | null;
  blood_group: string | null;
  current_address: string | null;
  current_city: string | null;
  current_country: string | null;
  occupation: string | null;
  company_name: string | null;
  designation: string | null;
  bio: string | null;
  facebook_url: string | null;
  linkedin_url: string | null;
  whatsapp_number: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relation: string | null;
  favorite_memory: string | null;
  favorite_teacher: string | null;
  favorite_hangout: string | null;
  school_nick_name: string | null;
  best_friend: string | null;
  school_house: string | null;
  home_district: string | null;
  academic_qualification: string | null;
  business_services: string | null;
  has_business_services: boolean;
  is_active: boolean;
  joined_at: string;
  banner_type: "image" | "gradient" | "solid" | null;
  banner_value: string | null;
}

function InfoRow({
  icon: Icon,
  label,
  value,
  iconColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number | null | undefined;
  iconColor?: string;
}) {
  if (value === null || value === undefined || value === "") return null;
  const color = iconColor || "text-muted-foreground bg-muted/50";
  const [textColor, bgColor] = color.split(" ");
  return (
    <div className="group/row flex items-center gap-3.5 py-3 px-1 -mx-1 rounded-lg hover:bg-muted/30 transition-colors duration-200">
      <div
        className={`w-9 h-9 rounded-xl ${bgColor || "bg-muted/50"} flex items-center justify-center shrink-0 ring-1 ring-border/30 group-hover/row:scale-105 transition-transform duration-200`}
      >
        <Icon className={`h-4 w-4 ${textColor}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-medium text-foreground mt-0.5">
          {String(value)}
        </p>
      </div>
    </div>
  );
}

export default function MemberProfilePage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Banner state
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);
  const [bannerType, setBannerType] = useState<MemberProfile["banner_type"]>(null);
  const [bannerValue, setBannerValue] = useState<string | null>(null);
  const [bannerUploading, setBannerUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = params?.id;
    if (!id) {
      setLoading(false);
      setError("Invalid member ID.");
      return;
    }

    const fetchMember = async () => {
      try {
        setError(null);
        const res = await api.get(`/members/${id}`);
        setMember(res.data);
        setBannerType(res.data.banner_type);
        setBannerValue(res.data.banner_value);
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number } };
        if (axiosErr.response?.status === 404) {
          setError("Member not found.");
        } else if (axiosErr.response?.status === 401) {
          // handled by axios interceptor (redirects to login)
          return;
        } else {
          setError("Failed to load member details. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [params?.id]);

  const isOwnProfile = user?.id === member?.id;

  // Banner API handlers
  const handleBannerImage = async (file: File) => {
    setBannerUploading(true);
    try {
      const formData = new FormData();
      formData.append("type", "image");
      formData.append("image", file);
      const res = await api.post("/profile/banner", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setBannerType(res.data.banner_type);
      setBannerValue(res.data.banner_value);
      toast.success("Banner image updated!");
      setBannerDialogOpen(false);
    } catch {
      toast.error("Failed to upload banner image.");
    } finally {
      setBannerUploading(false);
    }
  };

  const handleBannerGradient = async (value: string) => {
    setBannerUploading(true);
    try {
      const res = await api.post("/profile/banner", {
        type: "gradient",
        value,
      });
      setBannerType(res.data.banner_type);
      setBannerValue(res.data.banner_value);
      toast.success("Banner gradient updated!");
      setBannerDialogOpen(false);
    } catch {
      toast.error("Failed to update banner.");
    } finally {
      setBannerUploading(false);
    }
  };

  const handleBannerColor = async (value: string) => {
    setBannerUploading(true);
    try {
      const res = await api.post("/profile/banner", {
        type: "solid",
        value,
      });
      setBannerType(res.data.banner_type);
      setBannerValue(res.data.banner_value);
      toast.success("Banner color updated!");
      setBannerDialogOpen(false);
    } catch {
      toast.error("Failed to update banner.");
    } finally {
      setBannerUploading(false);
    }
  };

  const handleBannerReset = async () => {
    setBannerUploading(true);
    try {
      await api.delete("/profile/banner");
      setBannerType(null);
      setBannerValue(null);
      toast.success("Banner reset to default.");
      setBannerDialogOpen(false);
    } catch {
      toast.error("Failed to reset banner.");
    } finally {
      setBannerUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">{error || "Member not found."}</p>
        <Link
          href="/members"
          className="text-primary hover:underline text-sm mt-2 inline-block"
        >
          Back to Members
        </Link>
      </div>
    );
  }

  const location = [
    member.current_address,
    member.current_city,
    member.current_country,
  ]
    .filter(Boolean)
    .join(", ");
  const displayPhoto = member.profile_image || member.school_photo;
  const initials = `${member.first_name?.[0] ?? ""}${member.last_name?.[0] ?? ""}`;

  // Compute banner style
  const getBannerStyle = (): React.CSSProperties => {
    if (bannerType === "image" && bannerValue) {
      return {};
    }
    if (bannerType === "gradient" && bannerValue) {
      return { backgroundImage: bannerValue };
    }
    if (bannerType === "solid" && bannerValue) {
      return { backgroundColor: bannerValue };
    }
    return {};
  };

  const isDefaultBanner = !bannerType;
  const isImageBanner = bannerType === "image" && bannerValue;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/members"
        className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
      >
        &larr; {member.name}
      </Link>

      {/* Cover Banner + Profile Header */}
      <div className="relative rounded-xl overflow-hidden bg-card border border-border">
        {/* Cover */}
        <div
          className={`h-48 md:h-56 relative overflow-hidden ${isDefaultBanner ? "bg-gradient-to-br from-gray-800 via-gray-900 to-black" : ""}`}
          style={getBannerStyle()}
        >
          {/* Default banner: blurred school photo */}
          {isDefaultBanner && member.school_photo && (
            <img
              src={member.school_photo}
              alt=""
              className="bg-img userDetailsBqannerImage absolute inset-0 w-full h-full object-cover opacity-30 blur-sm scale-110"
            />
          )}

          {/* Image banner */}
          {isImageBanner && (
            <img
              src={bannerValue!}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Edit banner button - only on own profile */}
          {isOwnProfile && (
            <button
              onClick={() => setBannerDialogOpen(true)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
              title="Change banner"
            >
              <Camera className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Profile Info Bar */}
        <div className="relative px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 sm:-mt-12">
            {/* Avatar */}
            <div className="w-28 h-28 sm:w-24 sm:h-24 rounded-xl border-4 border-card overflow-hidden bg-muted shadow-lg shrink-0">
              {displayPhoto ? (
                <img
                  src={displayPhoto}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-2xl font-bold">
                  {initials || "?"}
                </div>
              )}
            </div>

            {/* Name & Meta */}
            <div className="flex-1 min-w-0 pb-1">
              <h1 className="name-text text-xl font-bold text-foreground">
                {member.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                {member.section && <span>Section - {member.section}</span>}
                {member.roll_number != null && (
                  <span>Roll : {member.roll_number}</span>
                )}
              </div>
              {member.email && (
                <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{member.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3 mt-4">
            {member.facebook_url && (
              <a
                href={member.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full text-white flex items-center justify-center hover:opacity-80 transition-opacity"
                style={{ backgroundColor: "#1877F2" }}
              >
                <Facebook className="h-4 w-4" />
              </a>
            )}
            {member.linkedin_url && (
              <a
                href={member.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full text-white flex items-center justify-center hover:opacity-80 transition-opacity"
                style={{ backgroundColor: "#0A66C2" }}
              >
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            {member.whatsapp_number && (
              <a
                href={`https://wa.me/${member.whatsapp_number.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full text-white flex items-center justify-center hover:opacity-80 transition-opacity"
                style={{ backgroundColor: "#25D366" }}
              >
                <Phone className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Banner Edit Dialog */}
      <Dialog open={bannerDialogOpen} onOpenChange={setBannerDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Change Banner</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="image" className="mt-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="image" className="gap-1.5">
                <Upload className="h-3.5 w-3.5" />
                Image
              </TabsTrigger>
              <TabsTrigger value="gradient" className="gap-1.5">
                <Palette className="h-3.5 w-3.5" />
                Gradient
              </TabsTrigger>
              <TabsTrigger value="solid" className="gap-1.5">
                <Palette className="h-3.5 w-3.5" />
                Color
              </TabsTrigger>
            </TabsList>

            {/* Image Tab */}
            <TabsContent value="image" className="mt-4 space-y-4">
              <div
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-foreground">
                  Click to upload an image
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, GIF, WebP up to 10MB
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleBannerImage(file);
                  e.target.value = "";
                }}
              />
              {bannerUploading && (
                <div className="flex items-center justify-center gap-2 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    Uploading...
                  </span>
                </div>
              )}
            </TabsContent>

            {/* Gradient Tab */}
            <TabsContent value="gradient" className="mt-4">
              <div className="grid grid-cols-4 gap-3">
                {BANNER_GRADIENTS.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => handleBannerGradient(g.value)}
                    disabled={bannerUploading}
                    className="group relative aspect-[2/1] rounded-lg overflow-hidden ring-1 ring-border hover:ring-primary/50 transition-all disabled:opacity-50"
                    style={{ backgroundImage: g.value }}
                    title={g.label}
                  >
                    {bannerType === "gradient" && bannerValue === g.value && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <span className="absolute bottom-0.5 inset-x-0 text-[10px] text-white/80 text-center font-medium drop-shadow">
                      {g.label}
                    </span>
                  </button>
                ))}
              </div>
            </TabsContent>

            {/* Solid Color Tab */}
            <TabsContent value="solid" className="mt-4">
              <div className="grid grid-cols-5 gap-3">
                {BANNER_COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => handleBannerColor(c.value)}
                    disabled={bannerUploading}
                    className="group relative aspect-square rounded-lg overflow-hidden ring-1 ring-border hover:ring-primary/50 transition-all disabled:opacity-50"
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  >
                    {bannerType === "solid" && bannerValue === c.value && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <span className="absolute bottom-0.5 inset-x-0 text-[10px] text-white/80 text-center font-medium drop-shadow">
                      {c.label}
                    </span>
                  </button>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Reset button */}
          <div className="flex items-center justify-between pt-2 border-t border-border mt-2">
            <button
              onClick={handleBannerReset}
              disabled={bannerUploading || isDefaultBanner}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset to default
            </button>
            <button
              onClick={() => setBannerDialogOpen(false)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column — Contact & Professional */}
        <div className="space-y-6">
          {/* Personal Information */}
          <section className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-blue-200 dark:hover:border-blue-800/50 hover:shadow-lg hover:shadow-blue-500/[0.04] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] via-transparent to-transparent pointer-events-none" />
            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center ring-1 ring-blue-100 dark:ring-blue-900/40">
                  <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-base font-semibold text-foreground">
                  Personal Information
                </h2>
              </div>
              <div className="space-y-0.5">
                <InfoRow
                  icon={Mail}
                  label="Mail"
                  value={member.email}
                  iconColor="text-violet-500 bg-violet-50 dark:bg-violet-950/40"
                />
                <InfoRow
                  icon={MapPin}
                  label="Location"
                  value={location || null}
                  iconColor="text-orange-500 bg-orange-50 dark:bg-orange-950/40"
                />
                <InfoRow
                  icon={Droplets}
                  label="Blood Group"
                  value={member.blood_group}
                  iconColor="text-red-500 bg-red-50 dark:bg-red-950/40"
                />
                <InfoRow
                  icon={Phone}
                  label="Phone"
                  value={member.phone}
                  iconColor="text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
                />
              </div>
            </div>
          </section>

          {/* Emergency Information */}
          {(member.emergency_contact_name ||
            member.emergency_contact_phone) && (
            <section className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-rose-200 dark:hover:border-rose-800/50 hover:shadow-lg hover:shadow-rose-500/[0.04] transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/[0.03] via-transparent to-transparent pointer-events-none" />
              <div className="relative p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center ring-1 ring-rose-100 dark:ring-rose-900/40">
                    <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <h2 className="text-base font-semibold text-foreground">
                    Emergency Information
                  </h2>
                </div>
                <div className="space-y-0.5">
                  <InfoRow
                    icon={UserIcon}
                    label="Name"
                    value={member.emergency_contact_name}
                    iconColor="text-blue-500 bg-blue-50 dark:bg-blue-950/40"
                  />
                  <InfoRow
                    icon={Phone}
                    label="Phone"
                    value={member.emergency_contact_phone}
                    iconColor="text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
                  />
                  <InfoRow
                    icon={Heart}
                    label="Relation Member"
                    value={member.emergency_contact_relation}
                    iconColor="text-pink-500 bg-pink-50 dark:bg-pink-950/40"
                  />
                </div>
              </div>
            </section>
          )}

          {/* Previous Employment */}
          <section className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-indigo-200 dark:hover:border-indigo-800/50 hover:shadow-lg hover:shadow-indigo-500/[0.04] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] via-transparent to-transparent pointer-events-none" />
            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center ring-1 ring-indigo-100 dark:ring-indigo-900/40">
                  <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-base font-semibold text-foreground">
                  Previous Employment
                </h2>
              </div>
              {member.company_name ? (
                <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
                  <div className="grid grid-cols-3 gap-px bg-border/30">
                    <div className="bg-muted/40 px-4 py-2.5">
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        Company/Organization
                      </p>
                    </div>
                    <div className="bg-muted/40 px-4 py-2.5">
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        Designation
                      </p>
                    </div>
                    <div className="bg-muted/40 px-4 py-2.5">
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        Experience
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-px bg-border/30">
                    <div className="bg-card px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                        <p className="text-sm font-medium text-foreground">
                          {member.company_name}
                        </p>
                      </div>
                    </div>
                    <div className="bg-card px-4 py-3">
                      <p className="text-sm text-foreground">
                        {member.designation || "-"}
                      </p>
                    </div>
                    <div className="bg-card px-4 py-3">
                      <p className="text-sm text-foreground">-</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 py-6 justify-center rounded-xl border border-dashed border-border/60 bg-muted/10">
                  <Briefcase className="h-4 w-4 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    No employment information provided.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Business and Services */}
          {member.has_business_services && member.business_services && (
            <section className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-teal-200 dark:hover:border-teal-800/50 hover:shadow-lg hover:shadow-teal-500/[0.04] transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/[0.03] via-transparent to-transparent pointer-events-none" />
              <div className="relative p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center ring-1 ring-teal-100 dark:ring-teal-900/40">
                    <Building2 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <h2 className="text-base font-semibold text-foreground">
                    Business and Services
                  </h2>
                </div>
                <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
                  <div className="grid grid-cols-2 gap-px bg-border/30">
                    <div className="bg-muted/40 px-4 py-2.5">
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        Service Name
                      </p>
                    </div>
                    <div className="bg-muted/40 px-4 py-2.5">
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        Description
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-px bg-border/30">
                    <div className="bg-card px-4 py-3">
                      <p className="text-sm font-medium text-foreground">
                        {member.business_services}
                      </p>
                    </div>
                    <div className="bg-card px-4 py-3">
                      <p className="text-sm text-muted-foreground">
                        {member.bio || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Right Column — Life & Memories */}
        <div className="space-y-6">
          {/* Current Life */}
          <section className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-violet-200 dark:hover:border-violet-800/50 hover:shadow-lg hover:shadow-violet-500/[0.04] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.03] via-transparent to-transparent pointer-events-none" />
            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center ring-1 ring-violet-100 dark:ring-violet-900/40">
                  <Briefcase className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <h2 className="text-base font-semibold text-foreground">
                  Current Life
                </h2>
              </div>
              <div className="space-y-0.5">
                <InfoRow
                  icon={HomeIcon}
                  label="Home district"
                  value={member.home_district}
                  iconColor="text-sky-500 bg-sky-50 dark:bg-sky-950/40"
                />
                <InfoRow
                  icon={GraduationCap}
                  label="Certificate"
                  value={member.academic_qualification}
                  iconColor="text-amber-500 bg-amber-50 dark:bg-amber-950/40"
                />
                <InfoRow
                  icon={Briefcase}
                  label="Designation"
                  value={member.designation}
                  iconColor="text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40"
                />
                <InfoRow
                  icon={Building2}
                  label="Company"
                  value={member.company_name}
                  iconColor="text-teal-500 bg-teal-50 dark:bg-teal-950/40"
                />
                <InfoRow
                  icon={Briefcase}
                  label="Occupation"
                  value={member.occupation}
                  iconColor="text-violet-500 bg-violet-50 dark:bg-violet-950/40"
                />
              </div>
            </div>
          </section>

          {/* School Memories */}
          <section className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-amber-200 dark:hover:border-amber-800/50 hover:shadow-lg hover:shadow-amber-500/[0.04] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] via-transparent to-transparent pointer-events-none" />
            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center ring-1 ring-amber-100 dark:ring-amber-900/40">
                  <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-base font-semibold text-foreground">
                  School Memories
                </h2>
              </div>
              <div className="space-y-0.5">
                <InfoRow
                  icon={UserIcon}
                  label="School Nick Name"
                  value={member.school_nick_name}
                  iconColor="text-pink-500 bg-pink-50 dark:bg-pink-950/40"
                />
                <InfoRow
                  icon={Heart}
                  label="Best Friend"
                  value={member.best_friend}
                  iconColor="text-rose-500 bg-rose-50 dark:bg-rose-950/40"
                />
                <InfoRow
                  icon={UserIcon}
                  label="Favorite Teacher"
                  value={member.favorite_teacher}
                  iconColor="text-blue-500 bg-blue-50 dark:bg-blue-950/40"
                />
                <InfoRow
                  icon={MapPin}
                  label="Sunset"
                  value={member.favorite_hangout}
                  iconColor="text-orange-500 bg-orange-50 dark:bg-orange-950/40"
                />
                <InfoRow
                  icon={HomeIcon}
                  label="School House"
                  value={member.school_house}
                  iconColor="text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
                />
              </div>
            </div>
          </section>

          {/* Memory Description */}
          {member.favorite_memory && (
            <section className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-pink-200 dark:hover:border-pink-800/50 hover:shadow-lg hover:shadow-pink-500/[0.04] transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/[0.03] via-transparent to-transparent pointer-events-none" />
              <div className="relative p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-950/40 flex items-center justify-center ring-1 ring-pink-100 dark:ring-pink-900/40">
                    <Heart className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <h2 className="text-base font-semibold text-foreground">
                    Memory description
                  </h2>
                </div>
                <div className="relative pl-4 border-l-2 border-pink-200 dark:border-pink-800/50">
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap italic">
                    {member.favorite_memory}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Bio */}
          {member.bio && (
            <section className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-emerald-200 dark:hover:border-emerald-800/50 hover:shadow-lg hover:shadow-emerald-500/[0.04] transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] via-transparent to-transparent pointer-events-none" />
              <div className="relative p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center ring-1 ring-emerald-100 dark:ring-emerald-900/40">
                    <UserIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h2 className="text-base font-semibold text-foreground">
                    About
                  </h2>
                </div>
                <div className="relative pl-4 border-l-2 border-emerald-200 dark:border-emerald-800/50">
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {member.bio}
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
