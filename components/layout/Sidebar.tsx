'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils';
import {
  School, Users, BarChart3, Settings, CreditCard,
  GraduationCap, Calendar, MessageSquare, ClipboardCheck,
  BookOpen, FileText, LayoutDashboard, Layers,
  ClipboardList, ChevronLeft, ChevronRight, LogOut,
  Sparkles, Building2, UserCog, Grid3X3, Users2, Menu,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Role } from '../../types/roles';

const sidebarLinks: Record<Role, any[]> = {
  super_admin: [
    { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    { name: 'Schools', href: '/dashboard/admin/schools', icon: School },
    { name: 'Users', href: '/dashboard/admin/users', icon: Users },
    { name: 'Reports', href: '/dashboard/admin/reports', icon: BarChart3 },
    { name: 'Billing', href: '/dashboard/admin/billing', icon: CreditCard },
    { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
  ],
  school_admin: [
    { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    { name: 'Teachers', href: '/dashboard/admin?tab=teachers', icon: Users },
    { name: 'Students', href: '/dashboard/admin/students', icon: GraduationCap },
    { name: 'Classes', href: '/dashboard/admin/class/dashboard', icon: BookOpen },
    { name: 'Class Teachers', href: '/dashboard/admin/class/teachers', icon: Users2 },
    { name: 'School Profile', href: '/dashboard/admin/school', icon: Building2 },
    { name: 'My Profile', href: '/dashboard/admin/profile', icon: UserCog },
  ],
  principal: [
    { name: 'Dashboard', href: '/dashboard/principal', icon: LayoutDashboard },
    { name: 'Teachers', href: '/dashboard/principal/teachers', icon: Users },
    { name: 'Students', href: '/dashboard/principal/students', icon: GraduationCap },
    { name: 'Timetable', href: '/dashboard/principal/timetable', icon: Calendar },
    { name: 'Announcements', href: '/dashboard/principal/announcements', icon: MessageSquare },
    { name: 'Reports', href: '/dashboard/principal/reports', icon: BarChart3 },
  ],
  teacher: [
    { name: 'Dashboard', href: '/dashboard/teacher', icon: LayoutDashboard },
    { name: 'My Profile', href: '/dashboard/teacher/profile', icon: UserCog },
    { name: 'My Classes', href: '/dashboard/teacher/classes', icon: BookOpen },
    { name: 'Class Room', href: '/dashboard/teacher/classroom', icon: Users2 },
    { name: 'Attendance', href: '/dashboard/teacher/attendance', icon: ClipboardCheck },
    { name: 'Assignments', href: '/dashboard/teacher/assignments', icon: FileText },
    { name: 'Grades', href: '/dashboard/teacher/grades', icon: GraduationCap },
    { name: 'Schedule', href: '/dashboard/teacher/schedule', icon: Calendar },
  ],
  subject_coordinator: [
    { name: 'Dashboard', href: '/dashboard/coordinator', icon: LayoutDashboard },
    { name: 'Subjects', href: '/dashboard/coordinator/subjects', icon: Layers },
    { name: 'Curriculum', href: '/dashboard/coordinator/curriculum', icon: BookOpen },
    { name: 'Teachers', href: '/dashboard/coordinator/teachers', icon: Users },
    { name: 'Assessments', href: '/dashboard/coordinator/assessments', icon: ClipboardList },
  ],
  student: [],
  parent: [],
};

export function Sidebar() {
  const pathname = usePathname();
  const { role, clearAuth } = useAuthStore();
  const [collapsed, setCollapsed] = React.useState(false);

  const links = role ? sidebarLinks[role] : [];
  const showLabels = !collapsed;

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-visible transition-all duration-300',
        collapsed ? 'w-20' : 'w-72'
      )}
    >
      <aside
        className="flex flex-col h-full w-full relative overflow-hidden text-white border-r"
        style={{ background: 'linear-gradient(180deg, #0f172a 0%, #0b1220 50%, #020617 100%)' }}
      >
        {/* Glow */}
        <div className="absolute top-0 left-0 w-full h-64 bg-primary/10 blur-2xl opacity-40 pointer-events-none" />

        {/* BRAND */}
        <div className={cn('flex items-center relative z-10', collapsed ? 'justify-center px-0 py-8' : 'gap-4 px-8 py-8')}>
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 transition hover:scale-105 shrink-0">
            <Sparkles size={20} className="text-white" />
          </div>

          {showLabels && (
            <div>
              <div className="text-white font-bold text-lg">SkoolConnect</div>
              <div className="text-[10px] text-white/60 uppercase tracking-[0.35em] font-bold mt-1">
                {role ? role.replace('_', ' ') : 'School'}
              </div>
            </div>
          )}
        </div>

        {/* NAV */}
        <nav className={cn('flex-1 relative z-10 overflow-y-auto', collapsed ? 'px-3' : 'px-4')}>
          {showLabels && <p className="px-5 text-[10px] uppercase tracking-[0.3em] font-bold text-white/20 mb-4">Core</p>}

          {links.map((link) => {
            const active = link.href === '/' ? pathname === '/' : pathname?.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center rounded-2xl text-sm transition-all duration-300 group relative',
                  collapsed ? 'justify-center gap-0 px-0 py-3 mx-auto w-12' : 'gap-4 px-5 py-3',
                  active ? 'bg-white/10 text-white shadow-inner' : 'text-white/50 hover:text-white hover:bg-white/5'
                )}
                title={collapsed ? link.name : undefined}
              >
                <div className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center transition shrink-0',
                  active ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/30 group-hover:text-white group-hover:bg-white/10'
                )}>
                  <Icon size={18} />
                </div>

                {showLabels && (
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold tracking-tight">{link.name}</div>
                  </div>
                )}

                {active && showLabels && (
                  <>
                    <ChevronRight size={14} className="text-primary opacity-70" />
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full shadow-md shadow-primary/50" />
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* FOOTER */}
        <div className={cn('space-y-3 border-t border-white/5 bg-black/30 backdrop-blur z-10', collapsed ? 'p-3' : 'p-5')}>
          {showLabels && role === 'school_admin' && (
            <Link href="/dashboard/admin/student/register" className="flex items-center justify-center w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold tracking-widest transition hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]">
              Quick Onboard
            </Link>
          )}

          <button
            onClick={() => {
              clearAuth();
              document.cookie = 'auth-token=; Max-Age=0; path=/';
              document.cookie = 'user-role=; Max-Age=0; path=/';
              window.location.href = '/login';
            }}
            className={cn(
              'flex items-center justify-center gap-2 text-white/30 hover:text-rose-400 text-[11px] font-bold tracking-widest w-full rounded-xl transition hover:bg-rose-500/5',
              showLabels ? 'py-2' : 'py-2.5'
            )}
          >
            <LogOut size={14} />
            {showLabels && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <button
        type="button"
        onClick={() => setCollapsed((current) => !current)}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 items-center justify-center rounded-full bg-card border border-border text-foreground shadow-sm z-20 hover:bg-accent transition-colors"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>
    </div>
  );
}
