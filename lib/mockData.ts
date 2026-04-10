import { AdminSummary, PrincipalSummary, TeacherSummary, CoordinatorSummary, StudentSummary } from '../types/roles';

export const mockAdminSummary: AdminSummary = {
  kpis: [
    { label: 'Total Teachers', value: 25, trend: 2, trendType: 'up', iconName: 'Users' },
    { label: 'Total Students', value: 450, trend: 15, trendType: 'up', iconName: 'GraduationCap' },
    { label: 'Active Classes', value: 18, trend: 1, trendType: 'up', iconName: 'BookOpen' },
    { label: 'Attendance Rate', value: '94%', trend: 2, trendType: 'up', iconName: 'CheckCircle' },
  ],
  school: {
    id: '1',
    name: 'Greenwood High School',
    principal: 'Dr. Sarah Johnson',
    totalStudents: 450,
    totalTeachers: 25,
    totalClasses: 18,
  },
  teachers: [
    {
      id: '1',
      name: 'Alice Brown',
      firstName: 'Alice',
      lastName: 'Brown',
      emailId: 'alice.brown@school.com',
      employeeEmail: 'alice.brown@school.com',
      subject: 'Mathematics',
      mobileNumber: '+1234567890',
      classes: [
        { className: '10', sectionName: 'A', subjectName: 'Mathematics' },
        { className: '11', sectionName: 'B', subjectName: 'Calculus' }
      ],
      status: 'active',
      schoolId: '1',
      employeeId: 'EMP-001',
      joiningDate: '2020-01-15',
      dateOfBirth: '1985-03-15',
      gender: 'female',
      isPrincipal: false,
      isCoordinator: false,
      isClassTeacher: true,
      isSubjectTeacher: true,
      profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    },
    {
      id: '2',
      name: 'Bob White',
      firstName: 'Bob',
      lastName: 'White',
      emailId: 'bob.white@school.com',
      employeeEmail: 'bob.white@school.com',
      subject: 'Physics',
      mobileNumber: '+1234567891',
      classes: [
        { className: '11', sectionName: 'A', subjectName: 'Physics' }
      ],
      status: 'active',
      schoolId: '1',
      employeeId: 'EMP-002',
      joiningDate: '2019-08-20',
      dateOfBirth: '1982-07-22',
      gender: 'male',
      isPrincipal: false,
      isCoordinator: true,
      isClassTeacher: false,
      isSubjectTeacher: true,
      profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    },
    {
      id: '3',
      name: 'Charlie Green',
      firstName: 'Charlie',
      lastName: 'Green',
      emailId: 'charlie.green@school.com',
      employeeEmail: 'charlie.green@school.com',
      subject: 'History',
      mobileNumber: '+1234567892',
      classes: [
        { className: '9', sectionName: 'C', subjectName: 'World History' }
      ],
      status: 'active',
      schoolId: '1',
      employeeId: 'EMP-003',
      joiningDate: '2021-03-10',
      dateOfBirth: '1978-11-08',
      gender: 'male',
      isPrincipal: false,
      isCoordinator: false,
      isClassTeacher: true,
      isSubjectTeacher: true,
      profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    },
  ],
  students: [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@student.com',
      grade: '10',
      class: '10-A',
      phone: '+1234567894',
      parentName: 'Jane Doe',
      parentPhone: '+1234567895',
      status: 'active',
      schoolId: '1',
      enrollmentDate: '2023-09-01',
      dateOfBirth: '2008-05-15',
      gender: 'male',
      profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@student.com',
      grade: '11',
      class: '11-B',
      phone: '+1234567896',
      parentName: 'Bob Smith',
      parentPhone: '+1234567897',
      status: 'active',
      schoolId: '1',
      enrollmentDate: '2023-09-01',
      dateOfBirth: '2007-08-22',
      gender: 'female',
      profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    },
  ],
  classes: [
    { id: '1', name: 'Math 101', grade: '10', subject: 'Mathematics', teacherId: '1', teacherName: 'Alice Brown', studentCount: 25, schoolId: '1' },
    { id: '2', name: 'Calculus', grade: '11', subject: 'Mathematics', teacherId: '1', teacherName: 'Alice Brown', studentCount: 20, schoolId: '1' },
    { id: '3', name: 'Physics 101', grade: '11', subject: 'Physics', teacherId: '2', teacherName: 'Bob White', studentCount: 22, schoolId: '1' },
  ],
  recentData: [],
};

