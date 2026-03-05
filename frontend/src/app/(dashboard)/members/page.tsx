'use client';

import { useEffect, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Search, Loader2, ExternalLink, Smile, List, Droplets, Phone, Mail, MapPin, LayoutGrid, LayoutList } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface Member {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  section: string;
  roll_number: number;
  email: string;
  phone: string;
  profile_image: string | null;
  school_photo: string | null;
  blood_group: string | null;
  occupation: string | null;
  current_city: string | null;
  current_country: string | null;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [section, setSection] = useState('all');
  const [bloodGroup, setBloodGroup] = useState('all');
  const [activeOnly, setActiveOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean> = { page };
      if (search) params.search = search;
      if (section !== 'all') params.section = section;
      if (bloodGroup !== 'all') params.blood_group = bloodGroup;
      if (activeOnly) params.active_only = true;

      const res = await api.get('/members', { params });
      setMembers(res.data.data);
      setTotalPages(res.data.last_page);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [page, section, bloodGroup, activeOnly, search]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMembers();
  };

  const NoPhotoPlaceholder = () => (
    <div className="w-full h-full bg-muted/50 flex items-center justify-center">
      <span className="text-muted-foreground/30 text-xs">No image found</span>
    </div>
  );

  return (
    <TooltipProvider>
    <div className="space-y-6">
      {/* Header + Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">Meet your friends</h1>
            <div className="flex items-center bg-muted/60 rounded-lg p-0.5 border border-border/50">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all duration-200 cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-card text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all duration-200 cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-card text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-label="List view"
              >
                <LayoutList className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 w-48 bg-background border border-border text-sm"
              />
            </form>

            <Select value={bloodGroup} onValueChange={(val) => { setBloodGroup(val); setPage(1); }}>
              <SelectTrigger className="w-40 h-9 bg-background border border-border text-sm">
                <SelectValue placeholder="Blood Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Blood Group</SelectItem>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
              </SelectContent>
            </Select>

            <Select value={section} onValueChange={(val) => { setSection(val); setPage(1); }}>
              <SelectTrigger className="w-36 h-9 bg-background border border-border text-sm">
                <SelectValue placeholder="Section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Section</SelectItem>
                <SelectItem value="A">Section A</SelectItem>
                <SelectItem value="B">Section B</SelectItem>
                <SelectItem value="C">Section C</SelectItem>
                <SelectItem value="D">Section D</SelectItem>
              </SelectContent>
            </Select>

            <label className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap cursor-pointer">
              <Checkbox
                checked={activeOnly}
                onCheckedChange={(checked) => { setActiveOnly(!!checked); setPage(1); }}
              />
              Active Users
            </label>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => { setPage(1); fetchMembers(); }}
              className="h-9 px-5 text-sm"
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Members Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No members found matching your filters.</p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
            : 'flex flex-col gap-3'
        }>
          {members.map((member) => {
            const hasSchoolPhoto = !!member.school_photo;
            const hasProfileImage = !!member.profile_image;
            const location = [member.current_city, member.current_country].filter(Boolean).join(', ');

            if (viewMode === 'list') {
              return (
                <div
                  key={member.id}
                  className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-primary/[0.06] hover:border-primary/20 dark:hover:border-primary/30 transition-all duration-300 cursor-pointer flex"
                >
                  {/* Dual Image Area — compact side panel */}
                  <div className="relative flex w-48 shrink-0 bg-muted/30 overflow-hidden">
                    {/* Old School Photo (left) */}
                    <div className="w-1/2 h-full overflow-hidden border-r border-border/50">
                      {hasSchoolPhoto ? (
                        <img
                          src={member.school_photo!}
                          alt={`${member.name} - school`}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-[0.5] group-hover:scale-105 transition-all duration-500"
                        />
                      ) : (
                        <NoPhotoPlaceholder />
                      )}
                    </div>

                    {/* Center Icon */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                      <div className="w-7 h-7 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-primary/20 ring-2 ring-white/20 group-hover:scale-110 transition-transform duration-300">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="15 3 21 3 21 9" />
                          <polyline points="9 21 3 21 3 15" />
                          <line x1="21" y1="3" x2="14" y2="10" />
                          <line x1="3" y1="21" x2="10" y2="14" />
                        </svg>
                      </div>
                    </div>

                    {/* New Profile Photo (right) */}
                    <div className="w-1/2 h-full overflow-hidden">
                      {hasProfileImage ? (
                        <img
                          src={member.profile_image!}
                          alt={`${member.name} - current`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : hasSchoolPhoto ? (
                        <img
                          src={member.school_photo!}
                          alt={`${member.name} - current`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <NoPhotoPlaceholder />
                      )}
                    </div>

                    {/* Right fade overlay for smooth transition to info */}
                    <div className="absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-card to-transparent pointer-events-none" />
                  </div>

                  {/* Info Section — horizontal layout */}
                  <div className="flex-1 min-w-0 px-5 py-3.5 flex flex-col justify-center gap-2">
                    {/* Name Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-green-500 shrink-0 ring-2 ring-green-500/20" />
                        <Link
                          href={`/members/${member.id}`}
                          className="text-sm font-semibold text-primary hover:underline truncate"
                        >
                          {member.name}
                        </Link>
                      </div>
                      <Link href={`/members/${member.id}`} className="text-muted-foreground hover:text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    {/* Details — horizontal flow */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1.5">
                            <Smile className="h-3 w-3 shrink-0 text-amber-500" />
                            <span>{member.section}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Section {member.section}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1.5">
                            <List className="h-3 w-3 shrink-0 text-blue-500" />
                            <span>{member.roll_number}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Roll: {member.roll_number}</TooltipContent>
                      </Tooltip>
                      {member.blood_group && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5">
                              <Droplets className="h-3 w-3 shrink-0 text-red-500" />
                              <span>{member.blood_group}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Blood Group: {member.blood_group}</TooltipContent>
                        </Tooltip>
                      )}
                      {member.phone && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3 w-3 shrink-0 text-emerald-500" />
                              <span>{member.phone}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Mobile: {member.phone}</TooltipContent>
                        </Tooltip>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3 w-3 shrink-0 text-violet-500" />
                            <span className="truncate">{member.email}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{member.email}</TooltipContent>
                      </Tooltip>
                      {location && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3 w-3 shrink-0 text-orange-500" />
                              <span className="truncate">{location}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>{location}</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={member.id}
                className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-primary/[0.06] hover:border-primary/20 dark:hover:border-primary/30 transition-all duration-300 cursor-pointer"
              >
                {/* Dual Image Area */}
                <div className="relative flex h-44 bg-muted/30 overflow-hidden">
                  {/* Old School Photo (left) */}
                  <div className="w-1/2 h-full overflow-hidden border-r border-border/50">
                    {hasSchoolPhoto ? (
                      <img
                        src={member.school_photo!}
                        alt={`${member.name} - school`}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-[0.5] group-hover:scale-105 transition-all duration-500"
                      />
                    ) : (
                      <NoPhotoPlaceholder />
                    )}
                  </div>

                  {/* Center Icon */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="w-8 h-8 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-primary/20 ring-2 ring-white/20 group-hover:scale-110 transition-transform duration-300">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 3 21 3 21 9" />
                        <polyline points="9 21 3 21 3 15" />
                        <line x1="21" y1="3" x2="14" y2="10" />
                        <line x1="3" y1="21" x2="10" y2="14" />
                      </svg>
                    </div>
                  </div>

                  {/* New Profile Photo (right) */}
                  <div className="w-1/2 h-full overflow-hidden">
                    {hasProfileImage ? (
                      <img
                        src={member.profile_image!}
                        alt={`${member.name} - current`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : hasSchoolPhoto ? (
                      <img
                        src={member.school_photo!}
                        alt={`${member.name} - current`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <NoPhotoPlaceholder />
                    )}
                  </div>

                  {/* Bottom fade overlay for smooth transition to info */}
                  <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                </div>

                {/* Info Section */}
                <div className="px-4 pt-2.5 pb-4 space-y-2.5">
                  {/* Name Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-green-500 shrink-0 ring-2 ring-green-500/20" />
                      <Link
                        href={`/members/${member.id}`}
                        className="text-sm font-semibold text-primary hover:underline truncate"
                      >
                        {member.name}
                      </Link>
                    </div>
                    <Link href={`/members/${member.id}`} className="text-muted-foreground hover:text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1.5">
                            <Smile className="h-3 w-3 shrink-0 text-amber-500" />
                            <span>{member.section}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Section {member.section}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1.5">
                            <List className="h-3 w-3 shrink-0 text-blue-500" />
                            <span>{member.roll_number}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Roll: {member.roll_number}</TooltipContent>
                      </Tooltip>
                    </div>

                    <div className="flex items-center justify-between">
                      {member.blood_group && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5">
                              <Droplets className="h-3 w-3 shrink-0 text-red-500" />
                              <span>{member.blood_group}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Blood Group: {member.blood_group}</TooltipContent>
                        </Tooltip>
                      )}
                      {member.phone && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3 w-3 shrink-0 text-emerald-500" />
                              <span>{member.phone}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Mobile: {member.phone}</TooltipContent>
                        </Tooltip>
                      )}
                    </div>

                    <div className="h-px bg-border/60 my-0.5" />

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3 w-3 shrink-0 text-violet-500" />
                          <span className="truncate">{member.email}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>{member.email}</TooltipContent>
                    </Tooltip>

                    {location && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3 shrink-0 text-orange-500" />
                            <span className="truncate">{location}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{location}</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-3">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
    </TooltipProvider>
  );
}
