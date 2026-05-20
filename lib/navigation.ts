import {
  School, Users, BarChart3, Settings, CreditCard,
  GraduationCap, Calendar, MessageSquare, ClipboardCheck,
  BookOpen, FileText, LayoutDashboard, Layers,
  ClipboardList, ChevronLeft, ChevronRight, LogOut,
  Sparkles, Building2, UserCog, Grid3X3, Users2, Menu,
  Clock, Compass, LucideIcon
} from 'lucide-react';
import { Role } from '../types/roles';

export interface SidebarLink {
  name: string;
  href: string;
  icon: LucideIcon;
  requiresTeacherRole?: 'isClassTeacher' | 'isSubjectTeacher' | 'isCoordinator' | 'isPrincipal';
  subLinks?: SubNavLink[];
}

export interface SubNavLink {
  name: string;
  href: string;
  icon?: LucideIcon;
  requiresTeacherRole?: 'isClassTeacher' | 'isSubjectTeacher' | 'isCoordinator' | 'isPrincipal';
}

export const baseSidebarLinks: Record<Role, SidebarLink[]> = {
  super_admin: [
    { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    { name: 'Schools', href: '/dashboard/admin/schools', icon: School },
    { name: 'Users', href: '/dashboard/admin/users', icon: Users },
    { name: 'Reports', href: '/dashboard/admin/reports', icon: BarChart3 },
    { name: 'Billing', href: '/dashboard/admin/billing', icon: CreditCard },
    { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
  ],
  school_admin: [
    { 
      name: 'Dashboard', 
      href: '/dashboard/admin', 
      icon: LayoutDashboard,
      subLinks: [
        { name: 'Overview', href: '/dashboard/admin' },
        { name: 'Stats', href: '/dashboard/admin?tab=stats' },
      ]
    },
    { 
      name: 'Users', 
      href: '/dashboard/admin?tab=teachers', 
      icon: Users,
      subLinks: [
        { name: 'Teachers', href: '/dashboard/admin?tab=teachers' },
        { name: 'Students', href: '/dashboard/admin/students' },
      ]
    },
    { 
      name: 'Academics', 
      href: '/dashboard/admin/class/dashboard', 
      icon: BookOpen,
      subLinks: [
        { name: 'Dashboard', href: '/dashboard/admin/class/dashboard' },
        { name: 'Subjects', href: '/dashboard/admin/class/subjects' },
        { name: 'Mapping', href: '/dashboard/admin/class/subject-mapping' },
        { name: 'Periods', href: '/dashboard/admin/class/period-slots' },
        { name: 'Timetable', href: '/dashboard/admin/class/timetable' },
        { name: 'Class Teachers', href: '/dashboard/admin/class/teachers' },
      ]
    },
    { 
      name: 'Attendance', 
      href: '/dashboard/admin/attendance', 
      icon: ClipboardCheck,
    },
    { 
      name: 'Academic Module', 
      href: '/dashboard/admin/academic', 
      icon: GraduationCap,
      subLinks: [
        { name: 'Chapters & Topics', href: '/dashboard/admin/academic?tab=chapters' },
        { name: 'Homework', href: '/dashboard/admin/academic?tab=homework' },
        { name: 'Classwork', href: '/dashboard/admin/academic?tab=classwork' },
        { name: 'Progress', href: '/dashboard/admin/academic?tab=progress' },
        { name: 'Study Material', href: '/dashboard/admin/academic?tab=materials' },
      ]
    },
    { 
      name: 'Exams & Results', 
      href: '/dashboard/admin/exams', 
      icon: ClipboardList,
      subLinks: [
        { name: 'Exam Master', href: '/dashboard/admin/exams' },
        { name: 'Schedule Builder', href: '/dashboard/admin/exams/schedule-builder' },
        { name: 'Result Monitoring', href: '/dashboard/admin/exams/results' },
        { name: 'Report Cards', href: '/dashboard/admin/exams/report-cards' },
      ]
    },
    { 
      name: 'School', 
      href: '/dashboard/admin/school', 
      icon: Building2,
      subLinks: [
        { name: 'Profile', href: '/dashboard/admin/school' },
        { name: 'Onboard Student', href: '/dashboard/admin/student/register' },
      ]
    },
    { 
      name: 'Profile', 
      href: '/dashboard/admin/profile', 
      icon: UserCog,
    },
  ],
  principal: [
    { name: 'Dashboard', href: '/dashboard/principal', icon: LayoutDashboard },
    { 
      name: 'Staff & Students', 
      href: '/dashboard/principal/teachers', 
      icon: Users,
      subLinks: [
        { name: 'Teachers', href: '/dashboard/principal/teachers' },
        { name: 'Students', href: '/dashboard/principal/students' },
      ]
    },
    { name: 'Timetable', href: '/dashboard/principal/timetable', icon: Calendar },
    { name: 'Announcements', href: '/dashboard/principal/announcements', icon: MessageSquare },
    { name: 'Reports', href: '/dashboard/principal/reports', icon: BarChart3 },
  ],
  teacher: [
    { 
      name: 'Dashboard', 
      href: '/dashboard/teacher', 
      icon: LayoutDashboard,
      subLinks: [
        { name: 'Overview', href: '/dashboard/teacher' },
        { name: 'Schedule', href: '/dashboard/teacher/schedule' },
      ]
    },
    { 
      name: 'Classroom', 
      href: '/dashboard/teacher/classes', 
      icon: BookOpen,
      subLinks: [
        { name: 'My Classes', href: '/dashboard/teacher/classes' },
        { name: 'My Classroom', href: '/dashboard/teacher/classroom', requiresTeacherRole: 'isClassTeacher' },
        { name: 'Attendance', href: '/dashboard/teacher/attendance', requiresTeacherRole: 'isClassTeacher' },
      ]
    },
    { 
      name: 'Coordinator', 
      href: '/dashboard/coordinator/attendance', 
      icon: Compass,
      requiresTeacherRole: 'isCoordinator',
      subLinks: [
        { name: 'Attendance', href: '/dashboard/coordinator/attendance' },
        { name: 'Dashboard', href: '/dashboard/teacher/coordinator' },
        { name: 'Mapping', href: '/dashboard/coordinator/subject-mapping' },
        { name: 'Edit Timetable', href: '/dashboard/coordinator/timetable' },
      ]
    },
    { 
      name: 'Exams', 
      href: '/dashboard/teacher/exams/result-entry', 
      icon: FileText,
      subLinks: [
        { name: 'Result Entry', href: '/dashboard/teacher/exams/result-entry' },
      ]
    },
    { 
      name: 'Academic', 
      href: '/dashboard/teacher/academic', 
      icon: GraduationCap,
      subLinks: [
        { name: 'Homework', href: '/dashboard/teacher/academic?tab=homework' },
        { name: 'Classwork', href: '/dashboard/teacher/academic?tab=classwork' },
        { name: 'Progress', href: '/dashboard/teacher/academic?tab=progress' },
        { name: 'Materials', href: '/dashboard/teacher/academic?tab=materials' },
      ]
    },
    { name: 'Profile', href: '/dashboard/teacher/profile', icon: UserCog },
  ],
  subject_coordinator: [
    { name: 'Dashboard', href: '/dashboard/coordinator', icon: LayoutDashboard },
    { 
      name: 'Management', 
      href: '/dashboard/coordinator/classes', 
      icon: BookOpen,
      subLinks: [
        { name: 'Classes', href: '/dashboard/coordinator/classes' },
        { name: 'Teachers', href: '/dashboard/coordinator/teachers' },
        { name: 'Students', href: '/dashboard/coordinator/students' },
      ]
    },
    { 
      name: 'Academics', 
      href: '/dashboard/coordinator/attendance', 
      icon: Grid3X3,
      subLinks: [
        { name: 'Attendance', href: '/dashboard/coordinator/attendance' },
        { name: 'Timetable', href: '/dashboard/coordinator/timetable' },
        { name: 'Mapping', href: '/dashboard/coordinator/subject-mapping' },
      ]
    },
  ],
  student: [
    { 
      name: 'Exams', 
      href: '/dashboard/student/exams/schedule', 
      icon: ClipboardList,
      subLinks: [
        { name: 'My Schedule', href: '/dashboard/student/exams/schedule' },
        { name: 'Report Cards', href: '/dashboard/student/exams/report-card' },
      ]
    },
  ],
  parent: [],
};
export const isLinkActive = (link: SidebarLink, pathname: string, searchParams: URLSearchParams) => {
  const checkMatch = (href: string) => {
    const [linkPath, linkQuery] = href.split('?');
    const pathMatches = pathname === linkPath;
    
    if (linkQuery) {
      const params = new URLSearchParams(linkQuery);
      const allParamsMatch = Array.from(params.entries()).every(([key, value]) => 
        searchParams.get(key) === value
      );
      return allParamsMatch && pathMatches;
    }
    
    // If no query in link, only match if no query in current URL (for exact matches like Dashboard)
    // or if the path is a sub-path of the link path
    if (linkPath === '/dashboard/admin' || linkPath === '/dashboard/teacher') {
       return pathMatches && !searchParams.toString();
    }

    return pathMatches || pathname.startsWith(linkPath + '/');
  };

  // Check the main link
  if (checkMatch(link.href)) return true;

  // Check all sub-links
  if (link.subLinks?.some(sub => checkMatch(sub.href))) return true;

  return false;
};
