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
  Sparkles
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
    { name: 'Students', href: '/dashboard/admin?tab=students', icon: GraduationCap },
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
    <aside className={cn(
      "h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col z-50",
      collapsed ? "w-20" : "w-64"
    )}>
      <div className="p-6 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-sidebar-foreground">SkoolConnect</span>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="p-1.5 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link 
              key={link.name} 
              href={link.href}
              className={cn(
                "flex items-center px-3 py-2.5 rounded-md transition-all group relative",
                isActive 
                  ? "bg-primary/10 text-primary font-semibold" 
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon size={18} className={cn(isActive ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-accent-foreground")} />
              {!collapsed && <span className="ml-3 text-sm">{link.name}</span>}
              {isActive && !collapsed && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-l-full shadow-[0px_0px_8px_rgba(var(--primary),0.5)]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button 
          onClick={() => {
            clearAuth();
            document.cookie = "auth-token=; Max-Age=0; path=/";
            document.cookie = "user-role=; Max-Age=0; path=/";
            window.location.href = '/login';
          }}
          className="flex items-center w-full px-3 py-2.5 text-destructive hover:bg-destructive/10 rounded-md transition-all text-sm font-medium"
        >
          <LogOut size={18} />
          {!collapsed && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
