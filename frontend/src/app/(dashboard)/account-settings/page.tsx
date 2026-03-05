"use client";

import GalleryManagement from "@/components/GalleryManagement";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  BookOpen,
  Briefcase,
  Camera,
  Check,
  Copy,
  Eye,
  EyeOff,
  GraduationCap,
  Globe,
  Heart,
  Loader2,
  Lock,
  Pencil,
  Phone,
  Plus,
  Shield,
  Star,
  Sunset,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface EmploymentRow {
  name: string;
  designation: string;
  experience: string;
}

interface ServiceRow {
  name: string;
  description: string;
}

interface ImageInfo {
  url: string | null;
  filename: string;
  date: string;
  size: string;
  dimensions: string;
}

type TabId = "profile" | "memories" | "password";

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "My Profile", icon: User },
  { id: "memories", label: "School Memories", icon: BookOpen },
  { id: "password", label: "Password", icon: Lock },
];

/* Field wrapper — defined outside the component to avoid remount on every render */
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-[13px] font-medium text-foreground/70">
        {label}
        {required && <span className="text-primary ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

const inputClass =
  "h-10 bg-background border-border/60 focus:border-primary/40 transition-colors";
const sectionHeadingClass =
  "flex items-center gap-2.5 text-sm font-semibold text-foreground uppercase tracking-wide";

export default function AccountSettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile fields
  const [schoolNickName, setSchoolNickName] = useState("");
  const [schoolHouse, setSchoolHouse] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [phone, setPhone] = useState("");
  const [currentCity, setCurrentCity] = useState("");
  const [homeDistrict, setHomeDistrict] = useState("");
  const [currentAddress, setCurrentAddress] = useState("");
  const [city, setCity] = useState("");
  const [currentCountry, setCurrentCountry] = useState("");
  const [academicQualification, setAcademicQualification] = useState("");
  const [designation, setDesignation] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Image dialog
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageInfo, setImageInfo] = useState<ImageInfo>({
    url: null,
    filename: "",
    date: "",
    size: "",
    dimensions: "",
  });
  const [imageTitle, setImageTitle] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [imageDescription, setImageDescription] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Previous Employment
  const [employmentRows, setEmploymentRows] = useState<EmploymentRow[]>([
    { name: "", designation: "", experience: "" },
  ]);

  // School Memories
  const [bestFriend, setBestFriend] = useState("");
  const [favoriteTeacher, setFavoriteTeacher] = useState("");
  const [favoriteHangout, setFavoriteHangout] = useState("");
  const [favoriteMemory, setFavoriteMemory] = useState("");

  // Business Services
  const [hasBusinessServices, setHasBusinessServices] = useState(false);
  const [serviceRows, setServiceRows] = useState<ServiceRow[]>([
    { name: "", description: "" },
  ]);

  // Social Links
  const [facebookUrl, setFacebookUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  // Emergency Contact
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [emergencyContactRelation, setEmergencyContactRelation] = useState("");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get("/user");
        const d = res.data;
        setSchoolNickName(d.school_nick_name || "");
        setSchoolHouse(d.school_house || "");
        setBloodGroup(d.blood_group || "");
        setPhone(d.phone || "");
        setCurrentCity(d.current_city || "");
        setHomeDistrict(d.home_district || "");
        setCurrentAddress(d.current_address || "");
        setCity(d.current_city || "");
        setCurrentCountry(d.current_country || "");
        setAcademicQualification(d.academic_qualification || "");
        setDesignation(d.designation || "");
        setCompanyName(d.company_name || "");
        setProfileImage(d.profile_image || d.school_photo || null);
        setBestFriend(d.best_friend || "");
        setFavoriteTeacher(d.favorite_teacher || "");
        setFavoriteHangout(d.favorite_hangout || "");
        setFavoriteMemory(d.favorite_memory || "");
        setHasBusinessServices(!!d.has_business_services);
        setFacebookUrl(d.facebook_url || "");
        setLinkedinUrl(d.linkedin_url || "");
        setEmergencyContactName(d.emergency_contact_name || "");
        setEmergencyContactPhone(d.emergency_contact_phone || "");
        setEmergencyContactRelation(d.emergency_contact_relation || "");
        if (d.business_services) {
          try {
            const parsed = JSON.parse(d.business_services);
            if (Array.isArray(parsed)) setServiceRows(parsed);
          } catch {
            setServiceRows([{ name: d.business_services, description: "" }]);
          }
        }
        if (d.company_name) {
          setEmploymentRows([
            {
              name: d.company_name,
              designation: d.designation || "",
              experience: "",
            },
          ]);
        }

        const imgUrl = d.profile_image || d.school_photo || null;
        if (imgUrl) {
          const parts = imgUrl.split("/");
          setImageInfo({
            url: imgUrl,
            filename: parts[parts.length - 1] || "profile-image",
            date: new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            size: "",
            dimensions: "",
          });
          setImageTitle(d.name || "");
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Image handlers
  const handleOpenImageDialog = () => {
    setShowImageDialog(true);
  };

  const handleDeleteImage = async () => {
    setDeletingImage(true);
    try {
      await api.delete("/profile/image");
      setProfileImage(null);
      setImageInfo({
        url: null,
        filename: "",
        date: "",
        size: "",
        dimensions: "",
      });
      setShowImageDialog(false);
      toast.success("Profile image deleted.");
    } catch {
      toast.error("Failed to delete image.");
    } finally {
      setDeletingImage(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await api.post("/profile/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = res.data;
      setProfileImage(data.image_url);
      setImageInfo({
        url: data.image_url,
        filename: data.filename || file.name,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        size: data.size ? formatFileSize(data.size) : formatFileSize(file.size),
        dimensions: data.dimensions || "",
      });
      setImageTitle(file.name.replace(/\.[^/.]+$/, ""));
      toast.success("Profile image updated.");
    } catch {
      toast.error("Failed to upload image.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCopyUrl = () => {
    if (imageInfo.url) {
      navigator.clipboard.writeText(imageInfo.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes";
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " Kb";
    return (bytes / (1024 * 1024)).toFixed(1) + " Mb";
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/profile", {
        phone,
        blood_group: bloodGroup,
        current_address: currentAddress,
        current_city: city,
        current_country: currentCountry,
        occupation: designation,
        company_name: employmentRows[0]?.name || companyName,
        designation: employmentRows[0]?.designation || designation,
        bio: "",
        facebook_url: facebookUrl || undefined,
        linkedin_url: linkedinUrl || undefined,
        whatsapp_number: "",
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone,
        emergency_contact_relation: emergencyContactRelation,
        favorite_memory: favoriteMemory,
        favorite_teacher: favoriteTeacher,
        favorite_hangout: favoriteHangout,
        business_services: hasBusinessServices
          ? JSON.stringify(serviceRows)
          : null,
        has_business_services: hasBusinessServices,
        school_nick_name: schoolNickName,
        best_friend: bestFriend,
        school_house: schoolHouse,
        home_district: homeDistrict,
        academic_qualification: academicQualification,
      });
      toast.success("Profile updated successfully.");
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setChangingPassword(true);
    try {
      await api.put("/password", {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      toast.success("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to change password.";
      toast.error(message);
    } finally {
      setChangingPassword(false);
    }
  };

  const addEmploymentRow = () =>
    setEmploymentRows([
      ...employmentRows,
      { name: "", designation: "", experience: "" },
    ]);
  const updateEmploymentRow = (
    i: number,
    field: keyof EmploymentRow,
    value: string,
  ) => {
    const rows = [...employmentRows];
    rows[i][field] = value;
    setEmploymentRows(rows);
  };
  const removeEmploymentRow = (i: number) => {
    if (employmentRows.length > 1)
      setEmploymentRows(employmentRows.filter((_, idx) => idx !== i));
  };
  const addServiceRow = () =>
    setServiceRows([...serviceRows, { name: "", description: "" }]);
  const updateServiceRow = (
    i: number,
    field: keyof ServiceRow,
    value: string,
  ) => {
    const rows = [...serviceRows];
    rows[i][field] = value;
    setServiceRows(rows);
  };
  const removeServiceRow = (i: number) => {
    if (serviceRows.length > 1)
      setServiceRows(serviceRows.filter((_, idx) => idx !== i));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Account Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your profile, memories, and security preferences.
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-2xl w-fit border border-border/40">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer",
              activeTab === tab.id
                ? "bg-card text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground hover:bg-card/50",
            )}
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ==================== MY PROFILE TAB ==================== */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile} className="space-y-10">
          {/* Profile Photo Section */}
          <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Photo with hover overlay */}
              <div className="relative w-28 h-32 rounded-2xl overflow-hidden border-2 border-border/40 bg-muted group shrink-0 shadow-sm">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Current"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                    <User className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenImageDialog}
                    className="w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-gray-700 transition-colors shadow cursor-pointer"
                    title="Edit Image"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteImage}
                    className="w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-red-600 transition-colors shadow cursor-pointer"
                    title="Remove Image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-foreground">
                  {user?.name || "Your Name"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Section {user?.section} &middot; Roll {user?.roll_number}
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-primary bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors cursor-pointer"
                >
                  <Camera className="h-4 w-4" />
                  Change Photo
                </button>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <section className="space-y-6">
            <div className={sectionHeadingClass}>
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              Personal Information
            </div>
            <div className="bg-[#f7f7f7] dark:bg-transparent border border-border/50 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Field label="School Nick Name">
                  <Input
                    value={schoolNickName}
                    onChange={(e) => setSchoolNickName(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="School House">
                  <Select value={schoolHouse} onValueChange={setSchoolHouse}>
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder="Select house" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Omar Khaiyam", "Nazrul", "Rabindranath", "Iqbal"].map(
                        (h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Blood Group" required>
                  <Select value={bloodGroup} onValueChange={setBloodGroup}>
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                        (bg) => (
                          <SelectItem key={bg} value={bg}>
                            {bg}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Field label="Phone">
                  <Input
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9+]/g, ''))}
                    className={inputClass}
                  />
                </Field>
                <Field label="Current City">
                  <Input
                    value={currentCity}
                    onChange={(e) => setCurrentCity(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Home District">
                  <Select value={homeDistrict} onValueChange={setHomeDistrict}>
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Dhaka",
                        "Chittagong",
                        "Rajshahi",
                        "Khulna",
                        "Sylhet",
                        "Barisal",
                        "Rangpur",
                        "Mymensingh",
                        "Comilla",
                        "Gazipur",
                        "Narayanganj",
                      ].map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </div>
          </section>

          {/* Current Location */}
          <section className="space-y-6">
            <div className={sectionHeadingClass}>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                <Globe className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              Current Location
            </div>
            <div className="bg-[#f7f7f7] dark:bg-transparent border border-border/50 rounded-2xl p-6 md:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Field label="Current Address">
                  <Input
                    value={currentAddress}
                    onChange={(e) => setCurrentAddress(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="City" required>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Country" required>
                  <Select
                    value={currentCountry}
                    onValueChange={setCurrentCountry}
                  >
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Bangladesh",
                        "Canada",
                        "USA",
                        "UK",
                        "Australia",
                        "UAE",
                        "Saudi Arabia",
                        "Germany",
                        "Malaysia",
                        "India",
                        "Singapore",
                        "Japan",
                        "Qatar",
                        "Oman",
                        "Kuwait",
                        "Bahrain",
                      ].map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </div>
          </section>

          {/* Career & Education */}
          <section className="space-y-6">
            <div className={sectionHeadingClass}>
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
                <Briefcase className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              Career & Education
            </div>
            <div className="bg-[#f7f7f7] dark:bg-transparent border border-border/50 rounded-2xl p-6 md:p-8 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Field label="Academic Qualification">
                  <Select
                    value={academicQualification}
                    onValueChange={setAcademicQualification}
                  >
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "SSC",
                        "HSC",
                        "Bachelor",
                        "Masters/Equivalent",
                        "PhD",
                        "Diploma",
                      ].map((q) => (
                        <SelectItem key={q} value={q}>
                          {q}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Current Work Position">
                  <Input
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Current Work Place">
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>

              {/* Previous Employment Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">
                    Previous Employment
                  </h3>
                  <button
                    type="button"
                    onClick={addEmploymentRow}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Row
                  </button>
                </div>
                <div className="border border-border/50 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/30 border-b border-border/50">
                        <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-8">
                          #
                        </th>
                        <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Organization
                        </th>
                        <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Designation
                        </th>
                        <th className="whitespace-nowrap text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-36">
                          Experience (years)
                        </th>
                        <th className="w-10" />
                      </tr>
                    </thead>
                    <tbody>
                      {employmentRows.map((row, i) => (
                        <tr
                          key={i}
                          className="border-b border-border/30 last:border-0"
                        >
                          <td className="px-4 py-2 text-muted-foreground text-xs">
                            {i + 1}
                          </td>
                          <td className="px-2 py-2">
                            <Input
                              value={row.name}
                              onChange={(e) =>
                                updateEmploymentRow(i, "name", e.target.value)
                              }
                              className="h-8 border-border/50 text-sm bg-[#FFF]"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <Input
                              value={row.designation}
                              onChange={(e) =>
                                updateEmploymentRow(
                                  i,
                                  "designation",
                                  e.target.value,
                                )
                              }
                              className="h-8 border-border/50 text-sm bg-[#FFF]"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <Input
                              value={row.experience}
                              onChange={(e) =>
                                updateEmploymentRow(
                                  i,
                                  "experience",
                                  e.target.value,
                                )
                              }
                              className="h-8 border-border/50 text-sm bg-[#FFF]"
                            />
                          </td>
                          <td className="px-2 py-2">
                            {employmentRows.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeEmploymentRow(i)}
                                className="text-muted-foreground hover:text-destructive p-1 transition-colors cursor-pointer"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* School Memories Quick Fields */}
          <section className="space-y-6">
            <div className={sectionHeadingClass}>
              <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center">
                <Heart className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              </div>
              School Memories
            </div>
            <div className="bg-[#f7f7f7] dark:bg-transparent border border-border/50 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <Field label="Best Friend in School">
                  <Input
                    value={bestFriend}
                    onChange={(e) => setBestFriend(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Favourite Teacher">
                  <Input
                    value={favoriteTeacher}
                    onChange={(e) => setFavoriteTeacher(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Have you bonded sunset?">
                  <Select
                    value={favoriteHangout}
                    onValueChange={setFavoriteHangout}
                  >
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Favourite MRA">
                  <Input value="" onChange={() => {}} className={inputClass} />
                </Field>
              </div>

              <Field label="Write your memories about school">
                <RichTextEditor
                  value={favoriteMemory}
                  onChange={setFavoriteMemory}
                  placeholder="Write your memories here..."
                  rows={6}
                />
              </Field>
            </div>
          </section>

          {/* Business Services */}
          <section className="space-y-6">
            <div className={sectionHeadingClass}>
              <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center">
                <Briefcase className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
              </div>
              Business Services
            </div>
            <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground/80">
                  Do you own any business to provide service for your friends?
                </p>
                <button
                  type="button"
                  onClick={() => setHasBusinessServices(!hasBusinessServices)}
                  className={cn(
                    "relative w-11 h-6 rounded-full transition-colors cursor-pointer",
                    hasBusinessServices
                      ? "bg-primary"
                      : "bg-muted-foreground/20",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform",
                      hasBusinessServices ? "left-6" : "left-1",
                    )}
                  />
                </button>
              </div>
              {hasBusinessServices && (
                <div className="space-y-4 pt-2">
                  <p className="text-sm text-muted-foreground">
                    List the services you want to provide:
                  </p>
                  {serviceRows.map((row, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-4 p-5 border border-border/40 rounded-xl bg-muted/5"
                    >
                      <Field label="Service Name">
                        <Input
                          value={row.name}
                          onChange={(e) =>
                            updateServiceRow(i, "name", e.target.value)
                          }
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Description">
                        <textarea
                          value={row.description}
                          onChange={(e) =>
                            updateServiceRow(i, "description", e.target.value)
                          }
                          rows={3}
                          className="w-full rounded-xl border border-border/50 px-3 py-2 text-sm bg-background focus:outline-none focus:border-primary/40 resize-none transition-colors"
                        />
                      </Field>
                      <div className="flex items-start pt-8">
                        {serviceRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeServiceRow(i)}
                            className="text-muted-foreground hover:text-destructive p-1.5 transition-colors cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addServiceRow}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add New Service
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Social Links */}
          <section className="space-y-6">
            <div className={sectionHeadingClass}>
              <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/40 flex items-center justify-center">
                <Globe className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
              </div>
              Social Links
            </div>
            <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="space-y-2">
                  <Label className="text-[13px] font-medium text-foreground/70 inline-flex items-center gap-1.5">
                    <svg
                      className="h-4 w-4 text-[#1877F2]"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </Label>
                  <Input
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    placeholder="https://facebook.com"
                    className={inputClass + " text-sm"}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[13px] font-medium text-foreground/70 inline-flex items-center gap-1.5">
                    <svg
                      className="h-4 w-4 text-[#0A66C2]"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    LinkedIn
                  </Label>
                  <Input
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com"
                    className={inputClass + " text-sm"}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[13px] font-medium text-foreground/70 inline-flex items-center gap-1.5">
                    <svg
                      className="h-4 w-4 text-[#E4405F]"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.88 0 1.441 1.441 0 012.88 0z" />
                    </svg>
                    Instagram
                  </Label>
                  <Input
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="https://instagram.com"
                    className={inputClass + " text-sm"}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[13px] font-medium text-foreground/70 inline-flex items-center gap-1.5">
                    <svg
                      className="h-4 w-4 text-[#FF0000]"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    YouTube
                  </Label>
                  <Input
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com"
                    className={inputClass + " text-sm"}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Emergency Contact */}
          <section className="space-y-6">
            <div className={sectionHeadingClass}>
              <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center">
                <Phone className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
              </div>
              Emergency Contact
            </div>
            <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Field label="Contact Person">
                  <Input
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Phone Number">
                  <Input
                    type="tel"
                    inputMode="numeric"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value.replace(/[^0-9+]/g, ''))}
                    className={inputClass}
                  />
                </Field>
                <Field label="Relation">
                  <Input
                    value={emergencyContactRelation}
                    onChange={(e) =>
                      setEmergencyContactRelation(e.target.value)
                    }
                    placeholder="Spouse"
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className="flex items-center gap-4 pt-2">
            <Button
              type="submit"
              disabled={saving}
              className="h-11 px-8 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold cursor-pointer shadow-sm"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Changes
              {!saving && <ArrowUpRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </form>
      )}

      {/* ==================== SCHOOL MEMORIES TAB ==================== */}
      {activeTab === "memories" && (
        <form onSubmit={handleSaveProfile} className="space-y-8">
          <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <Field label="Best Friend in School">
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
                  <Input
                    value={bestFriend}
                    onChange={(e) => setBestFriend(e.target.value)}
                    className={inputClass + " pl-9"}
                  />
                </div>
              </Field>
              <Field label="Favourite Teacher">
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
                  <Input
                    value={favoriteTeacher}
                    onChange={(e) => setFavoriteTeacher(e.target.value)}
                    className={inputClass + " pl-9"}
                  />
                </div>
              </Field>
              <Field label="Have you bonded sunset?">
                <div className="relative">
                  <Sunset className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none z-10" />
                  <Select
                    value={favoriteHangout}
                    onValueChange={setFavoriteHangout}
                  >
                    <SelectTrigger className={inputClass + " pl-9"}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Field>
              <Field label="Favourite MRA">
                <div className="relative">
                  <Star className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
                  <Input value="" onChange={() => {}} className={inputClass + " pl-9"} />
                </div>
              </Field>
            </div>

            <Field label="Write your memories about school">
              <RichTextEditor
                value={favoriteMemory}
                onChange={setFavoriteMemory}
                placeholder="Write your memories here..."
                rows={10}
              />
            </Field>
          </div>

          <GalleryManagement />

          <Button
            type="submit"
            disabled={saving}
            className="h-11 px-8 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold cursor-pointer shadow-sm"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save Changes
            {!saving && <ArrowUpRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>
      )}

      {/* ==================== PASSWORD TAB ==================== */}
      {activeTab === "password" && (
        <form onSubmit={handleChangePassword} className="max-w-xl space-y-8">
          <div className="bg-[#f7f7f7] dark:bg-transparent border border-border/50 rounded-2xl p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Change Password
                </h2>
                <p className="text-xs text-muted-foreground">
                  Ensure your account uses a strong password.
                </p>
              </div>
            </div>

            <Field label="Current Password">
              <div className="relative">
                <Input
                  type={showCurrentPw ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="h-11 bg-background border-border/60 focus:border-primary/40 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="New Password">
                <div className="relative">
                  <Input
                    type={showNewPw ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="h-11 bg-background border-border/60 focus:border-primary/40 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                  >
                    {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
              <Field label="Confirm Password">
                <div className="relative">
                  <Input
                    type={showConfirmPw ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-11 bg-background border-border/60 focus:border-primary/40 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                  >
                    {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
            </div>
          </div>

          <Button
            type="submit"
            disabled={changingPassword}
            className="h-11 px-8 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold cursor-pointer shadow-sm"
          >
            {changingPassword && (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            )}
            Update Password
            {!changingPassword && <ArrowUpRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* ==================== EDIT IMAGE DIALOG ==================== */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Image</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col sm:flex-row gap-6 pt-2">
            <div
              className="w-40 h-44 rounded-xl overflow-hidden border-2 border-border/40 bg-muted shrink-0 cursor-pointer relative group/img shadow-sm"
              onClick={() => fileInputRef.current?.click()}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                  <User className="h-12 w-12" />
                </div>
              )}
              {uploadingImage && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  Click to change
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-1.5 text-sm">
              <p className="font-semibold text-foreground">
                {imageInfo.filename || "No image"}
              </p>
              {imageInfo.date && (
                <p className="text-muted-foreground text-xs">
                  {imageInfo.date}
                </p>
              )}
              {imageInfo.size && (
                <p className="text-muted-foreground text-xs">
                  {imageInfo.size}
                </p>
              )}
              {imageInfo.dimensions && (
                <p className="text-muted-foreground text-xs">
                  {imageInfo.dimensions} pixels
                </p>
              )}
              <div className="flex items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary hover:text-primary/80 text-xs font-medium cursor-pointer transition-colors"
                >
                  Edit Image
                </button>
                <button
                  type="button"
                  onClick={handleDeleteImage}
                  disabled={deletingImage}
                  className="text-destructive hover:text-destructive/80 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {deletingImage ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                  Delete permanently
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-5 border-t border-border/50 mt-4">
            <div className="grid grid-cols-[80px_1fr] items-start gap-4">
              <Label className="text-sm text-muted-foreground text-right pt-2.5">
                Alt Text
              </Label>
              <div>
                <textarea
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-border/50 px-3 py-2 text-sm bg-background focus:outline-none focus:border-primary/40 resize-none transition-colors"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  <span className="text-primary cursor-pointer hover:underline">
                    Learn how to describe the purpose of the image
                  </span>
                  . Leave empty if decorative.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-[80px_1fr] items-center gap-4">
              <Label className="text-sm text-muted-foreground text-right">
                Title
              </Label>
              <Input
                value={imageTitle}
                onChange={(e) => setImageTitle(e.target.value)}
                className="h-9 border-border/50 text-sm"
              />
            </div>
            <div className="grid grid-cols-[80px_1fr] items-start gap-4">
              <Label className="text-sm text-muted-foreground text-right pt-2.5">
                Caption
              </Label>
              <textarea
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-border/50 px-3 py-2 text-sm bg-background focus:outline-none focus:border-primary/40 resize-none transition-colors"
              />
            </div>
            <div className="grid grid-cols-[80px_1fr] items-start gap-4">
              <Label className="text-sm text-muted-foreground text-right pt-2.5">
                Description
              </Label>
              <textarea
                value={imageDescription}
                onChange={(e) => setImageDescription(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-border/50 px-3 py-2 text-sm bg-background focus:outline-none focus:border-primary/40 resize-none transition-colors"
              />
            </div>
            <div className="grid grid-cols-[80px_1fr] items-center gap-4">
              <Label className="text-sm text-muted-foreground text-right">
                File URL
              </Label>
              <div>
                <Input
                  value={imageInfo.url || ""}
                  readOnly
                  className="h-9 border-border/50 text-sm bg-muted/20 text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="mt-2 text-xs text-muted-foreground hover:text-foreground border border-border/50 rounded-lg px-3 py-1.5 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  {copied ? "Copied!" : "Copy URL to clipboard"}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border/50 mt-2">
            <Button
              type="button"
              onClick={() => setShowImageDialog(false)}
              className="h-10 px-6 rounded-xl bg-foreground text-background hover:bg-foreground/90 text-sm font-semibold cursor-pointer"
            >
              Update Image
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
