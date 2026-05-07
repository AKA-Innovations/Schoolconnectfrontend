'use client';

import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { Bell, BellOff, Search, User, ChevronDown, Menu, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import { GlobalSearch } from './GlobalSearch';

type TopbarProps = {
  onMobileMenuClick?: () => void;
};

export function Topbar({ onMobileMenuClick }: TopbarProps) {
  const { user, role, clearAuth } = useAuthStore();
  const [isMuted, setIsMuted] = React.useState(false);

  const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    school_admin: 'School Admin',
    principal: 'Principal',
    teacher: 'Teacher',
    subject_coordinator: 'Coordinator',
  };

  return (
    <header
      className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border subtle-shadow"
    >
      <button
        type="button"
        onClick={onMobileMenuClick}
        className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border border-border bg-card text-foreground shadow-sm hover:bg-accent transition-colors"
        aria-label="Open sidebar"
      >
        <Menu size={18} />
      </button>

      {/* Search */}
      <GlobalSearch />

      {/* Right actions */}
      <div className="flex items-center gap-3 sm:gap-4 ml-auto">
        {/* Notification bell */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="relative p-2.5 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300 group"
          title={isMuted ? "Unmute notifications" : "Mute notifications"}
        >
          {isMuted ? (
            <BellOff size={20} className="text-muted-foreground/50" />
          ) : (
            <Bell size={20} className="group-hover:rotate-12 transition-transform" />
          )}
          {!isMuted && (
            <span
              className="absolute top-2 right-2 w-2.5 h-2.5 bg-destructive border-2 border-background rounded-full"
            />
          )}
        </button>

        <div className="h-6 w-px bg-border mx-1" />

        {/* User profile pill */}
        <div className="relative group">
          <div
            className="flex items-center gap-3 cursor-pointer p-1.5 pr-4 rounded-2xl bg-primary/5 group-hover:bg-primary/10 border border-primary/10 group-hover:border-primary/20 transition-all duration-300 backdrop-blur-sm"
          >
            {/* Avatar with Status indicator */}
            <div className="relative">
              <div
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center font-bold text-white shadow-lg shadow-primary/30 transition-transform group-hover:scale-105"
              >
                {user?.name?.charAt(0).toUpperCase() || <User size={18} />}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full" />
            </div>

            {/* Name + Role */}
            <div className="text-left hidden sm:flex flex-col justify-center">
              <p className="text-sm font-bold text-foreground leading-none mb-1">
                {user?.name || 'User'}
              </p>
              <div className="flex items-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-primary px-1.5 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                  {role ? roleLabels[role] : 'User'}
                </span>
              </div>
            </div>

            <ChevronDown
              size={16}
              className="ml-1 text-muted-foreground group-hover:text-foreground transition-colors group-hover:translate-y-0.5 duration-300"
            />
          </div>

          {/* Hover Menu */}
          <div className="absolute top-full right-0 mt-2 w-48 py-2 bg-background border border-border rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-50">
            <button
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
              onClick={() => window.location.href = '/dashboard/teacher/profile'}
            >
              <User size={16} className="text-muted-foreground" />
              <span>My Profile</span>
            </button>
            <button
              className="w-full hover:bg-primary/10 flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors"
              onClick={() => {
                clearAuth();
                window.location.href = '/login';
              }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
