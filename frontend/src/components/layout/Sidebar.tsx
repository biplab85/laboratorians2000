/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  AlertTriangle,
  UserCog,
  Home,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  FlaskConical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSidebar } from '@/context/SidebarContext';

const navItems = [
  { label: 'Dashboard', href: '/user-dashboard', icon: LayoutDashboard },
  { label: 'My Friends', href: '/members', icon: Users },
  { label: 'Professional Notices', href: '/professional-connection', icon: Briefcase },
  { label: 'Urgent Requests', href: '/urgent-section', icon: AlertTriangle },
  { label: 'Account & Profile', href: '/account-settings', icon: UserCog },
  { label: 'Home', href: '/login', icon: Home },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebar();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden cursor-pointer"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out',
          'lg:sticky lg:top-0 lg:translate-x-0',
          collapsed ? 'lg:w-[72px]' : 'lg:w-[260px]',
          mobileOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full w-[260px]'
        )}
      >
        {/* Header / Logo */}
        <div className={cn(
          'h-16 flex items-center border-b border-sidebar-border shrink-0 transition-all duration-300',
          collapsed ? 'justify-center px-0' : 'px-5'
        )}>
          {collapsed ? (
            /* Collapsed: favicon.svg + expand button */
            <div className="flex items-center justify-center gap-2 w-full">
              <img
                src="/favicon.svg"
                alt="lab2000"
                className="w-7 h-7 shrink-0"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleCollapsed}
                    className="flex items-center justify-center w-7 h-7 rounded-lg text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-all cursor-pointer"
                  >
                    <PanelLeftOpen className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={12} className="font-medium">
                  Expand sidebar
                </TooltipContent>
              </Tooltip>
            </div>
          ) : (
            /* Expanded: lab2000 text logo + collapse icon (no flask icon, no Alumni) */
            <div className="flex items-center justify-between w-full">
              <Link href="/user-dashboard" className="flex items-center gap-2.5 cursor-pointer group">
                <div className="overflow-hidden">
                  <span className="text-base font-extrabold tracking-tight text-sidebar-foreground block leading-tight">
                    lab2000
                  </span>
                </div>
              </Link>

              {/* Collapse button — desktop only, hidden by default on expanded */}
              <button
                onClick={toggleCollapsed}
                className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-all cursor-pointer"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>

              {/* Mobile close */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-8 w-8 text-sidebar-foreground cursor-pointer hover:bg-sidebar-accent"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={cn(
          'flex-1 py-4 space-y-1 overflow-y-auto overflow-x-hidden transition-all duration-300',
          collapsed ? 'px-2' : 'px-3'
        )}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const linkContent = (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'group relative flex items-center rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer',
                  collapsed
                    ? 'justify-center w-full h-11 px-0'
                    : 'gap-3 px-4 py-2.5',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary shadow-sm'
                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                {isActive && (
                  <span className={cn(
                    'absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full bg-sidebar-primary transition-all',
                    collapsed ? 'h-5' : 'h-6'
                  )} />
                )}
                <item.icon className={cn(
                  'shrink-0 transition-colors duration-200',
                  collapsed ? 'h-5 w-5' : 'h-[18px] w-[18px]',
                  isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80'
                )} />
                {!collapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    {linkContent}
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={12} className="font-medium">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return linkContent;
          })}
        </nav>
      </aside>
    </>
  );
}
