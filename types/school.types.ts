export interface SchoolContact {
  id?: number;
  phone: string;
  alternatePhone?: string;
  fax?: string;
  email: string;
}

export interface SchoolOwner {
  id?: string;
  firstName: string;
  lastName: string;
  address: string;
  email?: string;
  phone: string;
  profileUrl?: string;
}

export interface SchoolDetails {
  id: string;
  schoolCode: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  schoolAffiliation: string;
  schoolBoard: string;
  isActive: boolean;
  profileUrl?: string;
  contactDetails?: SchoolContact;
  ownerDetails?: SchoolOwner;
}

export interface UpdateSchoolPayload {
  schoolCode?: string;
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  schoolAffiliation?: string;
  schoolBoard?: string;
  contactDetails?: Partial<SchoolContact>;
  ownerDetails?: Partial<SchoolOwner>;
}

export interface UpdateAdministratorPayload {
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  email?: string;
  phone?: string;
}

export interface AdministratorDetails {
  id: string;
  schoolId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  address?: string;
  email?: string;
  phone: string;
  profileUrl?: string;
}

export interface AdministratorListResponse {
  items: AdministratorDetails[];
  pagination: {
    totalItemsCount: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
  };
}
