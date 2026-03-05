/* eslint-disable @next/next/no-img-element */
"use client";

import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import api from "@/lib/api";
import {
  ArrowDownAZ,
  ArrowUpDown,
  Calendar,
  Check,
  Clock,
  Expand,
  GripVertical,
  ImagePlus,
  Images,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface GalleryImage {
  id: number;
  filename: string;
  original_name: string;
  title: string | null;
  caption: string | null;
  alt_text: string | null;
  description: string | null;
  size: number;
  width: number | null;
  height: number | null;
  sort_order: number;
  url: string;
  created_at: string;
  updated_at: string;
}

interface StagedFile {
  id: string;
  file: File;
  preview: string;
}

type SortBy = "sort_order" | "created_at" | "updated_at" | "title";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

let _uid = 0;
function uid() {
  return "sf_" + ++_uid;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function GalleryManagement() {
  /* ---- Gallery state ---- */
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortBy>("sort_order");
  const [sortAsc, setSortAsc] = useState(true);

  /* ---- Upload popup state ---- */
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOverZone, setDragOverZone] = useState(false);
  const modalFileRef = useRef<HTMLInputElement>(null);
  const modalDragItem = useRef<number | null>(null);
  const modalDragOverItem = useRef<number | null>(null);

  /* ---- Drawer state ---- */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [updating, setUpdating] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [editAlt, setEditAlt] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const replaceFileRef = useRef<HTMLInputElement>(null);

  /* ---- Gallery DnD refs ---- */
  const galleryRef = useRef<HTMLDivElement>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  /* ================================================================ */
  /*  Fancybox                                                         */
  /* ================================================================ */

  /* Bind Fancybox on the gallery grid */
  useEffect(() => {
    const container = galleryRef.current;
    if (!container) return;
    Fancybox.bind(container, "[data-fancybox]", { dragToClose: true });
    return () => {
      Fancybox.unbind(container);
      Fancybox.close();
    };
  }, [images, sortBy, sortAsc]);

  /* Bind Fancybox globally for drawer preview (rendered in a portal) */
  useEffect(() => {
    Fancybox.bind("[data-fancybox='drawer-preview']", { dragToClose: true });
    return () => {
      Fancybox.unbind("[data-fancybox='drawer-preview']");
    };
  }, [selectedImage]);

  /* ================================================================ */
  /*  Fetch gallery                                                    */
  /* ================================================================ */

  const fetchImages = useCallback(async () => {
    try {
      const { data } = await api.get("/gallery");
      setImages(data);
    } catch {
      toast.error("Failed to load gallery images");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  /* ================================================================ */
  /*  Sorting                                                          */
  /* ================================================================ */

  const sorted = [...images].sort((a, b) => {
    let cmp = 0;
    switch (sortBy) {
      case "sort_order":
        cmp = a.sort_order - b.sort_order;
        break;
      case "created_at":
        cmp =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case "updated_at":
        cmp =
          new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        break;
      case "title":
        cmp = (a.title ?? "").localeCompare(b.title ?? "");
        break;
    }
    return sortAsc ? cmp : -cmp;
  });

  /* ================================================================ */
  /*  Upload Modal — Stage files                                       */
  /* ================================================================ */

  const addStagedFiles = (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (arr.length === 0) return;
    const newStaged: StagedFile[] = arr.map((f) => ({
      id: uid(),
      file: f,
      preview: URL.createObjectURL(f),
    }));
    setStagedFiles((prev) => [...prev, ...newStaged]);
  };

  const removeStagedFile = (id: string) => {
    setStagedFiles((prev) => {
      const found = prev.find((s) => s.id === id);
      if (found) URL.revokeObjectURL(found.preview);
      return prev.filter((s) => s.id !== id);
    });
  };

  const clearStaged = () => {
    stagedFiles.forEach((s) => URL.revokeObjectURL(s.preview));
    setStagedFiles([]);
  };

  /* Modal DnD reorder */
  const handleModalDragStart = (index: number) => {
    modalDragItem.current = index;
  };
  const handleModalDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    modalDragOverItem.current = index;
  };
  const handleModalDrop = () => {
    if (
      modalDragItem.current === null ||
      modalDragOverItem.current === null ||
      modalDragItem.current === modalDragOverItem.current
    )
      return;
    setStagedFiles((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(modalDragItem.current!, 1);
      copy.splice(modalDragOverItem.current!, 0, removed);
      return copy;
    });
    modalDragItem.current = null;
    modalDragOverItem.current = null;
  };

  /* Upload staged files to API */
  const handleSaveUpload = async () => {
    if (stagedFiles.length === 0) return;
    setUploading(true);
    try {
      const fd = new FormData();
      stagedFiles.forEach((s) => fd.append("images[]", s.file));
      const { data } = await api.post("/gallery", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImages((prev) => [...prev, ...data]);
      toast.success(
        `${data.length} image${data.length > 1 ? "s" : ""} uploaded`
      );
      clearStaged();
      setShowUploadModal(false);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  /* Close modal cleanup */
  const handleCloseModal = (open: boolean) => {
    if (!open) {
      clearStaged();
    }
    setShowUploadModal(open);
  };

  /* ================================================================ */
  /*  Drawer — Select & Edit                                           */
  /* ================================================================ */

  const openDrawer = (img: GalleryImage) => {
    setSelectedImage(img);
    setEditTitle(img.title ?? "");
    setEditCaption(img.caption ?? "");
    setEditAlt(img.alt_text ?? "");
    setEditDesc(img.description ?? "");
    setDrawerOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedImage) return;
    setUpdating(true);
    try {
      const { data } = await api.put(`/gallery/${selectedImage.id}`, {
        title: editTitle || null,
        caption: editCaption || null,
        alt_text: editAlt || null,
        description: editDesc || null,
      });
      setSelectedImage(data);
      toast.success("Image details updated");
      await fetchImages();
    } catch {
      toast.error("Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/gallery/${id}`);
      setImages((prev) => prev.filter((img) => img.id !== id));
      if (selectedImage?.id === id) {
        setSelectedImage(null);
        setDrawerOpen(false);
      }
      toast.success("Image removed");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleReplace = async (file: File) => {
    if (!selectedImage) return;
    setReplacing(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const { data } = await api.post(
        `/gallery/${selectedImage.id}/replace`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setSelectedImage(data);
      toast.success("Image replaced");
      await fetchImages();
    } catch {
      toast.error("Replace failed");
    } finally {
      setReplacing(false);
      if (replaceFileRef.current) replaceFileRef.current.value = "";
    }
  };

  /* ================================================================ */
  /*  Gallery DnD reorder                                              */
  /* ================================================================ */

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragOverItem.current = index;
  };
  const handleDrop = async () => {
    if (
      dragItem.current === null ||
      dragOverItem.current === null ||
      dragItem.current === dragOverItem.current
    )
      return;
    const reordered = [...images];
    const [removed] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOverItem.current, 0, removed);
    const updated = reordered.map((img, i) => ({ ...img, sort_order: i }));
    setImages(updated);
    dragItem.current = null;
    dragOverItem.current = null;
    try {
      await api.put("/gallery/reorder", {
        order: updated.map((img) => img.id),
      });
    } catch {
      toast.error("Reorder failed");
      fetchImages();
    }
  };

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  const inputCls =
    "h-9 text-sm bg-background border-border/60 focus:border-primary/40 rounded-lg";
  const textareaCls =
    "w-full text-sm px-3 py-2 bg-background border border-border/60 focus:border-primary/40 rounded-lg resize-none outline-none focus:ring-1 focus:ring-primary/20 transition-colors";

  return (
    <>
      <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 space-y-6">
        {/* -------------------------------------------------------- */}
        {/*  Header                                                   */}
        {/* -------------------------------------------------------- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm">
              <Images className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Gallery Management
              </h2>
              <p className="text-xs text-muted-foreground">
                Upload and manage your school memories photos
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="h-10 px-5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium cursor-pointer shadow-sm transition-all hover:shadow-md"
          >
            <ImagePlus className="h-4 w-4 mr-2" />
            Gallery
          </Button>
        </div>

        {/* -------------------------------------------------------- */}
        {/*  Loading                                                  */}
        {/* -------------------------------------------------------- */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/*  Empty state                                              */}
        {/* -------------------------------------------------------- */}
        {!loading && images.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
              <Images className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              No photos yet
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1 mb-4">
              Click &quot;Gallery&quot; to upload your school memories
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowUploadModal(true)}
              className="h-9 px-4 rounded-lg text-xs cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Upload Photos
            </Button>
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/*  Image Grid                                               */}
        {/* -------------------------------------------------------- */}
        {!loading && images.length > 0 && (
          <div ref={galleryRef}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {sorted.map((img, index) => (
                <div
                  key={img.id}
                  draggable={sortBy === "sort_order"}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={handleDrop}
                  onDragEnd={() => {
                    dragItem.current = null;
                    dragOverItem.current = null;
                  }}
                  onClick={() => openDrawer(img)}
                  className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                    selectedImage?.id === img.id && drawerOpen
                      ? "border-primary ring-2 ring-primary/20 scale-[0.97]"
                      : "border-transparent hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                  } ${sortBy === "sort_order" ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
                >
                  <img
                    src={img.url}
                    alt={img.alt_text || img.original_name}
                    className="w-full h-full object-cover block transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                  {/* Drag handle (top-left) */}
                  {sortBy === "sort_order" && (
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
                      <div className="w-7 h-7 rounded-lg bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10">
                        <GripVertical className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Fancybox expand (top-right) */}
                  <a
                    href={img.url}
                    data-fancybox="gallery"
                    data-caption={img.title || img.original_name}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="w-7 h-7 rounded-lg bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-white/20 transition-colors">
                      <Expand className="h-3.5 w-3.5 text-white" />
                    </div>
                  </a>

                  {/* Title overlay (bottom) */}
                  <div className="absolute inset-x-0 bottom-0 p-2.5 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
                    <p className="text-xs text-white font-medium truncate drop-shadow-sm">
                      {img.title || img.original_name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/*  Filter & Sort Bar                                        */}
        {/* -------------------------------------------------------- */}
        {!loading && images.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 pt-5 border-t border-border/40">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span className="font-medium">Sort by:</span>
            </div>
            {(
              [
                {
                  key: "sort_order",
                  label: "Manual Order",
                  icon: GripVertical,
                },
                { key: "created_at", label: "Upload Date", icon: Calendar },
                { key: "updated_at", label: "Last Modified", icon: Clock },
                { key: "title", label: "Title", icon: ArrowDownAZ },
              ] as const
            ).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (sortBy === key) {
                    setSortAsc(!sortAsc);
                  } else {
                    setSortBy(key);
                    setSortAsc(true);
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  sortBy === key
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                {sortBy === key && (
                  <span className="ml-0.5 text-[10px]">
                    {sortAsc ? "\u2191" : "\u2193"}
                  </span>
                )}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSortAsc(!sortAsc)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-all duration-150"
              >
                {sortAsc ? "Reverse Order" : "Keep Order"}
              </button>
              <span className="text-xs text-muted-foreground/60 tabular-nums">
                {images.length} image{images.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/*  UPLOAD POPUP MODAL                                           */}
      {/* ============================================================ */}
      <Dialog open={showUploadModal} onOpenChange={handleCloseModal}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0"
        >
          {/* Modal Header */}
          <DialogHeader className="px-6 pt-6 pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Upload className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-base">
                    Upload to Gallery
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    Select images, arrange them, then save to your gallery
                  </DialogDescription>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCloseModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </DialogHeader>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Drop zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverZone(true);
              }}
              onDragLeave={() => setDragOverZone(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverZone(false);
                if (e.dataTransfer.files.length > 0) {
                  addStagedFiles(e.dataTransfer.files);
                }
              }}
              onClick={() => modalFileRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                dragOverZone
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-border/60 hover:border-primary/40 hover:bg-muted/30"
              }`}
            >
              <input
                ref={modalFileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) addStagedFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    dragOverZone
                      ? "bg-primary/10"
                      : "bg-muted/50"
                  }`}
                >
                  <ImagePlus
                    className={`h-6 w-6 transition-colors ${
                      dragOverZone
                        ? "text-primary"
                        : "text-muted-foreground/50"
                    }`}
                  />
                </div>
                <p className="text-sm font-medium text-foreground/80">
                  {dragOverZone
                    ? "Drop images here"
                    : "Drag & drop images or click to browse"}
                </p>
                <p className="text-xs text-muted-foreground/60">
                  JPG, PNG, GIF, WebP up to 10MB each
                </p>
              </div>
            </div>

            {/* Staged preview grid */}
            {stagedFiles.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-foreground/70">
                    {stagedFiles.length} image
                    {stagedFiles.length !== 1 ? "s" : ""} selected
                  </p>
                  <button
                    type="button"
                    onClick={() => modalFileRef.current?.click()}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    Add More
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {stagedFiles.map((sf, index) => (
                    <div
                      key={sf.id}
                      draggable
                      onDragStart={() => handleModalDragStart(index)}
                      onDragOver={(e) => handleModalDragOver(e, index)}
                      onDrop={handleModalDrop}
                      className="group relative aspect-square rounded-lg overflow-hidden border border-border/40 cursor-grab active:cursor-grabbing hover:border-primary/30 transition-all duration-150"
                    >
                      <img
                        src={sf.preview}
                        alt={sf.file.name}
                        className="w-full h-full object-cover block"
                      />
                      {/* Drag handle */}
                      <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="w-5 h-5 rounded bg-black/50 backdrop-blur-sm flex items-center justify-center">
                          <GripVertical className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeStagedFile(sf.id);
                        }}
                        className="absolute top-1 right-1 w-5 h-5 rounded bg-red-500/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                      {/* File name */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <p className="text-[10px] text-white truncate">
                          {sf.file.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-border/40 flex items-center justify-between bg-muted/20">
            <button
              type="button"
              onClick={() => handleCloseModal(false)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <Button
              type="button"
              onClick={handleSaveUpload}
              disabled={uploading || stagedFiles.length === 0}
              className="h-9 px-5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium cursor-pointer shadow-sm transition-all hover:shadow-md disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              {uploading
                ? "Uploading..."
                : `Save ${stagedFiles.length > 0 ? `(${stagedFiles.length})` : ""}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/*  RIGHT DRAWER — Image Details                                 */}
      {/* ============================================================ */}
      <Sheet
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) setSelectedImage(null);
        }}
      >
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-[380px] sm:max-w-[380px] p-0 flex flex-col overflow-hidden"
        >
          {selectedImage && (
            <>
              {/* Drawer Header */}
              <SheetHeader className="px-5 pt-5 pb-3 border-b border-border/40">
                <div className="flex items-center justify-between">
                  <div>
                    <SheetTitle className="text-sm">Image Details</SheetTitle>
                    <SheetDescription className="text-xs">
                      View and edit image metadata
                    </SheetDescription>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </SheetHeader>

              {/* Drawer Body — scrollable */}
              <div className="flex-1 overflow-y-auto">
                {/* Preview */}
                <div className="p-5 pb-4">
                  <a
                    href={selectedImage.url}
                    data-fancybox="drawer-preview"
                    data-caption={
                      selectedImage.title || selectedImage.original_name
                    }
                    className="block rounded-xl overflow-hidden border border-border/40 cursor-zoom-in hover:border-primary/30 transition-colors group"
                  >
                    <img
                      src={selectedImage.url}
                      alt={
                        selectedImage.alt_text || selectedImage.original_name
                      }
                      className="w-full object-contain max-h-[200px] bg-muted/30 block transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </a>
                </div>

                {/* Metadata */}
                <div className="px-5 pb-4 space-y-2.5">
                  <p className="font-medium text-foreground text-sm truncate">
                    {selectedImage.original_name}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/30 rounded-lg p-2.5">
                      <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-0.5">
                        Upload Date
                      </p>
                      <p className="text-xs text-foreground/80">
                        {formatDate(selectedImage.created_at)}
                      </p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-2.5">
                      <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-0.5">
                        File Size
                      </p>
                      <p className="text-xs text-foreground/80">
                        {formatBytes(selectedImage.size)}
                      </p>
                    </div>
                    {selectedImage.width && selectedImage.height && (
                      <div className="bg-muted/30 rounded-lg p-2.5 col-span-2">
                        <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-0.5">
                          Resolution
                        </p>
                        <p className="text-xs text-foreground/80">
                          {selectedImage.width} &times; {selectedImage.height}{" "}
                          px
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hidden file input for replace */}
                <input
                  ref={replaceFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleReplace(file);
                  }}
                />

                {/* Action buttons */}
                <div className="px-5 pb-4 space-y-2">
                  {/* Change Image — full width prominent button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={replacing}
                    className="w-full h-9 rounded-lg text-xs cursor-pointer border-dashed border-2 hover:bg-primary/5 hover:border-primary/40 hover:text-primary transition-all"
                    onClick={() => replaceFileRef.current?.click()}
                  >
                    {replacing ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <ImagePlus className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    {replacing ? "Replacing..." : "Change Image"}
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9 rounded-lg text-xs cursor-pointer hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all"
                      onClick={() => {
                        const el =
                          document.getElementById("drawer-edit-title");
                        if (el) el.focus();
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1.5" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9 rounded-lg text-xs cursor-pointer hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:border-red-800 transition-all"
                      onClick={() => handleDelete(selectedImage.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Remove
                    </Button>
                  </div>
                </div>

                {/* Divider */}
                <div className="mx-5 border-t border-border/40" />

                {/* Edit fields */}
                <div className="p-5 space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground/70">
                      Title
                    </Label>
                    <Input
                      id="drawer-edit-title"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Give it a title..."
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground/70">
                      Caption
                    </Label>
                    <textarea
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      placeholder="Add a caption..."
                      rows={2}
                      className={textareaCls}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground/70">
                      Alt Text
                    </Label>
                    <Input
                      value={editAlt}
                      onChange={(e) => setEditAlt(e.target.value)}
                      placeholder="Describe the image..."
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground/70">
                      Description
                    </Label>
                    <textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      placeholder="Longer description..."
                      rows={3}
                      className={textareaCls}
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={handleUpdate}
                    disabled={updating}
                    className="w-full h-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium cursor-pointer shadow-sm transition-all hover:shadow-md"
                  >
                    {updating ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Check className="h-3.5 w-3.5 mr-2" />
                    )}
                    {updating ? "Saving..." : "Update"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
