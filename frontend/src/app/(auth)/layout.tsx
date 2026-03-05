'use client';

import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-6 py-4 md:px-12">
        <Link href="/login" className="text-2xl font-black tracking-tight text-foreground">
          lab2000<span className="text-primary">.</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-8">
        {children}
      </main>
    </div>
  );
}
