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
      email: 'alice.brown@school.com', 
      subject: 'Mathematics', 
      phone: '+1234567890', 
      classes: ['Math 101', 'Calculus'], 
      status: 'active', 
      schoolId: '1', 
      hireDate: '2020-01-15',
      dateOfBirth: '1985-03-15',
      gender: 'female',
      profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      addresses: [
        {
          id: '1',
          type: 'home',
          street: '123 Maple Street',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701',
          country: 'USA',
          isPrimary: true
        }
      ],
      schoolRecords: [
        {
          id: '1',
          type: 'qualification',
          title: 'Master of Mathematics',
          institution: 'State University',
          year: 2010,
          description: 'Specialized in Applied Mathematics'
        },
        {
          id: '2',
          type: 'certification',
          title: 'Teaching Certificate',
          institution: 'State Board of Education',
          year: 2012,
          description: 'Secondary Mathematics Certification'
        }
      ],
      emergencyContact: {
        name: 'John Brown',
        relationship: 'Spouse',
        phone: '+1234567891'
      }
    },
    { 
      id: '2', 
      name: 'Bob White', 
      email: 'bob.white@school.com', 
      subject: 'Physics', 
      phone: '+1234567891', 
      classes: ['Physics 101'], 
      status: 'active', 
      schoolId: '1', 
      hireDate: '2019-08-20',
      dateOfBirth: '1982-07-22',
      gender: 'male',
      profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      addresses: [
        {
          id: '2',
          type: 'home',
          street: '456 Oak Avenue',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62702',
          country: 'USA',
          isPrimary: true
        }
      ],
      schoolRecords: [
        {
          id: '3',
          type: 'qualification',
          title: 'PhD in Physics',
          institution: 'Tech University',
          year: 2015,
          description: 'Research in Quantum Physics'
        }
      ],
      emergencyContact: {
        name: 'Mary White',
        relationship: 'Spouse',
        phone: '+1234567892'
      }
    },
    { 
      id: '3', 
      name: 'Charlie Green', 
      email: 'charlie.green@school.com', 
      subject: 'History', 
      phone: '+1234567892', 
      classes: ['World History', 'US History'], 
      status: 'active', 
      schoolId: '2', 
      hireDate: '2021-03-10',
      dateOfBirth: '1978-11-08',
      gender: 'male',
      profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      addresses: [
        {
          id: '3',
          type: 'home',
          street: '789 Pine Road',
          city: 'Riverside',
          state: 'CA',
          zipCode: '92501',
          country: 'USA',
          isPrimary: true
        }
      ],
      schoolRecords: [
        {
          id: '4',
          type: 'qualification',
          title: 'MA in History',
          institution: 'Liberal Arts College',
          year: 2005,
          description: 'American History specialization'
        }
      ],
      emergencyContact: {
        name: 'Sarah Green',
        relationship: 'Sister',
        phone: '+1234567893'
      }
    },
    { 
      id: '4', 
      name: 'Diana Prince', 
      email: 'diana.prince@school.com', 
      subject: 'English', 
      phone: '+1234567893', 
      classes: ['English Literature'], 
      status: 'active', 
      schoolId: '2', 
      hireDate: '2022-01-05',
      dateOfBirth: '1988-05-30',
      gender: 'female',
      profileImageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      addresses: [
        {
          id: '4',
          type: 'home',
          street: '321 Elm Street',
          city: 'Riverside',
          state: 'CA',
          zipCode: '92502',
          country: 'USA',
          isPrimary: true
        }
      ],
      schoolRecords: [
        {
          id: '5',
          type: 'qualification',
          title: 'BA in English Literature',
          institution: 'Arts University',
          year: 2010,
          description: 'Creative Writing focus'
        }
      ],
      emergencyContact: {
        name: 'Steve Prince',
        relationship: 'Brother',
        phone: '+1234567894'
      }
    },
  ],
  students: [
    { 
      id: '1', 
      name: 'John Doe', 
      email: 'john.doe@student.com', 
      grade: '10', 
      class: 'Math 101', 
      phone: '+1234567894', 
      parentName: 'Jane Doe', 
      parentPhone: '+1234567895', 
      status: 'active', 
      schoolId: '1', 
      enrollmentDate: '2023-09-01',
      dateOfBirth: '2008-05-15',
      gender: 'male',
      profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      addresses: [
        {
          id: '5',
          type: 'home',
          street: '111 School Lane',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62703',
          country: 'USA',
          isPrimary: true
        }
      ],
      emergencyContact: {
        name: 'Jane Doe',
        relationship: 'Mother',
        phone: '+1234567895'
      },
      parentDetails: {
        fatherName: 'Mike Doe',
        fatherPhone: '+1234567896',
        motherName: 'Jane Doe',
        motherPhone: '+1234567895'
      }
    },
    { 
      id: '2', 
      name: 'Jane Smith', 
      email: 'jane.smith@student.com', 
      grade: '11', 
      class: 'Physics 101', 
      phone: '+1234567896', 
      parentName: 'Bob Smith', 
      parentPhone: '+1234567897', 
      status: 'active', 
      schoolId: '1', 
      enrollmentDate: '2023-09-01',
      dateOfBirth: '2007-08-22',
      gender: 'female',
      profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      addresses: [
        {
          id: '6',
          type: 'home',
          street: '222 Education Street',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62704',
          country: 'USA',
          isPrimary: true
        }
      ],
      emergencyContact: {
        name: 'Bob Smith',
        relationship: 'Father',
        phone: '+1234567897'
      },
      parentDetails: {
        fatherName: 'Bob Smith',
        fatherPhone: '+1234567897',
        motherName: 'Alice Smith',
        motherPhone: '+1234567898'
      }
    },
    { 
      id: '3', 
      name: 'Mike Johnson', 
      email: 'mike.johnson@student.com', 
      grade: '9', 
      class: 'World History', 
      phone: '+1234567898', 
      parentName: 'Sarah Johnson', 
      parentPhone: '+1234567899', 
      status: 'active', 
      schoolId: '2', 
      enrollmentDate: '2023-09-01',
      dateOfBirth: '2009-03-10',
      gender: 'male',
      profileImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      addresses: [
        {
          id: '7',
          type: 'home',
          street: '333 Learning Avenue',
          city: 'Riverside',
          state: 'CA',
          zipCode: '92503',
          country: 'USA',
          isPrimary: true
        }
      ],
      emergencyContact: {
        name: 'Sarah Johnson',
        relationship: 'Mother',
        phone: '+1234567899'
      },
      parentDetails: {
        fatherName: 'Tom Johnson',
        fatherPhone: '+1234567800',
        motherName: 'Sarah Johnson',
        motherPhone: '+1234567899'
      }
    },
    { 
      id: '4', 
      name: 'Emily Davis', 
      email: 'emily.davis@student.com', 
      grade: '10', 
      class: 'English Literature', 
      phone: '+1234567800', 
      parentName: 'Tom Davis', 
      parentPhone: '+1234567801', 
      status: 'active', 
      schoolId: '2', 
      enrollmentDate: '2023-09-01',
      dateOfBirth: '2008-12-05',
      gender: 'female',
      profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
      addresses: [
        {
          id: '8',
          type: 'home',
          street: '444 Knowledge Boulevard',
          city: 'Riverside',
          state: 'CA',
          zipCode: '92504',
          country: 'USA',
          isPrimary: true
        }
      ],
      emergencyContact: {
        name: 'Tom Davis',
        relationship: 'Father',
        phone: '+1234567801'
      },
      parentDetails: {
        fatherName: 'Tom Davis',
        fatherPhone: '+1234567801',
        motherName: 'Lisa Davis',
        motherPhone: '+1234567802'
      }
    },
  ],
  classes: [
    { id: '1', name: 'Math 101', grade: '10', subject: 'Mathematics', teacherId: '1', teacherName: 'Alice Brown', studentCount: 25, schoolId: '1' },
    { id: '2', name: 'Calculus', grade: '11', subject: 'Mathematics', teacherId: '1', teacherName: 'Alice Brown', studentCount: 20, schoolId: '1' },
    { id: '3', name: 'Physics 101', grade: '11', subject: 'Physics', teacherId: '2', teacherName: 'Bob White', studentCount: 22, schoolId: '1' },
    { id: '4', name: 'World History', grade: '9', subject: 'History', teacherId: '3', teacherName: 'Charlie Green', studentCount: 28, schoolId: '2' },
    { id: '5', name: 'US History', grade: '10', subject: 'History', teacherId: '3', teacherName: 'Charlie Green', studentCount: 24, schoolId: '2' },
    { id: '6', name: 'English Literature', grade: '10', subject: 'English', teacherId: '4', teacherName: 'Diana Prince', studentCount: 26, schoolId: '2' },
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
