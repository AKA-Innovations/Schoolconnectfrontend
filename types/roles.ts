export type Role = "super_admin" | "school_admin" | "principal" | "teacher" | "subject_coordinator" | "student" | "parent";

export interface User {
  id: string;
  name: string;
  username: string;
  role: Role;
  schoolId?: string;
  token?: string;
  /** Teacher sub-role flags — populated after login via GET /teacher/:id */
  isPrincipal?: boolean;
  isCoordinator?: boolean;
  isClassTeacher?: boolean;
  isSubjectTeacher?: boolean;
  /** The class this teacher is assigned to as class teacher (first match) */
  classTeacherClass?: { className: string; sectionName: string } | null;
}

export interface AuthState {
  user: User | null;
  role: Role | null;
  token: string | null;
  schoolId: string | null;
}

export interface Teacher {
  id: string;
  name?: string;
  firstName: string;
  lastName: string;
  email?: string;
  emailId: string;
  employeeEmail: string;
  subject?: string;
  phone?: string;
  mobileNumber: string;
  alternateMobileNumber?: string;
  classes: TeacherClass[];
  status: 'active' | 'inactive';
  schoolId: string;
  employeeId: string;
  joiningDate: string;
  dateOfBirth: string;
  gender: string;
  isPrincipal: boolean;
  isCoordinator: boolean;
  isClassTeacher: boolean;
  isSubjectTeacher: boolean;
  classTeacherAssignment?: ClassTeacherAssignmentDetails | null;
  profileImageUrl?: string;
  addresses?: Address[];
  schoolRecords?: SchoolRecord[];
  teacherPersonalData?: any;
  teacherAcademicData?: any;
  teacherProfessionalData?: any;
  teacherFamilyDetails?: any;
}

export interface TeacherClass {
  id?: number;
  className: string;
  sectionName: string;
  subjectName: string;
}

export interface ClassTeacherAssignmentDetails {
  classDtlsId: number;
  className: string;
  sectionName: string;
  schoolId: string;
}

export interface TeacherRegistrationData {
  username: string;
  password?: string;
  schoolId: string;
  employeeId: string;
  isPrincipal: boolean;
  isCoordinator: boolean;
  isClassTeacher: boolean;
  isSubjectTeacher: boolean;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  mobileNumber: string;
  alternateMobileNumber?: string;
  emailId: string;
  joiningDate: string;
  employeeEmail: string;
  classes: TeacherClass[];
  classTeacherClass?: { className: string; sectionName: string };
  coordinatorClasses?: string[];
}

export interface TeacherUpdateDetails {
  isPrincipal?: boolean;
  isCoordinator?: boolean;
  isClassTeacher?: boolean;
  isSubjectTeacher?: boolean;
  classTeacherAssignment?: ClassTeacherAssignmentDetails | null;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  mobileNumber?: string;
  alternateMobileNumber?: string;
  emailId?: string;
  teacherPersonalData?: Record<string, any>;
  teacherAcademicData?: Record<string, any>;
  teacherProfessionalData?: Record<string, any>;
  teacherFamilyDetails?: Record<string, any>;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  grade: string;
  class: string;
  phone?: string;
  parentName?: string;
  parentPhone?: string;
  status: 'active' | 'inactive';
  schoolId: string;
  enrollmentDate: string;
  dateOfBirth?: string;
  gender?: string;
  profileImageUrl?: string;
  addresses?: Address[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  parentDetails?: {
    fatherName?: string;
    fatherPhone?: string;
    motherName?: string;
    motherPhone?: string;
  };
}

export interface Class {
  id: string;
  name: string;
  grade: string;
  subject: string;
  teacherId?: string;
  teacherName?: string;
  studentCount: number;
  schoolId: string;
}

export interface Address {
  id: number;
  isPermanent: boolean;
  address: string;
  state: string;
  city: string;
  country: string;
  pincode: string;
  googleAddressUrl?: string;
  latitude?: string;
  longitude?: string;
}

export interface SchoolRecord {
  id: number;
  employeeId: string;
  joiningDate: string;
  employeeEmail: string;
}

export interface DashboardSummary {
  kpis: {
    label: string;
    value: string | number;
    trend?: number;
    trendType?: "up" | "down" | "neutral";
    iconName: string;
  }[];
  recentData: {
    id: string;
    [key: string]: any;
  }[];
}

export interface AdminSummary extends DashboardSummary {
  school: {
    id: string;
    name: string;
    principal: string;
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
  };
  teachers: Teacher[];
  students: Student[];
  classes: Class[];
}

export interface PrincipalSummary extends DashboardSummary {
  teachers: {
    id: string;
    name: string;
    subject: string;
    attendance: string;
  }[];
}

export interface TeacherSummary extends DashboardSummary {
  classes: {
    id: string;
    name: string;
    time: string;
    room: string;
  }[];
}

export interface CoordinatorSummary extends DashboardSummary {
  subjects: {
    id: string;
    name: string;
    teacherCount: number;
    progress: number;
  }[];
}

export interface StudentSummary extends DashboardSummary {
  assignments: {
    id: string;
    subject: string;
    title: string;
    dueDate: string;
    status: 'pending' | 'submitted' | 'graded';
    grade?: string;
  }[];
  attendance: {
    date: string;
    status: 'present' | 'absent' | 'late';
    subject: string;
  }[];
}

export interface TeacherFilterParams {
  page?: number;
  pageSize?: number;
  schoolId?: string;
  className?: string;
  sectionName?: string;
  firstName?: string;
  mobileNumber?: string;
  username?: string;
  employeeEmail?: string;
  subjectName?: string;
  isPrincipal?: boolean;
  isCoordinator?: boolean;
  isClassTeacher?: boolean;
  isSubjectTeacher?: boolean;
}