export const mockPrincipalSummary: PrincipalSummary = {
  kpis: [
    { label: 'Total Teachers', value: 45, trend: 2, trendType: 'up', iconName: 'Users' },
    { label: 'Total Students', value: 1200, trend: 1, trendType: 'up', iconName: 'GraduationCap' },
    { label: 'Attendance Rate Today', value: '94%', trend: 3, trendType: 'up', iconName: 'CheckCircle' },
    { label: 'Pending Approvals', value: 8, trend: 0, trendType: 'neutral', iconName: 'Clock' },
  ],
  teachers: [
    { id: '1', name: 'Alice Brown', subject: 'Mathematics', attendance: 'Present' },
    { id: '2', name: 'Bob White', subject: 'Physics', attendance: 'Absent' },
    { id: '3', name: 'Charlie Green', subject: 'History', attendance: 'Present' },
  ],
  recentData: [],
};

export const mockTeacherSummary: TeacherSummary = {
  kpis: [
    { label: 'My Classes Today', value: 4, trend: 0, trendType: 'neutral', iconName: 'BookOpen' },
    { label: 'Students Present', value: '124/130', trend: 2, trendType: 'up', iconName: 'Users' },
    { label: 'Pending Assignments', value: 15, trend: -5, trendType: 'down', iconName: 'FileText' },
    { label: 'Upcoming Tests', value: 2, trend: 1, trendType: 'up', iconName: 'AlertTriangle' },
  ],
  classes: [
    { id: '1', name: 'Grade 10 - Math', time: '09:00 AM', room: 'Room 302' },
    { id: '2', name: 'Grade 11 - Calculus', time: '11:30 AM', room: 'Room 105' },
    { id: '3', name: 'Grade 9 - Algebra', time: '02:00 PM', room: 'Room 201' },
  ],
  recentData: [],
};

export const mockCoordinatorSummary: CoordinatorSummary = {
  kpis: [
    { label: 'Subjects Managed', value: 6, trend: 0, trendType: 'neutral', iconName: 'Layers' },
    { label: 'Teachers Coordinated', value: 18, trend: 3, trendType: 'up', iconName: 'Users' },
    { label: 'Assessments Scheduled', value: 12, trend: 4, trendType: 'up', iconName: 'ClipboardList' },
    { label: 'Avg Score (Dept)', value: '78%', trend: 5, trendType: 'up', iconName: 'BarChart' },
  ],
  subjects: [
    { id: '1', name: 'Advanced Mathematics', teacherCount: 5, progress: 75 },
    { id: '2', name: 'General Science', teacherCount: 8, progress: 60 },
    { id: '3', name: 'English Literature', teacherCount: 5, progress: 90 },
  ],
  recentData: [],
};

export const mockStudentSummary: StudentSummary = {
  kpis: [
    { label: 'My GPA', value: '3.8', trend: 0.2, trendType: 'up', iconName: 'Award' },
    { label: 'Attendance Rate', value: '96%', trend: 2, trendType: 'up', iconName: 'CheckCircle' },
    { label: 'Pending Assignments', value: 3, trend: -1, trendType: 'down', iconName: 'FileText' },
    { label: 'Upcoming Tests', value: 2, trend: 0, trendType: 'neutral', iconName: 'AlertTriangle' },
  ],
  assignments: [
    { id: '1', subject: 'Mathematics', title: 'Calculus Homework #5', dueDate: '2024-01-15', status: 'pending' },
    { id: '2', subject: 'Physics', title: 'Lab Report: Newton\'s Laws', dueDate: '2024-01-16', status: 'submitted' },
    { id: '3', subject: 'English', title: 'Essay: Shakespeare Analysis', dueDate: '2024-01-18', status: 'graded', grade: 'A-' },
    { id: '4', subject: 'History', title: 'World War II Research Paper', dueDate: '2024-01-20', status: 'pending' },
  ],
  attendance: [
    { date: '2024-01-10', status: 'present', subject: 'Mathematics' },
    { date: '2024-01-10', status: 'present', subject: 'Physics' },
    { date: '2024-01-10', status: 'present', subject: 'English' },
    { date: '2024-01-09', status: 'late', subject: 'History' },
    { date: '2024-01-09', status: 'present', subject: 'Chemistry' },
  ],
  recentData: [],
};
