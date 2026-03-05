'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Briefcase, MapPin, Loader2, FolderOpen, Sparkles, Building2, FileText, Tag, Send, Paperclip, Monitor, ShoppingCart, Megaphone, GraduationCap, Stethoscope, Landmark, Plane, Utensils, Factory, Palette, Scale, Wheat, Wrench, LayoutGrid, List, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { RichTextEditor } from '@/components/RichTextEditor';

interface Notice {
  id: number;
  title: string;
  requirement_type: string;
  industry: string;
  location: string;
  details: string;
  status: string;
  created_at: string;
  user: { alumni_record: { first_name: string; last_name: string } };
}

export default function ProfessionalConnectionPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [requirementType, setRequirementType] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [details, setDetails] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [readMoreId, setReadMoreId] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    api.get('/professional-notices')
      .then((res) => setNotices(res.data))
      .catch(() => toast.error('Failed to load professional notices.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      if (requirementType) formData.append('requirement_type', requirementType);
      if (industry) formData.append('industry', industry);
      if (location) formData.append('location', location);
      formData.append('details', details);
      if (attachment) formData.append('attachment', attachment);

      const res = await api.post('/professional-notices', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setNotices((prev) => [res.data, ...prev]);
      window.dispatchEvent(new Event("notifications:refresh"));
      toast.success('Professional notice created successfully.');
      setSheetOpen(false);
      setTitle('');
      setRequirementType('');
      setIndustry('');
      setLocation('');
      setDetails('');
      setAttachment(null);
    } catch {
      toast.error('Failed to create notice.');
    } finally {
      setSubmitting(false);
    }
  };

  const industryIcon = (industry: string): { icon: LucideIcon; bg: string; color: string } => {
    const key = industry.toLowerCase();
    if (key.includes('tech') || key.includes('software') || key.includes('it'))
      return { icon: Monitor, bg: 'bg-blue-500/10', color: 'text-blue-500' };
    if (key.includes('trade') || key.includes('commerce') || key.includes('retail') || key.includes('export') || key.includes('import'))
      return { icon: ShoppingCart, bg: 'bg-orange-500/10', color: 'text-orange-500' };
    if (key.includes('marketing') || key.includes('advertising') || key.includes('media'))
      return { icon: Megaphone, bg: 'bg-pink-500/10', color: 'text-pink-500' };
    if (key.includes('educ') || key.includes('training') || key.includes('edtech'))
      return { icon: GraduationCap, bg: 'bg-indigo-500/10', color: 'text-indigo-500' };
    if (key.includes('health') || key.includes('medical') || key.includes('pharma'))
      return { icon: Stethoscope, bg: 'bg-emerald-500/10', color: 'text-emerald-500' };
    if (key.includes('finance') || key.includes('bank') || key.includes('invest') || key.includes('accounting'))
      return { icon: Landmark, bg: 'bg-yellow-500/10', color: 'text-yellow-500' };
    if (key.includes('travel') || key.includes('tour') || key.includes('hospitality'))
      return { icon: Plane, bg: 'bg-sky-500/10', color: 'text-sky-500' };
    if (key.includes('food') || key.includes('restaurant') || key.includes('beverage'))
      return { icon: Utensils, bg: 'bg-amber-500/10', color: 'text-amber-500' };
    if (key.includes('manufactur') || key.includes('industrial') || key.includes('garment'))
      return { icon: Factory, bg: 'bg-slate-500/10', color: 'text-slate-500' };
    if (key.includes('design') || key.includes('creative') || key.includes('art'))
      return { icon: Palette, bg: 'bg-purple-500/10', color: 'text-purple-500' };
    if (key.includes('law') || key.includes('legal'))
      return { icon: Scale, bg: 'bg-rose-500/10', color: 'text-rose-500' };
    if (key.includes('agri') || key.includes('farm'))
      return { icon: Wheat, bg: 'bg-lime-500/10', color: 'text-lime-500' };
    if (key.includes('engineer') || key.includes('construction') || key.includes('real estate'))
      return { icon: Wrench, bg: 'bg-teal-500/10', color: 'text-teal-500' };
    return { icon: Briefcase, bg: 'bg-primary/10', color: 'text-primary' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Professional Notices</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Share and browse professional requirements within the community
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all duration-200 ${viewMode === 'grid' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all duration-200 ${viewMode === 'list' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0 gap-0">
            {/* Header */}
            <div className="relative px-6 pt-6 pb-5 border-b border-border/50">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3 pointer-events-none" />
              <div className="relative flex items-start gap-3.5">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <SheetHeader className="p-0 gap-0.5">
                  <SheetTitle className="text-lg">New Professional Notice</SheetTitle>
                  <SheetDescription>
                    Share a professional requirement with the alumni community.
                  </SheetDescription>
                </SheetHeader>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
              <div className="px-6 py-6 space-y-5">
                {/* Title */}
                <div className="space-y-2">
                  <Label className="text-[13px] font-medium text-foreground/70 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    Title <span className="text-primary">*</span>
                  </Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Looking for Web Developer"
                    required
                    className="h-10 bg-background border-border/60 focus:border-primary/40 transition-colors"
                  />
                </div>

                {/* Type & Industry — side by side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[13px] font-medium text-foreground/70 flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                      Requirement Type
                    </Label>
                    <Select value={requirementType} onValueChange={setRequirementType}>
                      <SelectTrigger className="h-10 bg-background border-border/60 focus:border-primary/40 transition-colors">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Job">Job</SelectItem>
                        <SelectItem value="Service">Service</SelectItem>
                        <SelectItem value="Partnership">Partnership</SelectItem>
                        <SelectItem value="Investment">Investment</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[13px] font-medium text-foreground/70 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      Industry
                    </Label>
                    <Input
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="e.g., Technology"
                      className="h-10 bg-background border-border/60 focus:border-primary/40 transition-colors"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label className="text-[13px] font-medium text-foreground/70 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    Location
                  </Label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Dhaka, Bangladesh"
                    className="h-10 bg-background border-border/60 focus:border-primary/40 transition-colors"
                  />
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <Label className="text-[13px] font-medium text-foreground/70 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    Details <span className="text-primary">*</span>
                  </Label>
                  <RichTextEditor
                    value={details}
                    onChange={setDetails}
                    placeholder="Describe your requirement in detail..."
                    rows={5}
                  />
                </div>

                {/* File Attachment */}
                <div className="space-y-2">
                  <Label className="text-[13px] font-medium text-foreground/70 flex items-center gap-1.5">
                    <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                    Attachment
                  </Label>
                  <Input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && file.size > 64 * 1024 * 1024) {
                        toast.error('File size exceeds 64 MB limit.');
                        e.target.value = '';
                        setAttachment(null);
                      } else {
                        setAttachment(file || null);
                      }
                    }}
                    className="h-10 bg-background border-border/60 focus:border-primary/40 transition-colors file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-xs file:font-medium file:text-primary hover:file:bg-primary/20 cursor-pointer"
                  />
                  <p className="text-[11px] text-muted-foreground">Max. file size: 64 MB</p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-auto border-t border-border/50 px-6 py-4 bg-muted/20">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium gap-2"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Submit Notice
                </Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : notices.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <FolderOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No connections found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Be the first to share a professional notice with the community.
            </p>
            <Button
              onClick={() => setSheetOpen(true)}
              className="rounded-full bg-primary text-primary-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Entry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-4'}>
          {notices.slice(0, visibleCount).map((notice) => {
            const { icon: Icon, bg, color } = industryIcon(notice.industry);
            return (
            <Card key={notice.id} className={`border border-border shadow-sm group relative overflow-hidden hover:shadow-lg hover:-translate-y-px transition-all duration-300 ${viewMode === 'grid' ? 'flex flex-col' : ''}`}>
              {/* Left accent strip */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 opacity-50 group-hover:opacity-100 transition-opacity duration-300 ${color.replace('text-', 'bg-')}`}
              />
              {/* Subtle gradient overlay */}
              <div
                className={`absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-300 pointer-events-none`}
              />

              <CardContent className={`p-5 pl-6 relative ${viewMode === 'grid' ? 'flex flex-col flex-1' : ''}`}>
                <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center shrink-0 ring-1 ring-border/20 group-hover:scale-105 transition-transform duration-200`}>
                        <Icon className={`h-5 w-5 ${color}`} />
                      </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold text-foreground group-hover:text-primary/90 transition-colors duration-200">{notice.title}</h3>
                      <Badge variant="secondary" className="shrink-0">{notice.requirement_type}</Badge>
                    </div>
                    {(notice.industry || notice.location) && (
                      <div className="flex items-center gap-4 mt-1">
                        {notice.industry && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Briefcase className="h-3 w-3" /> {notice.industry}
                          </span>
                        )}
                        {notice.location && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" /> {notice.location}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description: Grid = clamp-2 + Read More, List = clamp-3 */}
                {viewMode === 'grid' ? (
                  <div className="mt-3 flex-1">
                    <div
                      className="text-sm text-muted-foreground max-w-none [&_p]:m-0 [&_ul]:m-0 [&_ul]:pl-5 [&_ul]:list-disc [&_ol]:m-0 [&_ol]:pl-5 [&_ol]:list-decimal [&_li]:m-0 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: notice.details }}
                    />
                    {notice.details && notice.details.length > 80 && (
                      <button
                        onClick={() => setReadMoreId(notice.id)}
                        className="text-xs text-primary hover:text-primary/80 font-medium mt-1.5 transition-colors"
                      >
                        Read More
                      </button>
                    )}
                  </div>
                ) : (
                  <div
                    className="text-sm text-muted-foreground mt-3 max-w-none [&_p]:m-0 [&_ul]:m-0 [&_ul]:pl-5 [&_ul]:list-disc [&_ol]:m-0 [&_ol]:pl-5 [&_ol]:list-decimal [&_li]:m-0 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: notice.details }}
                  />
                )}
              </CardContent>
            </Card>
            );
          })}
        </div>

        {visibleCount < notices.length && (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              onClick={() => setVisibleCount((c) => c + 10)}
            >
              View More
            </Button>
          </div>
        )}

        {/* Read More Dialog */}
        {readMoreId !== null && (() => {
          const selectedNotice = notices.find(n => n.id === readMoreId);
          if (!selectedNotice) return null;
          const { icon: SelIcon, bg: selBg, color: selColor } = industryIcon(selectedNotice.industry);
          return (
            <Dialog open={true} onOpenChange={() => setReadMoreId(null)}>
              <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg ${selBg} flex items-center justify-center shrink-0`}>
                      <SelIcon className={`h-4 w-4 ${selColor}`} />
                    </div>
                    <div>
                      <DialogTitle className="text-base">{selectedNotice.title}</DialogTitle>
                      <div className="flex items-center gap-3 mt-0.5">
                        {selectedNotice.industry && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Briefcase className="h-3 w-3" /> {selectedNotice.industry}
                          </span>
                        )}
                        {selectedNotice.location && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {selectedNotice.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </DialogHeader>
                <div
                  className="text-sm text-foreground/80 max-w-none [&_p]:mb-2 [&_ul]:mb-2 [&_ul]:pl-5 [&_ul]:list-disc [&_ol]:mb-2 [&_ol]:pl-5 [&_ol]:list-decimal [&_li]:mb-1 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: selectedNotice.details }}
                />
              </DialogContent>
            </Dialog>
          );
        })()}
        </>
      )}
    </div>
  );
}
