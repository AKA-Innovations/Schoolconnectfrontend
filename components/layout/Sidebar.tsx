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
  Sparkles, Building2, UserCog,
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
    { name: 'Dashboard',     href: '/dashboard/admin',          icon: LayoutDashboard },
    { name: 'Teachers',      href: '/dashboard/admin?tab=teachers', icon: Users },
    { name: 'Students',      href: '/dashboard/admin?tab=students', icon: GraduationCap },
    { name: 'School Profile', href: '/dashboard/admin/school',  icon: Building2 },
    { name: 'My Profile',    href: '/dashboard/admin/profile',  icon: UserCog },
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
    { name: 'My Classes', href: '/dashboard/teacher/classes', icon: BookOpen },
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

  return (
    <aside
      style={{ background: 'hsl(var(--sidebar-background))', borderRight: '1px solid hsl(var(--sidebar-border))' }}
      className={cn(
        "h-screen transition-all duration-300 flex flex-col z-50 relative",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* ── Logo ── */}
      <div
        style={{ borderBottom: '1px solid hsl(var(--sidebar-border))' }}
        className="h-16 flex items-center px-4 gap-3 shrink-0"
      >
        {/* Icon mark */}
        <div
          style={{ background: 'hsl(var(--sidebar-primary))' }}
          className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
        >
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight text-foreground">
            Skool<span style={{ color: 'hsl(var(--sidebar-primary))' }}>Connect</span>
          </span>
        )}
      </div>

      {/* ── Collapse toggle ── */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--sidebar-border))',
          color: 'hsl(var(--sidebar-foreground))',
        }}
        className="absolute -right-3 top-20 w-6 h-6 flex items-center justify-center rounded-full shadow-sm z-50 hover:bg-[hsl(var(--accent))] transition-colors"
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              style={isActive ? {
                background: 'hsl(var(--sidebar-accent))',
                color: 'hsl(var(--sidebar-accent-foreground))',
                fontWeight: 600,
              } : {
                color: 'hsl(var(--sidebar-foreground))',
              }}
              className={cn(
                "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 group relative",
                !isActive && "hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
              )}
            >
              <Icon size={18} className={cn("shrink-0", isActive ? "text-[hsl(var(--sidebar-primary))]" : "")} />
              {!collapsed && <span className="ml-3">{link.name}</span>}
              {isActive && !collapsed && (
                <div
                  style={{ background: 'hsl(var(--sidebar-primary))' }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Logout ── */}
      <div style={{ borderTop: '1px solid hsl(var(--sidebar-border))' }} className="p-4">
        <button
          onClick={() => {
            clearAuth();
            document.cookie = "auth-token=; Max-Age=0; path=/";
            document.cookie = "user-role=; Max-Age=0; path=/";
            window.location.href = '/login';
          }}
          style={{ color: 'hsl(var(--sidebar-foreground))' }}
          className="flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-destructive/10 hover:text-destructive transition-colors group"
        >
          <LogOut size={18} className="shrink-0 group-hover:text-destructive" />
          {!collapsed && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
