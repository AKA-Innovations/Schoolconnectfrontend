import { StudentSummary } from './roles';

export interface StudentAcademic {
  id: number;
  className: string;
  sectionName: string;
  rollNumber: string;
  admissionNumber: string;
  admissionDate: string;
  convenceMode: string;
  convenceModeNumber?: string;
}

export interface StudentParent {
  id: number;
  relation: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  emailId?: string;
  address?: string;
}

export interface StudentMedical {
  id: number;
  medicalHistory: string;
}

export interface StudentAddress {
  id: number;
  isPermanent?: boolean;
  address: string;
  state: string;
  city: string;
  country: string;
  pincode: string;
  googleAddressUrl?: string;
  latitude?: string;
  longitude?: string;
}

export interface StudentDetails {
  id: string;
  schoolId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup?: string;
  mobileNumber: string;
  alternateMobileNumber?: string;
  emailId: string;
  caste?: string;
  religion?: string;
  nationality?: string;
  status: string;
  profilePath?: string;
  profileImageUrl?: string;
  academics?: StudentAcademic[];
  parents?: StudentParent[];
  medicalHistories?: StudentMedical[];
  addresses?: StudentAddress[];
}

export interface StudentListItem {
  id: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  emailId: string;
  status: string;
  gender: string;
  schoolId: string;
  academics?: Pick<StudentAcademic, 'className' | 'sectionName' | 'rollNumber'>[];
}

export interface StudentListResponse {
  items: StudentListItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    hasNext: boolean;
    hasPrev: boolean;
    totalItemsCount: number;
  };
}

export interface StudentListFilters {
  schoolId?: string;
  firstName?: string;
  mobileNumber?: string;
  className?: string;
  sectionName?: string;
  page?: number;
  limit?: number;
}

export interface RegisterStudentPayload {
  schoolId?: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup?: string;
  mobileNumber: string;
  alternateMobileNumber?: string;
  emailId: string;
  caste?: string;
  religion?: string;
  nationality?: string;
}

export interface UpdateStudentPayload {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  mobileNumber?: string;
  alternateMobileNumber?: string;
  emailId?: string;
  caste?: string;
  religion?: string;
  nationality?: string;
}

export interface CreateAcademicPayload {
  session?: string;
  className: string;
  sectionName: string;
  rollNumber: string;
  admissionNumber: string;
  admissionDate: string;
  convenceMode: string;
  convenceModeNumber?: string;
}

export interface CreateParentPayload {
  relation: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  emailId?: string;
  address?: string;
}

export interface CreateMedicalPayload {
  medicalHistory: string;
}

export interface CreateAddressPayload {
  isPermanent?: boolean;
  address: string;
  state: string;
  city: string;
  country: string;
  pincode: string;
  googleAddressUrl?: string;
  latitude?: string;
  longitude?: string;
}

export interface AttendanceRecord {
  id?: number;
  recordId?: number;
  studentId?: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'HalfDay';
  attendanceStatus?: string;
  remarks?: string;
  subjectName?: string;
  studentName?: string;
  studentRollNumber?: string;
  firstName?: string;
  lastName?: string;
  rollNumber?: string;
  className?: string;
  sectionName?: string;
}

export interface BulkAttendancePayload {
  session?: string;
  date: string;
  attendance: { studentId: string; attendanceStatus: string; remarks?: string; [key: string]: any }[];
}

export interface AttendanceFilterParams {
  schoolId?: string;
  studentId?: string;
  className?: string;
  sectionName?: string;
  session?: string;
  teacherId?: string;
  date?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
  limit?: number;
}

export type { StudentSummary };
