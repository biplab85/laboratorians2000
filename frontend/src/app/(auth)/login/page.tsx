'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowUpRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back!');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Login failed. Please check your credentials.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1100px] mx-auto">
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left - Login Form */}
          <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full lg:mx-0">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                Welcome back! <span className="inline-block">&#x1F44B;</span>
              </h1>
              <p className="text-muted-foreground mb-8 text-sm">
                Sign in to your Lab2000 alumni account
              </p>

              {error && (
                <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                    Email <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/30 text-foreground placeholder:text-muted-foreground/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-muted-foreground">
                    Password <span className="text-primary">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/30 text-foreground placeholder:text-muted-foreground/50 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-3">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-11 w-fit px-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-all shadow-md hover:shadow-lg"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Login
                    {!loading && <ArrowUpRight className="ml-2 h-4 w-4" />}
                  </Button>

                  <Link
                    href="/lost-password"
                    className="text-primary hover:text-primary/80 text-sm font-medium transition-colors w-fit"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </form>

              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/registration"
                    className="text-primary hover:text-primary/80 font-semibold transition-colors"
                  >
                    Register Now
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Divider - coral accent line */}
          <div className="hidden lg:block relative">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary z-10" />

            {/* Right - Directory Skeleton Preview */}
            <div className="h-full bg-muted/30 p-8 pl-10 flex flex-col justify-center overflow-hidden">
              {/* Skeleton header */}
              <div className="flex gap-4 mb-6">
                <div className="h-8 w-28 bg-muted rounded-md animate-pulse" />
                <div className="h-8 w-32 bg-muted rounded-md animate-pulse" />
                <div className="h-8 w-24 bg-muted rounded-md animate-pulse" />
              </div>

              {/* Skeleton table rows */}
              <div className="space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                    <div className="flex-1 flex gap-4">
                      <div className="h-4 flex-1 bg-muted rounded animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                      <div className="h-4 w-24 bg-muted rounded animate-pulse" style={{ animationDelay: `${i * 100 + 50}ms` }} />
                      <div className="h-4 w-20 bg-muted rounded animate-pulse" style={{ animationDelay: `${i * 100 + 100}ms` }} />
                      <div className="h-4 w-28 bg-muted rounded animate-pulse" style={{ animationDelay: `${i * 100 + 150}ms` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
