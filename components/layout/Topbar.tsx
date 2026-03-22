'use client';

import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { Bell, Search, User, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Topbar() {
  const { user, role } = useAuthStore();

  const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    school_admin: 'School Admin',
    principal: 'Principal',
    teacher: 'Teacher',
    subject_coordinator: 'Coordinator',
  };

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center flex-1 max-w-md group">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 transition-colors group-focus-within:text-primary" />
          <input
            type="text"
            placeholder="Search for anything..."
            className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-transparent focus:border-primary/20 focus:bg-background rounded-full text-sm transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-all group">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-background animate-pulse" />
        </button>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-3 cursor-pointer group p-1 pl-2 rounded-full hover:bg-muted transition-all">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-foreground leading-none">{user?.name}</p>
            <span className={cn(
              "inline-block mt-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-full border",
              "bg-primary/10 text-primary border-primary/20"
            )}>
              {role ? roleLabels[role] : 'User'}
            </span>
          </div>
          <div className="relative">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center border-2 border-background shadow-md group-hover:scale-105 transition-transform">
              <User size={20} className="text-primary-foreground" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-secondary rounded-full border-2 border-background shadow-sm flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
            </div>
          </div>
          <ChevronDown size={14} className="text-muted-foreground group-hover:text-foreground transition-colors mr-1" />
        </div>
      </div>
    </header>
  );
}
