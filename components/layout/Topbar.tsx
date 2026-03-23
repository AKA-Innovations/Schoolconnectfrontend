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
    <header
      style={{
        background: 'hsl(var(--background))',
        borderBottom: '1px solid hsl(var(--border))',
      }}
      className="h-16 flex items-center justify-between px-8 sticky top-0 z-40 subtle-shadow"
    >
      {/* Search */}
      <div className="flex items-center flex-1 max-w-md group">
        <div className="relative w-full">
          <Search
            style={{ color: 'hsl(var(--muted-foreground))' }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors"
          />
          <input
            type="text"
            placeholder="Search for anything..."
            style={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--foreground))',
              fontSize: '0.875rem',
            }}
            className="w-full pl-10 pr-4 py-2 rounded-lg transition-all focus-ring"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button
          style={{ color: 'hsl(var(--muted-foreground))' }}
          className="relative p-2 rounded-lg hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] transition-colors"
        >
          <Bell size={20} />
          <span
            style={{ background: 'hsl(var(--destructive))' }}
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-[hsl(var(--background))]"
          />
        </button>

        <div style={{ background: 'hsl(var(--border))' }} className="h-6 w-px mx-1" />

        {/* User profile pill */}
        <div
          className="flex items-center gap-3 cursor-pointer group p-1 pr-3 rounded-full hover:bg-[hsl(var(--accent))] transition-colors"
        >
          {/* Avatar */}
          <div className="relative">
            <div
              style={{ background: 'hsl(var(--primary-subtle))', color: 'hsl(var(--primary))' }}
              className="w-9 h-9 rounded-full flex items-center justify-center font-medium"
            >
              {user?.name?.charAt(0) || <User size={16} />}
            </div>
          </div>

          {/* Name + Role */}
          <div className="text-left hidden sm:block">
            <p
              style={{ color: 'hsl(var(--foreground))' }}
              className="text-sm font-semibold leading-tight"
            >
              {user?.name || 'User'}
            </p>
            <span
              style={{ color: 'hsl(var(--muted-foreground))' }}
              className="text-xs font-medium"
            >
              {role ? roleLabels[role] : 'User'}
            </span>
          </div>

          <ChevronDown
            size={16}
            style={{ color: 'hsl(var(--muted-foreground))' }}
            className="ml-1 group-hover:text-[hsl(var(--foreground))] transition-colors"
          />
        </div>
      </div>
    </header>
  );
}
