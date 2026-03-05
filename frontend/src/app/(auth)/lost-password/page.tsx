'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, ArrowLeft, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function LostPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/forgot-password', { email });
      setSent(true);
      toast.success('Password reset link sent to your email.');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to send reset link. Please check your email.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-card rounded-2xl border border-border p-8 md:p-10 shadow-sm">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
          Lost Password
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-8">
          Please enter your email address. You will receive a reset password link.
        </p>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Check your email</h2>
            <p className="text-sm text-muted-foreground">
              We&apos;ve sent a password reset link to <strong>{email}</strong>.
              Please check your inbox and follow the instructions.
            </p>
            <Button
              onClick={() => setSent(false)}
              variant="outline"
              className="rounded-full"
            >
              Send again
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-muted/30 border border-border focus-visible:ring-2 focus-visible:ring-primary/30"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all shadow-md hover:shadow-lg"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Get New Password
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Go to login page
          </Link>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-950/20 rounded-2xl p-8 border border-blue-100 dark:border-blue-900/30">
        <div className="flex items-center gap-3 mb-4">
          <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300">
            Do you have any questions?
          </h3>
        </div>
        <p className="text-sm text-blue-800 dark:text-blue-400 mb-4">
          If you&apos;re having trouble resetting your password, please reach out to us.
          We&apos;re here to help you get back into your account.
        </p>
        <Button
          variant="outline"
          className="rounded-full border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
        >
          Contact Us
        </Button>
      </div>
    </div>
  );
}
