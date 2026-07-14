'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Camera,
  Clock,
  RefreshCw,
  Trash2,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Plus,
  Edit2,
  Save,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/authStore';
import {
  useAddAddress,
  useDeleteAddress,
  useDeleteTeacherImage,
  useTeacher,
  useUpdateAddress,
  useUploadTeacherImage,
  useTeacherBasicDetails,
  useUpdateTeacherBasicDetails,
  useTeacherPersonalData,
  useUpdateTeacherPersonalData,
  useTeacherAcademicData,
  useUpdateTeacherAcademicData,
  useTeacherProfessionalData,
  useUpdateTeacherProfessionalData,
  useTeacherFamilyDetails,
  useUpdateTeacherFamilyDetails,
  useTeacherAddresses,
  useTeacherSchoolRecord,
  useTeacherCoordinatorClasses,
  useTeacherClassTeacher,
  useTeacherClassSubjectDetails,
} from '@/hooks/useTeachers';
import { Address } from '@/types/roles';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

function ProfileField({
  label,
  children,
  description,
  className,
}: {
  label: string;
  children: React.ReactNode;
  description?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
        {label}
      </Label>
      {description && <p className="mt-1 text-[11px] text-muted-foreground/60">{description}</p>}
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function TeacherProfileSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 animate-pulse">
      <div className="h-44 rounded-3xl bg-muted/40" />
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4 h-120 rounded-3xl bg-muted/40" />
        <div className="lg:col-span-8 h-192 rounded-3xl bg-muted/40" />
      </div>
    </div>
  );
}

