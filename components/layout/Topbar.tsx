'use client';

import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { Bell, BellOff, Search, User, ChevronDown, Menu, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import { GlobalSearch } from './GlobalSearch';

import { announcementService } from '../../services/announcement/service';
import { CURRENT_SESSION } from '../../lib/constants';
import { Megaphone } from 'lucide-react';

type TopbarProps = {
  onMobileMenuClick?: () => void;
};

export function Topbar({ onMobileMenuClick }: TopbarProps) {
  const { user, role, clearAuth } = useAuthStore();
  const [unreadAnnouncements, setUnreadAnnouncements] = React.useState<any[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const loadUnread = React.useCallback(async () => {
    try {
      const res = await announcementService.getAnnouncements({ limit: 15, session: CURRENT_SESSION });
      const readIdsRaw = localStorage.getItem('read-announcements');
      const readIds = readIdsRaw ? JSON.parse(readIdsRaw) : [];
      const unread = (res.data || []).filter((ann: any) => !readIds.includes(ann.id));
      setUnreadAnnouncements(unread);
    } catch (err) {
      console.error('Failed to load unread notices for topbar bell:', err);
    }
  }, []);

  React.useEffect(() => {
    loadUnread();
    
    // Listen to local read updates
    window.addEventListener('announcement-read', loadUnread);
    window.addEventListener('storage', loadUnread);
    
    // Refresh every 30 seconds
    const interval = setInterval(loadUnread, 30000);
    return () => {
      window.removeEventListener('announcement-read', loadUnread);
      window.removeEventListener('storage', loadUnread);
      clearInterval(interval);
    };
  }, [loadUnread]);

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleAnnouncementClick = async (ann: any) => {
    try {
      // Mark as read in localStorage
      const readIdsRaw = localStorage.getItem('read-announcements');
      const readIds = readIdsRaw ? JSON.parse(readIdsRaw) : [];
      if (!readIds.includes(ann.id)) {
        readIds.push(ann.id);
        localStorage.setItem('read-announcements', JSON.stringify(readIds));
      }
      setUnreadAnnouncements(prev => prev.filter(a => a.id !== ann.id));
      
      // Mark as read on backend
      await announcementService.getAnnouncementDetails(ann.id);
      
      setIsOpen(false);

      // Route to page
      const announcementsPaths: Record<string, string> = {
        school_admin: '/dashboard/admin/announcements',
        principal: '/dashboard/principal/announcements',
        teacher: '/dashboard/teacher/announcements',
        student: '/dashboard/student/announcements',
        subject_coordinator: '/dashboard/coordinator/announcements',
      };
      const path = role ? announcementsPaths[role] : '/dashboard';
      window.location.href = path;
    } catch (err) {
      console.error(err);
    }
  };

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
        {/* Notification bell dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative p-2.5 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300 group"
            title="Notifications notice board"
          >
            <Bell size={20} className="group-hover:rotate-12 transition-transform" />
            {unreadAnnouncements.length > 0 && (
              <span className="absolute top-1 right-1 min-w-5 h-5 flex items-center justify-center bg-rose-500 border border-background text-[10px] font-black text-white px-1 rounded-full animate-bounce">
                {unreadAnnouncements.length}
              </span>
            )}
          </button>

          {/* Notices Dropdown Panel */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 py-3 bg-background border border-border rounded-2xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="px-4 pb-2 border-b flex items-center justify-between">
                <span className="font-bold text-sm text-foreground">School Notices</span>
                <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-md font-bold">
                  {unreadAnnouncements.length} New
                </span>
              </div>
              <div className="max-h-[300px] overflow-y-auto mt-2 divide-y divide-border/60">
                {unreadAnnouncements.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    <Megaphone className="h-6 w-6 mx-auto opacity-20 mb-2" />
                    No new announcements.
                  </div>
                ) : (
                  unreadAnnouncements.map((ann) => (
                    <button
                      key={ann.id}
                      onClick={() => handleAnnouncementClick(ann)}
                      className="w-full text-left px-4 py-3 hover:bg-accent/50 transition flex items-start gap-2.5"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate pr-2">{ann.title}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">{ann.content}</p>
                        <p className="text-[9px] text-muted-foreground/60">{new Date(ann.createdAt).toLocaleDateString()}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <div className="px-4 pt-2 border-t text-center">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    const announcementsPaths: Record<string, string> = {
                      school_admin: '/dashboard/admin/announcements',
                      principal: '/dashboard/principal/announcements',
                      teacher: '/dashboard/teacher/announcements',
                      student: '/dashboard/student/announcements',
                      subject_coordinator: '/dashboard/coordinator/announcements',
                    };
                    const path = role ? announcementsPaths[role] : '/dashboard';
                    window.location.href = path;
                  }}
                  className="text-[11px] font-bold text-primary hover:underline"
                >
                  View All Notices
                </button>
              </div>
            </div>
          )}
        </div>

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
