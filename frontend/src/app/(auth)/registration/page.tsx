'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, UserCheck, UserX, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface AlumniData {
  id: number;
  first_name: string;
  last_name: string;
  section: string;
  roll_number: number;
  profile_image: string | null;
}

export default function RegistrationPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [section, setSection] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [photoLoading, setPhotoLoading] = useState(false);

  const [alumniData, setAlumniData] = useState<AlumniData | null>(null);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [photoConfirmed, setPhotoConfirmed] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetVerification = () => {
    setPhotoConfirmed(false);
    setAlumniData(null);
    setPhotoLoading(false);
  };

  // Auto-lookup when all 4 identity fields are filled
  useEffect(() => {
    if (photoConfirmed) return;
    if (!firstName || !lastName || !section || !rollNumber) {
      setAlumniData(null);
      setPhotoLoading(false);
      return;
    }

    setPhotoLoading(true);
    setAlumniData(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.post('/verify-alumni', {
          first_name: firstName,
          last_name: lastName,
          section,
          roll_number: parseInt(rollNumber),
        });
        setAlumniData(res.data.alumni);
      } catch (err: unknown) {
        const errData = (err as { response?: { data?: { alumni?: AlumniData }; status?: number } })?.response;
        // Even if already registered (409), show the photo if returned
        if (errData?.status === 409 && errData?.data?.alumni) {
          setAlumniData(errData.data.alumni);
        } else {
          setAlumniData(null);
        }
      } finally {
        setPhotoLoading(false);
      }
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [firstName, lastName, section, rollNumber, photoConfirmed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !section || !rollNumber) {
      toast.error('Please fill all identity fields.');
      return;
    }

    if (!email || !phone || !password) {
      toast.error('Please fill all required fields.');
      return;
    }

    // If not yet verified, run verification first
    if (!photoConfirmed) {
      setVerifying(true);
      setError('');

      try {
        const res = await api.post('/verify-alumni', {
          first_name: firstName,
          last_name: lastName,
          section,
          roll_number: parseInt(rollNumber),
        });

        setAlumniData(res.data.alumni);
        setShowPhotoDialog(true);
      } catch (err: unknown) {
        const errData = (err as { response?: { data?: { message?: string }; status?: number } })?.response;
        const message = errData?.data?.message || 'Verification failed.';

        if (errData?.status === 409) {
          toast.error('This alumni has already registered an account.');
        } else {
          toast.error(message);
        }
        setError(message);
      } finally {
        setVerifying(false);
      }
      return;
    }

    // Submit registration
    if (password !== passwordConfirmation) {
      toast.error('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.post('/register', {
        alumni_record_id: alumniData!.id,
        email,
        phone,
        password,
        password_confirmation: passwordConfirmation,
        photo_confirmed: true,
      });

      toast.success('Registration successful! You can now log in.');
      window.location.href = '/login';
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Registration failed. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhotoConfirm = () => {
    setPhotoConfirmed(true);
    setShowPhotoDialog(false);
    toast.success('Identity verified! Click Submit to complete registration.');
  };

  const handlePhotoDeny = () => {
    setShowPhotoDialog(false);
    setAlumniData(null);
    setPhotoConfirmed(false);
    toast.error('Photo did not match. Please check your information and try again.');
  };

  return (
    <>
      <div className="w-full max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 lg:gap-16 items-start">
          {/* Left - Title & Privacy Notice */}
          <div className="lg:sticky lg:top-8">
            <h1 className="text-3xl md:text-[2.5rem] font-bold text-foreground leading-tight mb-6">
              Laboratorians batch 2000 students can only register here
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Thanks friends for choosing to register with us. Your information will be
              kept only among the students of Laboratorians batch 2000. We will not be
              publishing your information to the public. It will be used only among your
              batchmates.
            </p>

            <div className="mt-8">
              <Link
                href="/login"
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Already have an account? Login here
              </Link>
            </div>
          </div>

          {/* Right - Registration Form */}
          <div>
            {error && (
              <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            {photoConfirmed && (
              <div className="mb-6 flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">
                <UserCheck className="h-4 w-4" />
                <span className="font-medium">Identity verified as {alumniData?.first_name} {alumniData?.last_name} (Section {alumniData?.section}, Roll {alumniData?.roll_number})</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">
                    First Name <span className="text-primary">*</span>
                  </Label>
                  <Input
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => { setFirstName(e.target.value); resetVerification(); }}
                    required
                    disabled={photoConfirmed}
                    className="h-11 border border-border"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">
                    Last Name <span className="text-primary">*</span>
                  </Label>
                  <Input
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => { setLastName(e.target.value); resetVerification(); }}
                    required
                    disabled={photoConfirmed}
                    className="h-11 border border-border"
                  />
                </div>
              </div>

              {/* Section & Roll */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">
                    Section in Class 10 <span className="text-primary">*</span>
                  </Label>
                  <Select
                    value={section}
                    onValueChange={(val) => { setSection(val); resetVerification(); }}
                    disabled={photoConfirmed}
                  >
                    <SelectTrigger className="h-11 border border-border">
                      <SelectValue placeholder="Section A" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Section A</SelectItem>
                      <SelectItem value="B">Section B</SelectItem>
                      <SelectItem value="C">Section C</SelectItem>
                      <SelectItem value="D">Section D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Roll in Class 10</Label>
                  <Select
                    value={rollNumber}
                    onValueChange={(val) => { setRollNumber(val); resetVerification(); }}
                    disabled={photoConfirmed}
                  >
                    <SelectTrigger className="h-11 border border-border">
                      <SelectValue placeholder="1" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 71 }, (_, i) => i + 1).map(n => (
                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">
                    Email <span className="text-primary">*</span>
                  </Label>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 border border-border"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">
                    Phone/WhatsApp Number <span className="text-primary">*</span>
                  </Label>
                  <Input
                    type="tel"
                    inputMode="numeric"
                    placeholder="Write with country code"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9+]/g, ''))}
                    required
                    className="h-11 border border-border"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Password <span className="text-primary">*</span>
                </Label>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 border border-border"
                />
              </div>

              {photoConfirmed && (
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">
                    Confirm Password <span className="text-primary">*</span>
                  </Label>
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    required
                    className="h-11 border border-border"
                  />
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={submitting || verifying}
                className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base transition-all"
              >
                {(submitting || verifying) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Submit
                {!submitting && !verifying && <ArrowUpRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>

            {/* Old Photo Section */}
            <div className="mt-10 text-center">
              <h3 className="text-xl font-bold text-foreground mb-4">
                What about an old photo?
              </h3>
              <div className="w-48 h-56 mx-auto bg-muted/30 border border-border rounded-lg flex items-center justify-center overflow-hidden relative">
                {photoLoading ? (
                  /* Loading skeleton */
                  <div className="w-full h-full bg-muted animate-pulse flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-muted-foreground/20 animate-pulse" />
                    <div className="w-24 h-3 rounded bg-muted-foreground/20 animate-pulse" />
                    <div className="w-16 h-3 rounded bg-muted-foreground/20 animate-pulse" />
                  </div>
                ) : alumniData?.profile_image ? (
                  <img
                    src={alumniData.profile_image}
                    alt={`${alumniData.first_name} ${alumniData.last_name}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // If image fails to load, show placeholder
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                {/* Placeholder shown when no image or image fails */}
                {!photoLoading && (
                  <div className={`absolute inset-0 flex flex-col items-center justify-center gap-2 ${alumniData?.profile_image ? 'hidden' : ''}`}>
                    <svg className="w-24 h-32 text-muted-foreground/30" viewBox="0 0 80 110" fill="currentColor">
                      <circle cx="40" cy="30" r="16" />
                      <path d="M10 95 Q10 65 40 65 Q70 65 70 95" />
                      <rect x="15" y="90" width="50" height="15" rx="2" />
                    </svg>
                    {alumniData && (
                      <p className="text-xs text-muted-foreground px-2">No photo available</p>
                    )}
                  </div>
                )}
              </div>
              {alumniData && !photoLoading && (
                <div className="mt-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{alumniData.first_name} {alumniData.last_name}</span>
                  <br />
                  Section {alumniData.section} · Roll {alumniData.roll_number}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Photo Verification Dialog */}
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Is this you?</DialogTitle>
            <DialogDescription>
              We found a matching record. Please confirm if this is your school photo.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center py-4">
            <div className="w-48 h-56 bg-muted rounded-xl overflow-hidden mb-4 shadow-inner">
              {alumniData?.profile_image ? (
                <img
                  src={alumniData.profile_image}
                  alt="School photo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-20 h-20 text-muted-foreground/40" viewBox="0 0 100 100" fill="currentColor">
                    <circle cx="50" cy="35" r="18" />
                    <path d="M20 85 Q20 60 50 60 Q80 60 80 85" />
                  </svg>
                </div>
              )}
            </div>
            <p className="text-lg font-semibold text-foreground">
              {alumniData?.first_name} {alumniData?.last_name}
            </p>
            <p className="text-sm text-muted-foreground">
              Section {alumniData?.section} | Roll {alumniData?.roll_number}
            </p>
          </div>

          <DialogFooter className="flex gap-3 sm:justify-center">
            <Button
              variant="outline"
              onClick={handlePhotoDeny}
              className="flex-1 h-11 rounded-full border-destructive text-destructive hover:bg-destructive/10"
            >
              <UserX className="h-4 w-4 mr-2" />
              No, this is not me
            </Button>
            <Button
              onClick={handlePhotoConfirm}
              className="flex-1 h-11 rounded-full bg-green-600 hover:bg-green-700 text-white"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Yes, this is me!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
