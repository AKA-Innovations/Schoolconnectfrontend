'use client';

import React from 'react';
import { useAuthStore } from '../../store/authStore';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useTeacherRoles } from '../../lib/permissions';
import { getSidebarLinks, isLinkActive } from '../../lib/navigation';
import { Bell, BellOff, Search, User, ChevronDown, Menu, LogOut, Sun, Moon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { GlobalSearch } from './GlobalSearch';

import { useAnnouncements } from '../../services/announcement/queries';
import { CURRENT_SESSION } from '../../lib/constants';
import { Megaphone } from 'lucide-react';
import { announcementService } from '../../services/announcement/service';

type TopbarProps = {
  onMobileMenuClick?: () => void;
};

export function Topbar({ onMobileMenuClick }: TopbarProps) {
  const { user, role, clearAuth } = useAuthStore();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const teacherRoles = useTeacherRoles();

  // Find the active main section using role and teacherRoles dynamic links
  const activeSection = React.useMemo(() => {
    if (!role) return null;
    const links = getSidebarLinks(role, teacherRoles);
    const currentParams = new URLSearchParams(searchParams?.toString());
    
    return links.find(link => isLinkActive(link, pathname || '', currentParams));
  }, [role, pathname, searchParams, teacherRoles]);

  // Filter sub-links based on teacher roles
  const subLinks = React.useMemo(() => {
    if (!activeSection?.subLinks) return [];
    return activeSection.subLinks.filter(sub => {
      if (!sub.requiresTeacherRole) return true;
      return teacherRoles[sub.requiresTeacherRole];
    });
  }, [activeSection, teacherRoles]);

  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);
  const mobileNavRef = React.useRef<HTMLDivElement>(null);

  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    setIsHydrated(true);
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setTheme('dark');
      document.documentElement.classList.add('dark-theme');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark-theme');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
      document.documentElement.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  // Fetch announcements using react-query with refetchInterval
  const { data: announcementsData } = useAnnouncements({
    limit: 15,
    session: CURRENT_SESSION,
  });

  const [readIds, setReadIds] = React.useState<number[]>([]);

  const loadReadIds = React.useCallback(() => {
    try {
      const readIdsRaw = localStorage.getItem('read-announcements');
      setReadIds(readIdsRaw ? JSON.parse(readIdsRaw) : []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  React.useEffect(() => {
    loadReadIds();
    window.addEventListener('announcement-read', loadReadIds);
    window.addEventListener('storage', loadReadIds);
    return () => {
      window.removeEventListener('announcement-read', loadReadIds);
      window.removeEventListener('storage', loadReadIds);
    };
  }, [loadReadIds]);

  const unreadAnnouncements = React.useMemo(() => {
    const list = announcementsData?.data || [];
    return list.filter((ann: any) => !readIds.includes(ann.id));
  }, [announcementsData, readIds]);

  const activeSubLink = React.useMemo(() => {
    return subLinks.find(sub => {
      const [subPath, subQuery] = sub.href.split('?');
      let isActive = pathname === subPath;
      
      if (subQuery) {
        const params = new URLSearchParams(subQuery);
        const allParamsMatch = Array.from(params.entries()).every(([key, value]) => {
          const currentVal = searchParams?.get(key);
          if (key === 'tab' && value === 'profile' && !currentVal) {
            return true;
          }
          return currentVal === value;
        });
        isActive = isActive && allParamsMatch;
      } else {
        const currentTab = searchParams?.get('tab');
        if (currentTab && currentTab !== 'profile') {
          isActive = false;
        }
      }
      return isActive;
    });
  }, [subLinks, pathname, searchParams]);

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
      if (mobileNavRef.current && !mobileNavRef.current.contains(e.target as Node)) {
        setIsMobileNavOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleAnnouncementClick = async (ann: any) => {
    try {
      // Mark as read in localStorage
      const readIdsRaw = localStorage.getItem('read-announcements');
      const currentReadIds = readIdsRaw ? JSON.parse(readIdsRaw) : [];
      if (!currentReadIds.includes(ann.id)) {
        currentReadIds.push(ann.id);
        localStorage.setItem('read-announcements', JSON.stringify(currentReadIds));
        window.dispatchEvent(new Event('announcement-read'));
      }
      
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
      router.push(path);
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
      <div className="flex items-center gap-3 lg:hidden">
        <button
          type="button"
          onClick={onMobileMenuClick}
          className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-border bg-card text-foreground shadow-sm hover:bg-accent transition-colors"
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>

        {/* Mobile Navigation Dropdown */}
        {subLinks.length > 0 && (
          <div className="relative" ref={mobileNavRef}>
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border border-border bg-card text-foreground shadow-sm hover:bg-accent hover:border-primary/30 transition-all duration-300"
            >
              <span className="truncate max-w-[120px] sm:max-w-[200px]">
                {activeSubLink?.name || activeSection?.name || 'Menu'}
              </span>
              <ChevronDown size={14} className={cn("transition-transform duration-300 text-muted-foreground", isMobileNavOpen && "rotate-180 text-primary")} />
            </button>

            {isMobileNavOpen && (
              <div className="absolute left-0 mt-2 w-56 py-2 bg-background border border-border rounded-2xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                {subLinks.map((sub) => {
                  const [subPath, subQuery] = sub.href.split('?');
                  let isActive = pathname === subPath;

                  if (subQuery) {
                    const params = new URLSearchParams(subQuery);
                    const allParamsMatch = Array.from(params.entries()).every(([key, value]) => {
                      const currentVal = searchParams?.get(key);
                      if (key === 'tab' && value === 'profile' && !currentVal) {
                        return true;
                      }
                      return currentVal === value;
                    });
                    isActive = isActive && allParamsMatch;
                  } else {
                    const currentTab = searchParams?.get('tab');
                    if (currentTab && currentTab !== 'profile') {
                      isActive = false;
                    }
                  }

                  return (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      onClick={() => setIsMobileNavOpen(false)}
                      className={cn(
                        'block px-4 py-2.5 text-xs font-bold tracking-wider uppercase transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary border-l-2 border-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      {sub.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sub navigation links shifted to Topbar */}
      <div className="hidden lg:flex items-center h-full gap-8 overflow-x-auto no-scrollbar ml-8 mr-auto">
        {subLinks.map((sub) => {
          const [subPath, subQuery] = sub.href.split('?');
          let isActive = pathname === subPath;
          
          if (subQuery) {
            const params = new URLSearchParams(subQuery);
            const allParamsMatch = Array.from(params.entries()).every(([key, value]) => {
              const currentVal = searchParams?.get(key);
              if (key === 'tab' && value === 'profile' && !currentVal) {
                return true;
              }
              return currentVal === value;
            });
            isActive = isActive && allParamsMatch;
          } else {
            const currentTab = searchParams?.get('tab');
            if (currentTab && currentTab !== 'profile') {
              isActive = false;
            }
          }
          
          return (
            <Link
              key={sub.href}
              href={sub.href}
              className={cn(
                'relative h-16 flex items-center text-xs font-bold tracking-widest uppercase transition-all duration-300 whitespace-nowrap',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground/85 hover:text-foreground'
              )}
            >
              {sub.name}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(16,185,129,0.4)]" />
              )}
            </Link>
          );
        })}
      </div>



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
                    router.push(path);
                  }}
                  className="text-[11px] font-bold text-primary hover:underline"
                >
                  View All Notices
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300 group"
          title="Toggle light/dark theme"
        >
          {theme === 'light' ? (
            <Moon size={20} className="group-hover:rotate-12 transition-transform" />
          ) : (
            <Sun size={20} className="group-hover:rotate-45 transition-transform" />
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
                {isHydrated && user?.name ? (
                  user.name.charAt(0).toUpperCase()
                ) : (
                  <User size={18} />
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full" />
            </div>

            {/* Name + Role */}
            <div className="text-left hidden sm:flex flex-col justify-center min-w-[5rem]">
              {isHydrated ? (
                <>
                  <p className="text-sm font-bold text-foreground leading-none mb-1">
                    {user?.name || 'User'}
                  </p>
                  <div className="flex items-center">
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary px-1.5 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                      {role ? roleLabels[role] : 'User'}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-3.5 w-20 bg-muted animate-pulse rounded mb-1.5" />
                  <div className="h-3 w-12 bg-muted animate-pulse rounded" />
                </>
              )}
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
              onClick={() => router.push('/dashboard/teacher/profile')}
            >
              <User size={16} className="text-muted-foreground" />
              <span>My Profile</span>
            </button>
            <button
              className="w-full hover:bg-primary/10 flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors"
              onClick={() => {
                clearAuth();
                document.cookie = 'auth-token=; Max-Age=0; path=/';
                document.cookie = 'user-role=; Max-Age=0; path=/';
                document.cookie = 'is-principal=; Max-Age=0; path=/';
                localStorage.removeItem('auth-storage');
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
