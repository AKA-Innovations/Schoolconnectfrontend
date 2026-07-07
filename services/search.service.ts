import { teacherService } from './teacher/service';
import { studentService } from './student/service';
import { adminService } from './admin/service';
import { classService } from './class/service';

export interface SearchResult {
  id: string;
  name: string;
  type: 'student' | 'teacher' | 'class' | 'subject';
  href: string;
  subtitle?: string;
}

export const searchService = {
  globalSearch: async (query: string, schoolId: string, role: string | null): Promise<SearchResult[]> => {
    if (!query || query.length < 2) return [];

    try {
      const searchTerms = query.trim().split(' ');
      const firstNameFilter = searchTerms[0];
      const results: SearchResult[] = [];

      const isAdmin = role === 'school_admin' || role === 'super_admin' || role === 'principal';
      const isTeacher = role === 'teacher' || role === 'subject_coordinator';

      // 1. Search Teachers (Only for Admins/Principal)
      if (isAdmin) {
        try {
          const teachersRes = await adminService.getTeachers(1, 50, { schoolId, firstName: firstNameFilter } as any);
          const teacherList = (teachersRes as any).teachers || (teachersRes as any).data || [];
          
          if (Array.isArray(teacherList)) {
            teacherList
              .filter((t: any) => `${t.firstName} ${t.lastName}`.toLowerCase().includes(query.toLowerCase()))
              .forEach((t: any) => {
                results.push({
                  id: t.id,
                  name: `${t.firstName} ${t.lastName}`,
                  type: 'teacher',
                  href: `/dashboard/admin/teacher/${t.id}`,
                  subtitle: t.subjectName || t.subject || 'Faculty',
                });
              });
          }
        } catch (err) {
          console.error('Teacher search failed:', err);
        }
      }

      // 2. Search Students (Dynamic link based on role)
      try {
        const students = await studentService.list({ schoolId, firstName: firstNameFilter, limit: 50 });
        if (students.items) {
          const studentPath = isAdmin ? '/dashboard/admin/student' : '/dashboard/teacher/students';
          
          students.items
            .filter(s => `${s.firstName} ${s.lastName}`.toLowerCase().includes(query.toLowerCase()))
            .forEach(s => {
              results.push({
                id: s.id,
                name: `${s.firstName} ${s.lastName}`,
                type: 'student',
                href: `${studentPath}/${s.id}`,
                subtitle: s.academics?.[0] ? `${s.academics[0].className} ${s.academics[0].sectionName}` : 'Student',
              });
            });
        }
      } catch (err) {
        console.error('Student search failed:', err);
      }

      // 3. Search Classes
      try {
        const classes = await adminService.getClasses(schoolId);
        if (Array.isArray(classes)) {
          const classPath = isAdmin ? '/dashboard/admin/class/dashboard' : '/dashboard/teacher/classroom';
          
          classes.filter(c => 
            c.className?.toLowerCase().includes(query.toLowerCase()) || 
            c.sectionName?.toLowerCase().includes(query.toLowerCase())
          ).forEach(c => {
            results.push({
              id: c.id?.toString() || Math.random().toString(),
              name: `${c.className} - ${c.sectionName}`,
              type: 'class',
              href: classPath,
              subtitle: `${c.studentCount || 0} Students`,
            });
          });
        }
      } catch (err) {
        console.error('Class search failed:', err);
      }

      try {
        const subjects = await classService.getSubjectOptions(schoolId, undefined, undefined, query);
        if (Array.isArray(subjects)) {
          subjects.forEach(s => {
            results.push({
              id: s.id?.toString() || Math.random().toString(),
              name: s.subjectName,
              type: 'subject',
              href: isAdmin ? '/dashboard/admin/class/subjects' : '/dashboard/teacher/coordinator',
              subtitle: s.subjectCode || 'Subject',
            });
          });
        }
      } catch (err) {
        console.error('Subject search failed:', err);
      }

      return results.slice(0, 10);
    } catch (error) {
      console.error('Global search error:', error);
      throw error;
    }
  },
};
