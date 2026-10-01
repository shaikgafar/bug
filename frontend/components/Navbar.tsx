'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  Bug, 
  PlusCircle, 
  PlayCircle, 
  ShieldCheck, 
  LayoutDashboard, 
  LogOut, 
  LogIn, 
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/types';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, switchDemoUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Use BugSense custom minimal navbar on home landing page
  if (pathname === '/') return null;

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/bugs', label: 'Bugs', icon: Bug },
    { href: '/bugs/new', label: 'New Bug', icon: PlusCircle },
    { href: '/demo', label: 'Demo Lab', icon: PlayCircle, badge: 'Showcase' },
    { href: '/admin', label: 'Admin', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/[0.08] bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-xl bg-black flex items-center justify-center p-1.5 shadow-sm group-hover:scale-105 transition-transform duration-200">
            <Image 
              src="/bugsense-icon.png" 
              alt="BugSense 3D Robot Logo" 
              width={28} 
              height={28} 
              className="object-contain" 
              priority
            />
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="font-bold text-neutral-900 text-lg tracking-[-0.04em]">
              Bug
            </span>
            <span className="font-serif italic font-semibold text-neutral-900 text-lg tracking-[-0.05em]">
              Sense
            </span>
            <span className="text-[10px] font-sans font-semibold text-neutral-400 ml-1">
              &reg;
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium tracking-tight transition-all duration-200 ${
                  isActive
                    ? 'bg-black text-white shadow-sm'
                    : 'text-neutral-600 hover:text-black hover:bg-neutral-100/80'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[9px] font-bold tracking-tight uppercase ${
                    isActive ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-100 text-neutral-700 border border-black/[0.08]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User / Demo switcher */}
        <div className="flex items-center gap-2.5">
          {/* Quick Demo Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 rounded-full border border-black/[0.1] bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 hover:bg-neutral-50 shadow-sm transition"
              title="Switch demo persona"
            >
              <Sparkles className="h-3.5 w-3.5 text-neutral-500" />
              <span>Persona: <strong className="text-black capitalize">{user ? user.role : 'Guest'}</strong></span>
              <ChevronDown className="h-3 w-3 text-neutral-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-black/[0.08] bg-white p-2 shadow-xl z-50">
                <div className="px-2.5 py-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Quick Switch Role (Demo)
                </div>
                {(['admin', 'developer', 'reporter'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      switchDemoUser(r);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs font-medium transition ${
                      user?.role === r 
                        ? 'bg-neutral-100 text-black font-semibold' 
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-black'
                    }`}
                  >
                    <span className="capitalize">{r}</span>
                    <span className="text-[10px] text-neutral-400">
                      {r === 'admin' ? 'Full Access' : r === 'developer' ? 'Triage & Feedback' : 'Submit Reports'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User profile / Log in */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-black tracking-tight">{user.name}</span>
                <span className="text-[10px] text-neutral-400">{user.email}</span>
              </div>
              <button
                onClick={logout}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-black/[0.1] bg-white text-neutral-500 hover:text-red-600 hover:border-red-200 transition"
                title="Log out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 shadow-sm transition"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
