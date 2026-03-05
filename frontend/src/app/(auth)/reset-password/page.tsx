'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== passwordConfirmation) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/reset-password', {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(true);
      toast.success('Password reset successfully!');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to reset password.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="bg-card rounded-2xl border border-border p-8 md:p-10 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Password Reset!</h2>
          <p className="text-sm text-muted-foreground">
            Your password has been reset successfully. You can now log in with your new password.
          </p>
          <Link href="/login">
            <Button className="rounded-full bg-primary text-primary-foreground">
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-card rounded-2xl border border-border p-8 md:p-10 shadow-sm">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
          Reset Password
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-8">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 bg-muted/30 border border-border"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">New Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 bg-muted/30 border border-border pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Confirm Password</Label>
            <Input
              type="password"
              placeholder="Confirm new password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              className="h-12 bg-muted/30 border border-border"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all shadow-md"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-lg mx-auto text-center py-20">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