export function TeacherProfileManager() {
  const router = useRouter();
  const { user } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('personal');

  const teacherId = user?.id ?? '';

  // Get aggregated data for header & avatar snapshot
  const {
    data: teacher,
    isLoading: isTeacherLoading,
    isFetching: isTeacherFetching,
    refetch: refetchTeacher,
  } = useTeacher(teacherId);

  const uploadMutation = useUploadTeacherImage(teacherId);
  const deleteMutation = useDeleteTeacherImage(teacherId);

  const fullName = useMemo(() => {
    if (!teacher) return user?.name ?? 'Teacher';
    return `${teacher.firstName ?? ''} ${teacher.lastName ?? ''}`.trim() || user?.name || 'Teacher';
  }, [teacher, user?.name]);

  const initials = useMemo(() => {
    return fullName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [fullName]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !teacherId) return;

    uploadMutation.mutate(file, {
      onSuccess: async () => {
        await refetchTeacher();
        toast.success('Profile image updated');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to upload profile image');
      },
    });

    event.target.value = '';
  };

  const handleDeleteImage = () => {
    if (!confirm('Delete profile image?')) return;

    deleteMutation.mutate(undefined, {
      onSuccess: async () => {
        await refetchTeacher();
        toast.success('Profile image removed');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to delete profile image');
      },
    });
  };

  const handleRefresh = async () => {
    await refetchTeacher();
    toast.success('Profile refreshed');
  };

  if (isTeacherLoading && !teacher) {
    return <TeacherProfileSkeleton />;
  }

  if (!teacher) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-border/60 bg-card shadow-sm">
          <UserIcon className="h-10 w-10 text-muted-foreground/40" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Teacher profile not available</h1>
          <p className="text-muted-foreground">
            Sign in with a teacher account to view and update your profile.
          </p>
        </div>
        <Button variant="secondary" onClick={() => router.push('/dashboard/teacher')}>
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">Teacher Profile</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{fullName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your profile dataset, addresses, mappings, and institutional records.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => router.push('/dashboard/teacher')} className="rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Button variant="secondary" onClick={handleRefresh} disabled={isTeacherFetching} className="rounded-xl">
            <RefreshCw className={cn('h-4 w-4 mr-1', isTeacherFetching && 'animate-spin')} /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Side: Avatar & Snapshot Panel */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="erp-card overflow-hidden">
            <div className="relative p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="relative group shrink-0">
                  <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border-4 border-background bg-primary/10 shadow-lg shadow-black/5">
                    {teacher.profileImageUrl ? (
                      <img src={teacher.profileImageUrl} alt={fullName} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-3xl font-extrabold tracking-tight text-primary/60">
                        {initials || <UserIcon className="h-10 w-10" />}
                      </span>
                    )}
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-3xl bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-1 rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-white hover:text-primary-foreground"
                    >
                      <Camera className="h-3 w-3" /> {uploadMutation.isPending ? 'Uploading…' : 'Upload'}
                    </button>
                    {teacher.profileImageUrl && (
                      <button
                        type="button"
                        onClick={handleDeleteImage}
                        className="flex items-center gap-1 rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-red-200 hover:text-red-100"
                      >
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                </div>

                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-2 border-card shadow-sm flex items-center justify-center">
                  <ShieldCheck className="h-3 w-3 text-white" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                    Teacher Account
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {teacher.employeeId || 'Unassigned'}
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">{fullName}</h2>
                  <p className="mt-1 text-sm text-muted-foreground/70">{teacher.employeeEmail || teacher.emailId}</p>
                </div>

                <div className="space-y-2 pt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary/70 shrink-0" />
                    <span className="truncate">{teacher.emailId || 'No personal email set'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary/70 shrink-0" />
                    <span>{teacher.mobileNumber || 'No mobile number set'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary/70 shrink-0" />
                    <span>
                      {teacher.joiningDate
                        ? new Date(teacher.joiningDate).toLocaleDateString(undefined, { dateStyle: 'medium' })
                        : 'Joining date unavailable'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary/70 shrink-0" />
                    <span>{teacher.gender || 'Gender not set'}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side: Enhanced Tabbed Panel */}
        <div className="lg:col-span-8 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-x-auto pb-2">
              <TabsList className="flex w-max min-w-full gap-2 bg-muted/20 p-1.5 rounded-2xl border border-border/50">
                {[
                  { id: 'personal', label: 'Identity & Details' },
                  { id: 'employment', label: 'Employment' },
                  { id: 'classes', label: 'Classes & Pedagogical' },
                  { id: 'addresses', label: 'Addresses' },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="rounded-xl px-6 py-2.5 text-[10px] font-bold tracking-widest uppercase data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="mt-4">
              {/* Identity & Details Tab */}
              <TabsContent value="personal" className="mt-0 space-y-6">
                <IdentityDetailsTab teacherId={teacherId} roleStack={[
                  teacher.isPrincipal && 'Principal',
                  teacher.isCoordinator && 'Coordinator',
                  teacher.isClassTeacher && 'Class Teacher',
                  teacher.isSubjectTeacher && 'Subject Teacher'
                ].filter(Boolean) as string[]} />
              </TabsContent>

              {/* Employment Tab */}
              <TabsContent value="employment" className="mt-0">
                <EmploymentTab teacherId={teacherId} />
              </TabsContent>

              {/* Classes & Pedagogical Tab */}
              <TabsContent value="classes" className="mt-0">
                <ClassesPedagogicalTab teacherId={teacherId} />
              </TabsContent>

              {/* Addresses Tab */}
              <TabsContent value="addresses" className="mt-0">
                <AddressesTab teacherId={teacherId} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═════════════════════════════════════════════════════════════════════════════

// ─── 1. Identity & Details Tab Component ─────────────────────────────────────
function IdentityDetailsTab({ teacherId, roleStack }: { teacherId: string; roleStack: string[] }) {
  // Query tab data
  const { data: basicRes, isLoading: loadingBasic, refetch: refetchBasic } = useTeacherBasicDetails(teacherId);
  const { data: personalRes, isLoading: loadingPersonal, refetch: refetchPersonal } = useTeacherPersonalData(teacherId);
  const { data: academicRes, isLoading: loadingAcademic, refetch: refetchAcademic } = useTeacherAcademicData(teacherId);
  const { data: professionalRes, isLoading: loadingProfessional, refetch: refetchProfessional } = useTeacherProfessionalData(teacherId);
  const { data: familyRes, isLoading: loadingFamily, refetch: refetchFamily } = useTeacherFamilyDetails(teacherId);

  // Mutations
  const updateBasic = useUpdateTeacherBasicDetails(teacherId);
  const updatePersonal = useUpdateTeacherPersonalData(teacherId);
  const updateAcademic = useUpdateTeacherAcademicData(teacherId);
  const updateProfessional = useUpdateTeacherProfessionalData(teacherId);
  const updateFamily = useUpdateTeacherFamilyDetails(teacherId);

  // Local state forms
  const [basicForm, setBasicForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    mobileNumber: '',
    alternateMobileNumber: '',
    emailId: '',
  });

  const [personalForm, setPersonalForm] = useState({
    bloodGroup: '',
    maritalStatus: '',
    nationality: '',
    religion: '',
  });

  const [academicForm, setAcademicForm] = useState({
    highestQualification: '',
    specialization: '',
    university: '',
    passingYear: '',
  });

  const [professionalForm, setProfessionalForm] = useState({
    designation: '',
    totalExperience: '',
    previousSchool: '',
  });

  const [familyForm, setFamilyForm] = useState({
    fatherName: '',
    motherName: '',
    spouseName: '',
    children: 0,
    emergencyContact: '',
  });

  // Sync state with query responses
  useEffect(() => {
    const b = basicRes?.data ?? basicRes;
    if (b) {
      setBasicForm({
        firstName: b.firstName ?? '',
        lastName: b.lastName ?? '',
        dateOfBirth: b.dateOfBirth ? new Date(b.dateOfBirth).toISOString().slice(0, 10) : '',
        gender: b.gender ?? '',
        mobileNumber: b.mobileNumber ?? '',
        alternateMobileNumber: b.alternateMobileNumber ?? '',
        emailId: b.emailId ?? '',
      });
    }
  }, [basicRes]);

  useEffect(() => {
    const p = personalRes?.data?.teacherPersonalData ?? personalRes?.teacherPersonalData ?? personalRes;
    if (p) {
      setPersonalForm({
        bloodGroup: p.bloodGroup ?? '',
        maritalStatus: p.maritalStatus ?? '',
        nationality: p.nationality ?? '',
        religion: p.religion ?? '',
      });
    }
  }, [personalRes]);

  useEffect(() => {
    const a = academicRes?.data?.teacherAcademicData ?? academicRes?.teacherAcademicData ?? academicRes;
    if (a) {
      setAcademicForm({
        highestQualification: a.highestQualification ?? '',
        specialization: a.specialization ?? '',
        university: a.university ?? '',
        passingYear: a.passingYear ?? a.yearOfPassing ?? '',
      });
    }
  }, [academicRes]);

  useEffect(() => {
    const pr = professionalRes?.data?.teacherProfessionalData ?? professionalRes?.teacherProfessionalData ?? professionalRes;
    if (pr) {
      setProfessionalForm({
        designation: pr.designation ?? '',
        totalExperience: pr.totalExperience ?? pr.totalExperience ?? '',
        previousSchool: pr.previousSchool ?? '',
      });
    }
  }, [professionalRes]);

  useEffect(() => {
    const f = familyRes?.data?.teacherFamilyDetails ?? familyRes?.teacherFamilyDetails ?? familyRes;
    if (f) {
      setFamilyForm({
        fatherName: f.fatherName ?? '',
        motherName: f.motherName ?? '',
        spouseName: f.spouseName ?? '',
        children: f.children ?? 0,
        emergencyContact: f.emergencyContact ?? '',
      });
    }
  }, [familyRes]);

  const handleSaveBasic = () => {
    updateBasic.mutate(basicForm, {
      onSuccess: () => {
        toast.success('Basic details updated successfully');
        refetchBasic();
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Update basic details failed'),
    });
  };

  const handleSavePersonal = () => {
    updatePersonal.mutate({ teacherPersonalData: personalForm }, {
      onSuccess: () => {
        toast.success('Personal data updated successfully');
        refetchPersonal();
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Update personal data failed'),
    });
  };

  const handleSaveAcademic = () => {
    updateAcademic.mutate({ teacherAcademicData: academicForm }, {
      onSuccess: () => {
        toast.success('Academic details updated successfully');
        refetchAcademic();
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Update academic details failed'),
    });
  };

  const handleSaveProfessional = () => {
    updateProfessional.mutate({ teacherProfessionalData: professionalForm }, {
      onSuccess: () => {
        toast.success('Professional data updated successfully');
        refetchProfessional();
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Update professional data failed'),
    });
  };

  const handleSaveFamily = () => {
    updateFamily.mutate({ teacherFamilyDetails: familyForm }, {
      onSuccess: () => {
        toast.success('Family details updated successfully');
        refetchFamily();
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Update family details failed'),
    });
  };

  const loadingAny = loadingBasic || loadingPersonal || loadingAcademic || loadingProfessional || loadingFamily;

  if (loadingAny) {
    return (
      <div className="space-y-6">
        <Card className="h-64 rounded-3xl bg-muted/20 animate-pulse" />
        <Card className="h-64 rounded-3xl bg-muted/20 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Basic Core Details */}
      <Card className="erp-card overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-5 px-6">
          <div>
            <CardTitle className="text-base font-bold">Basic Core Details</CardTitle>
            <CardDescription className="text-xs">Primary identification details.</CardDescription>
          </div>
          <Button onClick={handleSaveBasic} disabled={updateBasic.isPending} className="rounded-xl h-9 px-4 font-semibold text-xs shrink-0">
            <Save className="mr-1.5 h-3.5 w-3.5" /> {updateBasic.isPending ? 'Saving...' : 'Save'}
          </Button>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProfileField label="First Name">
              <Input value={basicForm.firstName} onChange={(e) => setBasicForm({ ...basicForm, firstName: e.target.value })} className="rounded-xl" />
            </ProfileField>
            <ProfileField label="Last Name">
              <Input value={basicForm.lastName} onChange={(e) => setBasicForm({ ...basicForm, lastName: e.target.value })} className="rounded-xl" />
            </ProfileField>
            <ProfileField label="Date of Birth">
              <Input type="date" value={basicForm.dateOfBirth} onChange={(e) => setBasicForm({ ...basicForm, dateOfBirth: e.target.value })} className="rounded-xl" />
            </ProfileField>
            <ProfileField label="Gender">
              <select
                value={basicForm.gender}
                onChange={(e) => setBasicForm({ ...basicForm, gender: e.target.value })}
                className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </ProfileField>
            <ProfileField label="Mobile Number">
              <Input value={basicForm.mobileNumber} onChange={(e) => setBasicForm({ ...basicForm, mobileNumber: e.target.value })} className="rounded-xl" />
            </ProfileField>
            <ProfileField label="Alternate Mobile Number">
              <Input value={basicForm.alternateMobileNumber} onChange={(e) => setBasicForm({ ...basicForm, alternateMobileNumber: e.target.value })} className="rounded-xl" />
            </ProfileField>
            <ProfileField label="Personal Email" className="md:col-span-2">
              <Input type="email" value={basicForm.emailId} onChange={(e) => setBasicForm({ ...basicForm, emailId: e.target.value })} className="rounded-xl" />
            </ProfileField>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Institutional Roles (Read-Only)</p>
            <div className="flex flex-wrap gap-2">
              {roleStack.length > 0 ? (
                roleStack.map((role) => (
                  <span key={role} className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                    <CheckCircle2 className="h-3 w-3" /> {role}
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted-foreground/50">No institutional roles assigned.</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Data */}
      <Card className="erp-card overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-5 px-6">
          <div>
            <CardTitle className="text-base font-bold">Personal Data</CardTitle>
            <CardDescription className="text-xs">Physical attributes and nationality profiles.</CardDescription>
          </div>
          <Button onClick={handleSavePersonal} disabled={updatePersonal.isPending} className="rounded-xl h-9 px-4 font-semibold text-xs shrink-0">
            <Save className="mr-1.5 h-3.5 w-3.5" /> {updatePersonal.isPending ? 'Saving...' : 'Save'}
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ProfileField label="Blood Group">
              <Input value={personalForm.bloodGroup} onChange={(e) => setPersonalForm({ ...personalForm, bloodGroup: e.target.value })} className="rounded-xl" />
            </ProfileField>
            <ProfileField label="Marital Status">
              <select
                value={personalForm.maritalStatus}
                onChange={(e) => setPersonalForm({ ...personalForm, maritalStatus: e.target.value })}
                className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </ProfileField>
            <ProfileField label="Nationality">
              <Input value={personalForm.nationality} onChange={(e) => setPersonalForm({ ...personalForm, nationality: e.target.value })} className="rounded-xl" />
            </ProfileField>
            <ProfileField label="Religion">
              <Input value={personalForm.religion} onChange={(e) => setPersonalForm({ ...personalForm, religion: e.target.value })} className="rounded-xl" />
            </ProfileField>
          </div>
        </CardContent>
      </Card>

      {/* Academic Data */}
      <Card className="erp-card overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-5 px-6">
          <div>
            <CardTitle className="text-base font-bold">Academic Data</CardTitle>
            <CardDescription className="text-xs">Highest degree qualifications and universities.</CardDescription>
          </div>
          <Button onClick={handleSaveAcademic} disabled={updateAcademic.isPending} className="rounded-xl h-9 px-4 font-semibold text-xs shrink-0">
            <Save className="mr-1.5 h-3.5 w-3.5" /> {updateAcademic.isPending ? 'Saving...' : 'Save'}
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ProfileField label="Highest Qualification">
              <Input value={academicForm.highestQualification} onChange={(e) => setAcademicForm({ ...academicForm, highestQualification: e.target.value })} className="rounded-xl" />
            </ProfileField>
            <ProfileField label="Specialization">
              <Input value={academicForm.specialization} onChange={(e) => setAcademicForm({ ...academicForm, specialization: e.target.value })} className="rounded-xl" />
            </ProfileField>
            <ProfileField label="University/College">
              <Input value={academicForm.university} onChange={(e) => setAcademicForm({ ...academicForm, university: e.target.value })} className="rounded-xl" />
            </ProfileField>
            <ProfileField label="Passing Year">
              <Input value={academicForm.passingYear} onChange={(e) => setAcademicForm({ ...academicForm, passingYear: e.target.value })} className="rounded-xl" />
            </ProfileField>
          </div>
        </CardContent>
      </Card>

      {/* Professional Data */}
      <Card className="erp-card overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-5 px-6">
          <div>
            <CardTitle className="text-base font-bold">Professional Data</CardTitle>
            <CardDescription className="text-xs">Faculty experience and designation details.</CardDescription>
          </div>
          <Button onClick={handleSaveProfessional} disabled={updateProfessional.isPending} className="rounded-xl h-9 px-4 font-semibold text-xs shrink-0">
            <Save className="mr-1.5 h-3.5 w-3.5" /> {updateProfessional.isPending ? 'Saving...' : 'Save'}
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ProfileField label="Designation">
              <Input value={professionalForm.designation} onChange={(e) => setProfessionalForm({ ...professionalForm, designation: e.target.value })} className="rounded-xl" />
            </ProfileField>
            <ProfileField label="Experience (Years)">
              <Input value={professionalForm.totalExperience} onChange={(e) => setProfessionalForm({ ...professionalForm, totalExperience: e.target.value })} className="rounded-xl" />
            </ProfileField>
            <ProfileField label="Previous School/Employer">
              <Input value={professionalForm.previousSchool} onChange={(e) => setProfessionalForm({ ...professionalForm, previousSchool: e.target.value })} className="rounded-xl" />
            </ProfileField>
          </div>
        </CardContent>
      </Card>

      {/* Family Details */}
      <Card className="erp-card overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-5 px-6">
          <div>
            <CardTitle className="text-base font-bold">Family Details</CardTitle>
            <CardDescription className="text-xs">Emergency contacts and household status.</CardDescription>
          </div>
          <Button onClick={handleSaveFamily} disabled={updateFamily.isPending} className="rounded-xl h-9 px-4 font-semibold text-xs shrink-0">
            <Save className="mr-1.5 h-3.5 w-3.5" /> {updateFamily.isPending ? 'Saving...' : 'Save'}
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProfileField label="Father's Name">
              <Input value={familyForm.fatherName} onChange={(e) => setFamilyForm({ ...familyForm, fatherName: e.target.value })} className="rounded-xl" />
            </ProfileField>
            <ProfileField label="Mother's Name">
              <Input value={familyForm.motherName} onChange={(e) => setFamilyForm({ ...familyForm, motherName: e.target.value })} className="rounded-xl" />
            </ProfileField>
            <ProfileField label="Spouse Name">
              <Input value={familyForm.spouseName} onChange={(e) => setFamilyForm({ ...familyForm, spouseName: e.target.value })} className="rounded-xl" />
            </ProfileField>
            <ProfileField label="Number of Children">
              <Input
                type="number"
                value={familyForm.children}
                onChange={(e) => setFamilyForm({ ...familyForm, children: parseInt(e.target.value, 10) || 0 })}
                className="rounded-xl"
              />
            </ProfileField>
            <ProfileField label="Emergency Contact Number" className="md:col-span-2">
              <Input value={familyForm.emergencyContact} onChange={(e) => setFamilyForm({ ...familyForm, emergencyContact: e.target.value })} className="rounded-xl" />
            </ProfileField>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── 2. Employment Tab Component (Read-Only) ──────────────────────────────────
function EmploymentTab({ teacherId }: { teacherId: string }) {
  const { data: recordRes, isLoading } = useTeacherSchoolRecord(teacherId);
  const record = recordRes?.data ?? recordRes;

  if (isLoading) {
    return <Card className="h-44 rounded-3xl bg-muted/20 animate-pulse" />;
  }

  return (
    <Card className="erp-card overflow-hidden animate-in fade-in duration-300">
      <CardHeader className="border-b border-border/50 bg-muted/10 py-5 px-6">
        <CardTitle className="text-base font-bold">School Employment Record</CardTitle>
        <CardDescription className="text-xs">Administrative record of deployment (Read-only).</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {record ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-border/60 bg-muted/10 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Employee ID</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{record.employeeId || 'Not set'}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/10 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Joining Date</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {record.joiningDate
                  ? new Date(record.joiningDate).toLocaleDateString(undefined, { dateStyle: 'medium' })
                  : 'Not set'}
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/10 p-4 md:col-span-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Official Professional Email</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{record.employeeEmail || 'Not set'}</p>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground/40 bg-muted/5 rounded-2xl border-2 border-dashed border-border/50">
            <UserIcon className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p className="text-[10px] font-bold uppercase tracking-widest">No employment record found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── 3. Classes & Pedagogical Tab Component (Read-Only) ────────────────────────
function ClassesPedagogicalTab({ teacherId }: { teacherId: string }) {
  const { data: coordRes, isLoading: loadingCoord } = useTeacherCoordinatorClasses(teacherId);
  const { data: ctRes, isLoading: loadingCt } = useTeacherClassTeacher(teacherId);
  const { data: subjectsRes, isLoading: loadingSubjects } = useTeacherClassSubjectDetails(teacherId);

  const coordMappings = coordRes?.data ?? coordRes ?? [];
  const ctAssignments = ctRes?.data ?? ctRes ?? [];
  const subjectMappings = subjectsRes?.data ?? subjectsRes?.classSubjectDtls ?? subjectsRes ?? [];

  const loading = loadingCoord || loadingCt || loadingSubjects;

  if (loading) {
    return <Card className="h-64 rounded-3xl bg-muted/20 animate-pulse" />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 3.1 Class Teacher Assignment */}
      <Card className="erp-card overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/10 py-5 px-6">
          <CardTitle className="text-base font-bold tracking-tight flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Class Teacher homeroom Assignment
          </CardTitle>
          <CardDescription className="text-xs">Assigned Homeroom section (Read-only).</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {ctAssignments.length > 0 ? (
            <div className="space-y-3">
              {ctAssignments.map((assignment: any) => (
                <div key={assignment.id} className="flex items-center gap-5 p-5 rounded-2xl border border-border bg-muted/10">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Homeroom Assignment</p>
                    <p className="text-lg font-bold text-foreground">
                      Class {assignment.className} &mdash; Section {assignment.sectionName}
                    </p>
                    {assignment.session && (
                      <p className="text-[10px] text-muted-foreground/60 font-medium">Session: {assignment.session}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-muted-foreground/40 bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
              <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-[10px] font-bold uppercase tracking-widest">No Class Teacher Assignment</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3.2 Coordinator Class Mappings */}
      <Card className="erp-card overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/10 py-5 px-6">
          <CardTitle className="text-base font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Coordinator Class Mappings
          </CardTitle>
          <CardDescription className="text-xs">Classes managed as a class coordinator (Read-only).</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {coordMappings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coordMappings.map((mapping: any) => (
                <div key={mapping.id} className="p-4 rounded-xl border border-border bg-muted/10 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground/80">{mapping.className || `Class ID: ${mapping.classId}`}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Session: {mapping.session}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-muted-foreground/40 bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
              <ShieldCheck className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-[10px] font-bold uppercase tracking-widest">No Coordinator Class Mappings</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3.3 Subject teaching assignments */}
      <Card className="erp-card overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/10 py-5 px-6">
          <CardTitle className="text-base font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Class Subject Teaching details
          </CardTitle>
          <CardDescription className="text-xs">Instructed classes and subjects (Read-only).</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {subjectMappings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjectMappings.map((mapping: any) => (
                <div key={mapping.id} className="p-4 rounded-xl border border-border bg-muted/10 space-y-2">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground/80">Class {mapping.className} &mdash; {mapping.sectionName}</h4>
                    <p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest mt-1">{mapping.subjectName}</p>
                    <p className="text-[9px] text-muted-foreground/50 mt-0.5">Code: {mapping.subjectCode || 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-muted-foreground/40 bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-[10px] font-bold uppercase tracking-widest">No Teaching Assignments</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── 4. Addresses Tab Component ───────────────────────────────────────────────
type AddrFields = Omit<Address, 'id'>;
const emptyAddr = (): AddrFields => ({
  isPermanent: false,
  address: '',
  state: '',
  city: '',
  country: '',
  pincode: '',
  googleAddressUrl: '',
  latitude: '',
  longitude: '',
});

function buildAddressForm(address?: Address) {
  return {
    isPermanent: address?.isPermanent ?? false,
    address: address?.address ?? '',
    state: address?.state ?? '',
    city: address?.city ?? '',
    country: address?.country ?? '',
    pincode: address?.pincode ?? '',
    googleAddressUrl: address?.googleAddressUrl ?? '',
    latitude: address?.latitude ?? '',
    longitude: address?.longitude ?? '',
  };
}

function AddressesTab({ teacherId }: { teacherId: string }) {
  const { data: addressesRes, isLoading, refetch } = useTeacherAddresses(teacherId);
  const addresses: Address[] = addressesRes?.data ?? addressesRes ?? [];

  const addAddressMutation = useAddAddress(teacherId);
  const updateAddressMutation = useUpdateAddress(teacherId);
  const deleteAddressMutation = useDeleteAddress(teacherId);

  const [addingAddress, setAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [newAddress, setNewAddress] = useState(emptyAddr());
  const [editAddress, setEditAddress] = useState(emptyAddr());

  const busy = addAddressMutation.isPending || updateAddressMutation.isPending || deleteAddressMutation.isPending;

  const handleAddAddress = async () => {
    if (!newAddress.address || !newAddress.city || !newAddress.state || !newAddress.country || !newAddress.pincode) {
      toast.error('Please fill in all required address fields.');
      return;
    }

    try {
      await addAddressMutation.mutateAsync(newAddress);
      toast.success('Address added successfully');
      setAddingAddress(false);
      setNewAddress(emptyAddr());
      await refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add address');
    }
  };

  const handleUpdateAddress = async (addressId: number) => {
    if (!editAddress.address || !editAddress.city || !editAddress.state || !editAddress.country || !editAddress.pincode) {
      toast.error('Please fill in all required address fields.');
      return;
    }

    try {
      await updateAddressMutation.mutateAsync({ id: addressId, addr: editAddress });
      toast.success('Address updated successfully');
      setEditingAddressId(null);
      setEditAddress(emptyAddr());
      await refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update address');
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    if (!confirm('Delete this address?')) return;

    try {
      await deleteAddressMutation.mutateAsync(addressId);
      toast.success('Address deleted successfully');
      await refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete address');
    }
  };

  const openEditAddress = (address: Address) => {
    setEditingAddressId(address.id);
    setEditAddress(buildAddressForm(address));
    setAddingAddress(false);
  };

  if (isLoading) {
    return <Card className="h-64 rounded-3xl bg-muted/20 animate-pulse" />;
  }

  return (
    <Card className="erp-card overflow-hidden animate-in fade-in duration-300">
      <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-border/50 bg-muted/10 px-6 py-5">
        <div>
          <CardTitle className="text-base font-bold">Addresses</CardTitle>
          <CardDescription className="text-xs">Physical residency and contact locations.</CardDescription>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            setAddingAddress((value) => !value);
            setEditingAddressId(null);
            setEditAddress(emptyAddr());
          }}
          className="rounded-xl px-4 text-xs font-semibold"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" /> {addingAddress ? 'Cancel' : 'Add Address'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {addingAddress && (
          <AddressEditor
            title="New Address"
            data={newAddress}
            onChange={setNewAddress}
            onSave={handleAddAddress}
            onCancel={() => {
              setAddingAddress(false);
              setNewAddress(emptyAddr());
            }}
            saving={busy}
          />
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <div key={address.id} className="rounded-2xl border border-border/60 bg-muted/5 p-5 transition hover:border-primary/30 hover:bg-muted/10">
              {editingAddressId === address.id ? (
                <AddressEditor
                  title={`Edit Address #${address.id}`}
                  data={editAddress}
                  onChange={setEditAddress}
                  onSave={() => handleUpdateAddress(address.id)}
                  onCancel={() => {
                    setEditingAddressId(null);
                    setEditAddress(emptyAddr());
                  }}
                  saving={busy}
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary/70 shrink-0">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-foreground">
                          {address.city}, {address.state}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">{address.address}</p>
                      </div>
                    </div>
                    {address.isPermanent && (
                      <span className="rounded-md border border-primary/25 bg-primary/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-primary">
                        Permanent
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70">
                    <span>{address.country}</span>
                    <span>{address.pincode}</span>
                    {address.googleAddressUrl && <span>Maps Link</span>}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => openEditAddress(address)} className="rounded-xl text-xs font-semibold px-3 h-8">
                      <Edit2 className="mr-1 h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteAddress(address.id)}
                      className="rounded-xl text-xs font-semibold px-3 h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {addresses.length === 0 && !addingAddress && (
            <div className="col-span-full rounded-2xl border border-dashed border-border/60 bg-muted/5 py-12 text-center text-muted-foreground/60">
              <MapPin className="mx-auto h-8 w-8 opacity-20" />
              <p className="mt-2 text-xs font-semibold">No addresses registered yet.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AddressEditor({
  title,
  data,
  onChange,
  onSave,
  onCancel,
  saving,
}: {
  title: string;
  data: ReturnType<typeof emptyAddr>;
  onChange: React.Dispatch<React.SetStateAction<ReturnType<typeof emptyAddr>>>;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-border/60 bg-background p-5">
      <div>
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">Fill in the address fields to update contact registry.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Street Address *</Label>
          <textarea
            value={data.address}
            onChange={(event) => onChange((current) => ({ ...current, address: event.target.value }))}
            rows={2}
            placeholder="123 Main Street"
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring resize-none mt-1"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">City *</Label>
          <Input value={data.city} onChange={(event) => onChange((current) => ({ ...current, city: event.target.value }))} className="rounded-xl mt-1" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">State *</Label>
          <Input value={data.state} onChange={(event) => onChange((current) => ({ ...current, state: event.target.value }))} className="rounded-xl mt-1" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Country *</Label>
          <Input value={data.country} onChange={(event) => onChange((current) => ({ ...current, country: event.target.value }))} className="rounded-xl mt-1" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Pincode *</Label>
          <Input value={data.pincode} onChange={(event) => onChange((current) => ({ ...current, pincode: event.target.value }))} className="rounded-xl mt-1" />
        </div>
        <div className="md:col-span-2 space-y-1">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Google Maps URL</Label>
          <Input value={data.googleAddressUrl} onChange={(event) => onChange((current) => ({ ...current, googleAddressUrl: event.target.value }))} className="rounded-xl mt-1" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Latitude</Label>
          <Input value={data.latitude} onChange={(event) => onChange((current) => ({ ...current, latitude: event.target.value }))} className="rounded-xl mt-1" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Longitude</Label>
          <Input value={data.longitude} onChange={(event) => onChange((current) => ({ ...current, longitude: event.target.value }))} className="rounded-xl mt-1" />
        </div>
        <div className="md:col-span-2 flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Permanent Address</p>
            <p className="mt-1 text-[10px] text-muted-foreground/60">Mark this address as your permanent registry.</p>
          </div>
          <input
            type="checkbox"
            checked={data.isPermanent}
            onChange={(event) => onChange((current) => ({ ...current, isPermanent: event.target.checked }))}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={onSave} disabled={saving} className="rounded-xl text-xs font-bold h-9">
          {saving ? 'Saving…' : 'Save Address'}
        </Button>
        <Button variant="secondary" onClick={onCancel} className="rounded-xl text-xs font-bold h-9">
          Cancel
        </Button>
      </div>
    </div>
  );
}