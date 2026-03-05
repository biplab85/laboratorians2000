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
import { Plus, AlertTriangle, Loader2, FolderOpen, Phone, User, MapPin, Calendar, FileText, Send, ShieldAlert, Paperclip, Droplets, CarFront, Skull, Search, CloudLightning, HeartPulse, LayoutGrid, List } from 'lucide-react';
import { RichTextEditor } from '@/components/RichTextEditor';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function UrgentSectionPage() {
  const [requests, setRequests] = useState<Array<{
    id: number;
    title: string;
    type_of_emergency: string;
    urgency_level: string;
    date_needed: string;
    location: string;
    contact_person: string;
    contact_number: string;
    description: string;
    status: string;
    created_at: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [emergencyType, setEmergencyType] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState('');
  const [dateNeeded, setDateNeeded] = useState('');
  const [location, setLocation] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [readMoreId, setReadMoreId] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    api.get('/urgent-requests')
      .then((res) => setRequests(res.data))
      .catch(() => toast.error('Failed to load urgent requests.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('type_of_emergency', emergencyType);
      formData.append('urgency_level', urgencyLevel);
      if (dateNeeded) formData.append('date_needed', dateNeeded);
      if (location) formData.append('location', location);
      if (contactPerson) formData.append('contact_person', contactPerson);
      if (contactNumber) formData.append('contact_number', contactNumber);
      formData.append('description', description);
      if (attachment) formData.append('attachment', attachment);

      const res = await api.post('/urgent-requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setRequests((prev) => [res.data, ...prev]);
      window.dispatchEvent(new Event("notifications:refresh"));
      toast.success('Urgent request submitted successfully.');
      setSheetOpen(false);
      resetForm();
    } catch {
      toast.error('Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setEmergencyType('');
    setUrgencyLevel('');
    setDateNeeded('');
    setLocation('');
    setContactPerson('');
    setContactNumber('');
    setDescription('');
    setAttachment(null);
  };

  const urgencyColor = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      default: return 'secondary';
    }
  };

  const emergencyIcon = (type: string) => {
    switch (type) {
      case 'Blood Donation': return { icon: Droplets, bg: 'bg-red-500/10', color: 'text-red-500' };
      case 'Accident': return { icon: CarFront, bg: 'bg-orange-500/10', color: 'text-orange-500' };
      case 'Death News': return { icon: Skull, bg: 'bg-slate-500/10', color: 'text-slate-500' };
      case 'Missing Person': return { icon: Search, bg: 'bg-amber-500/10', color: 'text-amber-500' };
      case 'Natural Disaster': return { icon: CloudLightning, bg: 'bg-sky-500/10', color: 'text-sky-500' };
      case 'Medical Emergency': return { icon: HeartPulse, bg: 'bg-pink-500/10', color: 'text-pink-500' };
      default: return { icon: AlertTriangle, bg: 'bg-destructive/10', color: 'text-destructive' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Urgent Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Submit and view emergency community requests
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
              <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-orange-500/3 pointer-events-none" />
              <div className="relative flex items-start gap-3.5">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center ring-1 ring-destructive/20">
                  <ShieldAlert className="h-5 w-5 text-destructive" />
                </div>
                <SheetHeader className="p-0 gap-0.5">
                  <SheetTitle className="text-lg">New Urgent Request</SheetTitle>
                  <SheetDescription>
                    Submit an emergency request to the alumni community.
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
                    Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Blood Donation Needed Urgently"
                    required
                    className="h-10 bg-background border-border/60 focus:border-primary/40 transition-colors"
                  />
                </div>

                {/* Emergency Type & Urgency Level */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[13px] font-medium text-foreground/70 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
                      Emergency Type <span className="text-destructive">*</span>
                    </Label>
                    <Select value={emergencyType} onValueChange={setEmergencyType}>
                      <SelectTrigger className="h-10 bg-background border-border/60 focus:border-primary/40 transition-colors">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Blood Donation">Blood Donation</SelectItem>
                        <SelectItem value="Accident">Accident</SelectItem>
                        <SelectItem value="Death News">Death News</SelectItem>
                        <SelectItem value="Missing Person">Missing Person</SelectItem>
                        <SelectItem value="Natural Disaster">Natural Disaster</SelectItem>
                        <SelectItem value="Medical Emergency">Medical Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[13px] font-medium text-foreground/70 flex items-center gap-1.5">
                      <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" />
                      Urgency Level <span className="text-destructive">*</span>
                    </Label>
                    <Select value={urgencyLevel} onValueChange={setUrgencyLevel}>
                      <SelectTrigger className="h-10 bg-background border-border/60 focus:border-primary/40 transition-colors">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Date Needed & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[13px] font-medium text-foreground/70 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      Date Needed
                    </Label>
                    <Input
                      type="date"
                      value={dateNeeded}
                      onChange={(e) => setDateNeeded(e.target.value)}
                      className="h-10 bg-background border-border/60 focus:border-primary/40 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] font-medium text-foreground/70 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      Location
                    </Label>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., Dhaka Medical"
                      className="h-10 bg-background border-border/60 focus:border-primary/40 transition-colors"
                    />
                  </div>
                </div>

                {/* Contact Person & Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[13px] font-medium text-foreground/70 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      Contact Person
                    </Label>
                    <Input
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="Contact name"
                      className="h-10 bg-background border-border/60 focus:border-primary/40 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] font-medium text-foreground/70 flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      Contact Number
                    </Label>
                    <Input
                      type="tel"
                      inputMode="numeric"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value.replace(/[^0-9+]/g, ''))}
                      placeholder="+880..."
                      className="h-10 bg-background border-border/60 focus:border-primary/40 transition-colors"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label className="text-[13px] font-medium text-foreground/70 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <RichTextEditor
                    value={description}
                    onChange={setDescription}
                    placeholder="Describe the emergency situation..."
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
                  Submit Request
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
      ) : requests.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <FolderOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No urgent needs found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Fortunately, there are no urgent requests at the moment.
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
          {requests.slice(0, visibleCount).map((req) => {
            const { icon: Icon, bg, color } = emergencyIcon(req.type_of_emergency);
            const accentHex = ({
              'Blood Donation': '#ef4444',
              'Accident': '#f97316',
              'Death News': '#64748b',
              'Missing Person': '#f59e0b',
              'Natural Disaster': '#0ea5e9',
              'Medical Emergency': '#ec4899',
            } as Record<string, string>)[req.type_of_emergency] || '#ef4444';

            return (
              <Card key={req.id} className={`border border-border shadow-sm group relative overflow-hidden hover:shadow-lg hover:-translate-y-px transition-all duration-300 ${viewMode === 'grid' ? 'flex flex-col' : ''}`}>
                {/* Left accent strip */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 opacity-50 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ backgroundColor: accentHex }}
                />
                {/* Subtle gradient overlay */}
                <div
                  className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-300 pointer-events-none"
                  style={{ backgroundImage: `linear-gradient(135deg, ${accentHex} 0%, transparent 50%)` }}
                />

                <CardContent className={`p-5 pl-6 relative ${viewMode === 'grid' ? 'flex flex-col flex-1' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center shrink-0 ring-1 ring-border/20 group-hover:scale-105 transition-transform duration-200`}>
                        <Icon className={`h-5 w-5 ${color}`} />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-foreground group-hover:text-primary/90 transition-colors duration-200">{req.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{req.type_of_emergency}</p>
                      </div>
                    </div>
                    <Badge variant={urgencyColor(req.urgency_level) as 'destructive' | 'secondary'}>
                      {req.urgency_level === 'critical' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
                      )}
                      {req.urgency_level}
                    </Badge>
                  </div>

                  {/* Description: Grid = clamp-2 + Read More, List = clamp-3 */}
                  {viewMode === 'grid' ? (
                    <div className="mt-3 flex-1">
                      <div
                        className="text-sm text-muted-foreground max-w-none [&_p]:m-0 [&_ul]:m-0 [&_ul]:pl-5 [&_ul]:list-disc [&_ol]:m-0 [&_ol]:pl-5 [&_ol]:list-decimal [&_li]:m-0 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: req.description }}
                      />
                      {req.description && req.description.length > 80 && (
                        <button
                          onClick={() => setReadMoreId(req.id)}
                          className="text-xs text-primary hover:text-primary/80 font-medium mt-1.5 transition-colors"
                        >
                          Read More
                        </button>
                      )}
                    </div>
                  ) : (
                    <div
                      className="text-sm text-muted-foreground mt-3 max-w-none [&_p]:m-0 [&_ul]:m-0 [&_ul]:pl-5 [&_ul]:list-disc [&_ol]:m-0 [&_ol]:pl-5 [&_ol]:list-decimal [&_li]:m-0 line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: req.description }}
                    />
                  )}

                  {/* Location & date metadata */}
                  {(req.location || req.date_needed) && (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-muted-foreground/70">
                      {req.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3" />
                          {req.location}
                        </span>
                      )}
                      {req.date_needed && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          {req.date_needed}
                        </span>
                      )}
                    </div>
                  )}

                  {(req.contact_person || req.contact_number) && (
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                      {req.contact_person && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" /> {req.contact_person}
                        </span>
                      )}
                      {req.contact_number && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" /> {req.contact_number}
                        </span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {visibleCount < requests.length && (
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
          const selectedReq = requests.find(r => r.id === readMoreId);
          if (!selectedReq) return null;
          const { icon: SelIcon, bg: selBg, color: selColor } = emergencyIcon(selectedReq.type_of_emergency);
          return (
            <Dialog open={true} onOpenChange={() => setReadMoreId(null)}>
              <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg ${selBg} flex items-center justify-center shrink-0`}>
                      <SelIcon className={`h-4 w-4 ${selColor}`} />
                    </div>
                    <div>
                      <DialogTitle className="text-base">{selectedReq.title}</DialogTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">{selectedReq.type_of_emergency}</p>
                    </div>
                  </div>
                </DialogHeader>
                <div
                  className="text-sm text-foreground/80 max-w-none [&_p]:mb-2 [&_ul]:mb-2 [&_ul]:pl-5 [&_ul]:list-disc [&_ol]:mb-2 [&_ol]:pl-5 [&_ol]:list-decimal [&_li]:mb-1 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: selectedReq.description }}
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
