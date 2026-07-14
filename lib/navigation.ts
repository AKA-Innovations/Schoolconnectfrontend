import {
  School, Users, BarChart3, Settings, CreditCard,
  GraduationCap, Calendar, MessageSquare, ClipboardCheck,
  BookOpen, FileText, LayoutDashboard, Layers,
  ClipboardList, ChevronLeft, ChevronRight, LogOut,
  Sparkles, Building2, UserCog, Grid3X3, Users2, Menu,
  Clock, Compass, Shield, LucideIcon, Megaphone, CalendarClock
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
        { name: 'Capacity Management', href: '/dashboard/admin/class/dashboard' },
        { name: 'Subjects', href: '/dashboard/admin/class/subjects' },
        { name: 'Mapping', href: '/dashboard/admin/class/subject-mapping' },
        { name: 'Timetable', href: '/dashboard/admin/class/timetable' },
        { name: 'Class Teachers', href: '/dashboard/admin/class/teachers' },
        { name: 'Student Roster', href: '/dashboard/admin/class/students' },
        { name: 'Teacher Attendance', href: '/dashboard/admin/class/teacher-attendance' },
      ]
    },
    { 
      name: 'Attendance', 
      href: '/dashboard/admin/attendance', 
      icon: ClipboardCheck,
    },
    {
      name: 'Leave & Subs',
      href: '/dashboard/admin/teacher-leave?tab=requests',
      icon: CalendarClock,
      subLinks: [
        { name: 'Leave Requests', href: '/dashboard/admin/teacher-leave?tab=requests' },
        { name: 'Substitutions', href: '/dashboard/admin/teacher-leave?tab=substitutes' },
        { name: 'Teacher Attendance', href: '/dashboard/admin/teacher-leave?tab=attendance' },
      ]
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
      href: '/dashboard/admin/exams?tab=master', 
      icon: ClipboardList,
      subLinks: [
        { name: 'Exam Types',       href: '/dashboard/admin/exams?tab=exam-types' },
        { name: 'Exam Master',      href: '/dashboard/admin/exams?tab=master' },
        { name: 'Subject Config',   href: '/dashboard/admin/exams?tab=subject-config' },
        { name: 'Grade Config',     href: '/dashboard/admin/exams?tab=grade-config' },
        { name: 'Schedules',        href: '/dashboard/admin/exams?tab=schedules' },
        { name: 'Results',          href: '/dashboard/admin/exams?tab=results' },
        { name: 'Analytics',        href: '/dashboard/admin/exams?tab=analytics' },
      ]
    },
    { 
      name: 'School', 
      href: '/dashboard/admin/school', 
      icon: Building2,
      subLinks: [
        { name: 'Profile', href: '/dashboard/admin/school' },
        { name: 'School Structure', href: '/dashboard/admin/school?tab=structure' },
        { name: 'Periods', href: '/dashboard/admin/school?tab=periods' },
        { name: 'Onboard Student', href: '/dashboard/admin/student/register' },
      ]
    },
    { 
      name: 'Profile', 
      href: '/dashboard/admin/profile', 
      icon: UserCog,
    },
    {
      name: 'Announcements',
      href: '/dashboard/admin/announcements?tab=notices',
      icon: Megaphone,
      subLinks: [
        { name: 'Notices', href: '/dashboard/admin/announcements?tab=notices' },
        { name: 'Events', href: '/dashboard/admin/announcements?tab=events' },
        { name: 'Calendar', href: '/dashboard/admin/announcements?tab=calendar' },
        { name: 'Holidays', href: '/dashboard/admin/announcements?tab=holidays' },
        { name: 'Event Types', href: '/dashboard/admin/announcements?tab=event-types' },
      ]
    },
  ],
  principal: [
    {
      name: 'Overview',
      href: '/dashboard/principal?tab=overview',
      icon: LayoutDashboard,
    },
    {
      name: 'Academic Activity',
      href: '/dashboard/principal?tab=academic',
      icon: BookOpen,
      subLinks: [
        { name: 'Homework', href: '/dashboard/principal?tab=academic&sub=homework' },
        { name: 'Classwork', href: '/dashboard/principal?tab=academic&sub=classwork' },
        { name: 'Syllabus Progress', href: '/dashboard/principal?tab=academic&sub=progress' },
        { name: 'Study Materials', href: '/dashboard/principal?tab=academic&sub=materials' },
      ]
    },
    {
      name: 'Teachers',
      href: '/dashboard/principal?tab=teachers',
      icon: Users,
    },
    {
      name: 'Students',
      href: '/dashboard/principal?tab=students',
      icon: GraduationCap,
    },
    {
      name: 'Timetable',
      href: '/dashboard/principal?tab=timetable',
      icon: Calendar,
    },
    {
      name: 'Exams',
      href: '/dashboard/principal?tab=exams&sub=list',
      icon: FileText,
      subLinks: [
        { name: 'Exam List',    href: '/dashboard/principal?tab=exams&sub=list' },
        { name: 'Schedules',    href: '/dashboard/principal?tab=exams&sub=schedules' },
        { name: 'Marks Review', href: '/dashboard/principal?tab=exams&sub=marks' },
        { name: 'Results',      href: '/dashboard/principal?tab=exams&sub=results' },
        { name: 'Analytics',    href: '/dashboard/principal?tab=exams&sub=analytics' },
      ]
    },
    {
      name: 'Leave & Subs',
      href: '/dashboard/admin/teacher-leave?tab=requests',
      icon: CalendarClock,
      subLinks: [
        { name: 'Leave Requests', href: '/dashboard/admin/teacher-leave?tab=requests' },
        { name: 'Substitutions', href: '/dashboard/admin/teacher-leave?tab=substitutes' },
        { name: 'Teacher Attendance', href: '/dashboard/admin/teacher-leave?tab=attendance' },
      ]
    },
    {
      name: 'Announcements',
      href: '/dashboard/principal/announcements?tab=notices',
      icon: Megaphone,
      subLinks: [
        { name: 'Notices', href: '/dashboard/principal/announcements?tab=notices' },
        { name: 'Events', href: '/dashboard/principal/announcements?tab=events' },
        { name: 'Calendar', href: '/dashboard/principal/announcements?tab=calendar' },
        { name: 'Holidays', href: '/dashboard/principal/announcements?tab=holidays' },
      ]
    },
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
      name: 'Principal View',
      href: '/dashboard/principal',
      icon: Shield,
      requiresTeacherRole: 'isPrincipal',
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
        { name: 'Marks Entry',   href: '/dashboard/teacher/exams/result-entry' },
        { name: 'My Schedules',  href: '/dashboard/teacher/exams/schedules' },
        { name: 'Class Results', href: '/dashboard/teacher/exams/results', requiresTeacherRole: 'isClassTeacher' },
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
    {
      name: 'Leave',
      href: '/dashboard/teacher/leave',
      icon: CalendarClock,
    },
    { name: 'Profile', href: '/dashboard/teacher/profile', icon: UserCog },
    {
      name: 'Announcements',
      href: '/dashboard/teacher/announcements?tab=notices',
      icon: Megaphone,
      subLinks: [
        { name: 'Notices', href: '/dashboard/teacher/announcements?tab=notices' },
        { name: 'Events', href: '/dashboard/teacher/announcements?tab=events' },
        { name: 'Calendar', href: '/dashboard/teacher/announcements?tab=calendar' },
        { name: 'Holidays', href: '/dashboard/teacher/announcements?tab=holidays' },
      ]
    },
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
    {
      name: 'Announcements',
      href: '/dashboard/coordinator/announcements?tab=notices',
      icon: Megaphone,
      subLinks: [
        { name: 'Notices', href: '/dashboard/coordinator/announcements?tab=notices' },
        { name: 'Events', href: '/dashboard/coordinator/announcements?tab=events' },
        { name: 'Calendar', href: '/dashboard/coordinator/announcements?tab=calendar' },
        { name: 'Holidays', href: '/dashboard/coordinator/announcements?tab=holidays' },
      ]
    },
  ],
  student: [
    {
      name: 'Dashboard',
      href: '/dashboard/student',
      icon: LayoutDashboard,
    },
    {
      name: 'Academics',
      href: '/dashboard/student/homework',
      icon: BookOpen,
      subLinks: [
        { name: 'Homework', href: '/dashboard/student/homework' },
      ]
    },
    { 
      name: 'Exams', 
      href: '/dashboard/student/exams/schedule', 
      icon: ClipboardList,
      subLinks: [
        { name: 'My Schedule',    href: '/dashboard/student/exams/schedule' },
        { name: 'My Marks',       href: '/dashboard/student/exams/marks' },
        { name: 'Report Card',    href: '/dashboard/student/exams/report-card' },
        { name: 'My Performance', href: '/dashboard/student/exams/performance' },
      ]
    },
    {
      name: 'Announcements',
      href: '/dashboard/student/announcements?tab=notices',
      icon: Megaphone,
      subLinks: [
        { name: 'Notices', href: '/dashboard/student/announcements?tab=notices' },
        { name: 'Events', href: '/dashboard/student/announcements?tab=events' },
        { name: 'Calendar', href: '/dashboard/student/announcements?tab=calendar' },
        { name: 'Holidays', href: '/dashboard/student/announcements?tab=holidays' },
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

export const getSidebarLinks = (role: Role | null, teacherRoles: any): SidebarLink[] => {
  if (!role) return [];
  if (role === 'teacher' && teacherRoles.isPrincipal) {
    return baseSidebarLinks['principal'].map(link => ({
      ...link,
      // Principal links inside teacher context are identical, but we also append Profile link
    })).concat([
      { name: 'Profile', href: '/dashboard/teacher/profile', icon: UserCog }
    ]);
  }
  
  const base = baseSidebarLinks[role] || [];
  return base
    .filter((link) => {
      if (!link.requiresTeacherRole) return true;
      return teacherRoles[link.requiresTeacherRole];
    })
    .map((link) => {
      if (!link.subLinks) return link;
      return {
        ...link,
        subLinks: link.subLinks.filter(sub => {
          if (!sub.requiresTeacherRole) return true;
          return teacherRoles[sub.requiresTeacherRole];
        })
      };
    });
};
