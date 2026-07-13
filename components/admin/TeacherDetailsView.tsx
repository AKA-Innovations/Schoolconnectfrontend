'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  useTeacher,
  useUpdateTeacher,
  useUploadTeacherImage,
  useDeleteTeacherImage,
  useAddAddress,
  useUpdateAddress,
  useDeleteAddress,
  useAddClass,
  useUpdateClass,
  useDeleteClass,
  useUpdateSchoolRecord,
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
  useTeacherClassSubjectDetails
} from '@/hooks/useTeachers';
import { useSubjectDetails, useCreateSubjectDetail, useDeleteSubjectDetail, useSubjectOptions, useClassSectionLists } from '@/hooks/useClasses';
import { Teacher, Address, TeacherClass, SchoolRecord } from '@/types/roles';
import { SubjectDetail } from '@/types/class.types';
import { CURRENT_SESSION } from '@/lib/constants';
import {
  ArrowLeft, Save, Plus, Trash2, MapPin, BookOpen, Briefcase,
  Users, Mail, Phone, Calendar, ShieldCheck, Activity,
  Edit2, CheckCircle2, Camera, RefreshCw, GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TeacherDetailsViewProps {
  teacherId: string;
  onBack: () => void;
  onEdit?: () => void;
  readOnly?: boolean;
}

// ─── Root Component ──────────────────────────────────────────────────────────

export function TeacherDetailsView({ teacherId, onBack, onEdit, readOnly = false }: TeacherDetailsViewProps) {
  const [activeTab, setActiveTab] = useState('personal');
  const { data: teacher, isLoading, isFetching, refetch } = useTeacher(teacherId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4 animate-pulse">
        <div className="h-24 w-24 rounded-full bg-muted" />
        <div className="h-8 bg-muted rounded w-48" />
        <div className="h-4 bg-muted rounded w-64" />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-border/50">
        <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <h3 className="text-xl font-bold">Faculty Member Not Found</h3>
        <p className="text-muted-foreground mt-2">The record may have been relocated or deleted.</p>
        <Button variant="outline" onClick={onBack} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">

      {/* Header / Profile Card */}
      <Card className="erp-card overflow-hidden">
        <div className="relative p-6 sm:p-8 bg-card flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
          <ProfileImageSection teacher={teacher} teacherId={teacherId} readOnly={readOnly} />
          <div className="flex-1 text-center md:text-left space-y-1.5">
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-1.5">
              <span className="bg-muted/30 text-muted-foreground px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border border-border/40">
                {teacher.employeeId}
              </span>
              <span className={cn(
                'px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border',
                teacher.status === 'active'
                  ? 'bg-green-500/10 text-green-600 border-green-500/20'
                  : 'bg-red-500/10 text-red-600 border-red-500/20'
              )}>
                {teacher.status}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {teacher.firstName} {teacher.lastName}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-x-5 gap-y-1.5 text-muted-foreground/70 mt-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <Mail className="h-3.5 w-3.5 opacity-40 text-primary" />
                {teacher.employeeEmail}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <Phone className="h-3.5 w-3.5 opacity-40 text-primary" />
                {teacher.mobileNumber}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <Calendar className="h-3.5 w-3.5 opacity-40 text-primary" />
                Joined {teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—'}
              </div>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
              {teacher.isPrincipal && <RoleBadge label="Principal" />}
              {teacher.isCoordinator && <RoleBadge label="Coordinator" />}
              {teacher.isClassTeacher && (
                <RoleBadge 
                  label={teacher.classTeacherClass?.className 
                    ? `Class Teacher: ${teacher.classTeacherClass.className}—${teacher.classTeacherClass.sectionName}`
                    : "Class Teacher"
                  } 
                />
              )}
              {teacher.isSubjectTeacher && <RoleBadge label="Subject Teacher" />}
            </div>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            {readOnly && onEdit && (
              <Button variant="secondary" size="icon" onClick={onEdit}
                className="rounded-xl h-10 w-10 shadow-sm border border-border/50 bg-background/50 hover:bg-background animate-in zoom-in duration-300"
                title="Edit Profile">
                <Edit2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
            <Button variant="secondary" size="icon" onClick={() => { refetch(); toast.success('Profile refreshed'); }}
              className="rounded-xl h-10 w-10 shadow-sm border border-border/50 bg-background/50 hover:bg-background"
              title="Refresh">
              <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
            </Button>
            <Button variant="secondary" size="icon" onClick={onBack}
              className="rounded-xl h-10 w-10 shadow-sm border border-border/50 bg-background/50 hover:bg-background"
              title="Back to Directory">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="flex w-max min-w-full gap-2 bg-muted/20 p-1.5 rounded-2xl border border-border/50">
            {[
              { id: 'personal',     label: 'Identity & Details' },
              { id: 'employment',   label: 'Employment' },
              { id: 'pedagogical',  label: 'Pedagogical' },
              { id: 'classes',      label: 'Classes' },
              { id: 'addresses',    label: 'Addresses' },
            ].map(tab => (
              <TabsTrigger key={tab.id} value={tab.id}
                className="rounded-xl px-6 py-2.5 text-[10px] font-bold tracking-widest uppercase data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <div className="mt-6">
          <TabsContent value="personal"    className="mt-0"><PersonalDetailsForm teacher={teacher} teacherId={teacherId} readOnly={readOnly} /></TabsContent>
          <TabsContent value="employment"  className="mt-0"><EmploymentForm teacherId={teacherId} readOnly={readOnly} /></TabsContent>
          <TabsContent value="pedagogical" className="mt-0"><PedagogicalSection teacherId={teacherId} readOnly={readOnly} /></TabsContent>
          <TabsContent value="classes"     className="mt-0"><ClassesSection teacherId={teacherId} classes={teacher.classes || []} readOnly={readOnly} /></TabsContent>
          <TabsContent value="addresses"   className="mt-0"><AddressSection teacherId={teacherId} readOnly={readOnly} /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// ─── Profile Image (PUT + DELETE /teacher/:id/profile-image) ─────────────────

function ProfileImageSection({ teacher, teacherId, readOnly }: { teacher: Teacher; teacherId: string; readOnly: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadTeacherImage(teacherId);
  const deleteMutation = useDeleteTeacherImage(teacherId);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadMutation.mutate(file, {
      onSuccess: () => toast.success('Profile image updated'),
      onError: () => toast.error('Upload failed.'),
    });
    e.target.value = '';
  };

  const handleDelete = () => {
    if (!confirm('Delete profile image?')) return;
    deleteMutation.mutate(undefined, {
      onSuccess: () => toast.success('Profile image deleted'),
      onError: () => toast.error('Delete failed.'),
    });
  };

  const busy = uploadMutation.isPending || deleteMutation.isPending;

  return (
    <div className="shrink-0 relative group cursor-pointer">
      <div className="h-28 w-28 rounded-2xl bg-muted/10 flex items-center justify-center overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border border-border/50 relative">
        {teacher.profileImageUrl ? (
          <img src={teacher.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <div className="text-primary/60 font-bold text-3xl uppercase tracking-tighter">
            {(teacher.firstName ?? '?').charAt(0)}{(teacher.lastName ?? '').charAt(0)}
          </div>
        )}
        <div className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
          <button type="button" onClick={() => fileRef.current?.click()}
            className="text-white text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 hover:text-blue-300 transition-colors">
            <Camera className="h-3 w-3" />
            {busy ? 'Uploading…' : 'Upload'}
          </button>
          {teacher.profileImageUrl && (
            <button type="button" onClick={handleDelete}
              className="text-red-300 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 hover:text-red-200 transition-colors">
              <Trash2 className="h-3 w-3" />Remove
            </button>
          )}
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-2 border-card shadow-sm flex items-center justify-center">
        <ShieldCheck className="h-3 w-3 text-white" />
      </div>
    </div>
  );
}

// ─── Personal Identity Form (Tab-wise endpoints) ─────────────────────────────

function PersonalDetailsForm({ teacher, teacherId, readOnly }: { teacher: Teacher; teacherId: string; readOnly: boolean }) {
  const { data: basicRes, refetch: refetchBasic } = useTeacherBasicDetails(teacherId);
  const { data: personalRes, refetch: refetchPersonal } = useTeacherPersonalData(teacherId);
  const { data: academicRes, refetch: refetchAcademic } = useTeacherAcademicData(teacherId);
  const { data: professionalRes, refetch: refetchProfessional } = useTeacherProfessionalData(teacherId);
  const { data: familyRes, refetch: refetchFamily } = useTeacherFamilyDetails(teacherId);

  const updateBasic = useUpdateTeacherBasicDetails(teacherId);
  const updatePersonal = useUpdateTeacherPersonalData(teacherId);
  const updateAcademic = useUpdateTeacherAcademicData(teacherId);
  const updateProfessional = useUpdateTeacherProfessionalData(teacherId);
  const updateFamily = useUpdateTeacherFamilyDetails(teacherId);

  const [basicForm, setBasicForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    mobileNumber: '',
    alternateMobileNumber: '',
    emailId: '',
    isPrincipal: false,
    isCoordinator: false,
    isClassTeacher: false,
    isSubjectTeacher: false,
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
        isPrincipal: b.isPrincipal ?? false,
        isCoordinator: b.isCoordinator ?? false,
        isClassTeacher: b.isClassTeacher ?? false,
        isSubjectTeacher: b.isSubjectTeacher ?? false,
      });
    } else if (teacher) {
      setBasicForm({
        firstName: teacher.firstName ?? '',
        lastName: teacher.lastName ?? '',
        dateOfBirth: teacher.dateOfBirth ? new Date(teacher.dateOfBirth).toISOString().slice(0, 10) : '',
        gender: teacher.gender ?? '',
        mobileNumber: teacher.mobileNumber ?? '',
        alternateMobileNumber: teacher.alternateMobileNumber ?? '',
        emailId: teacher.emailId ?? '',
        isPrincipal: teacher.isPrincipal ?? false,
        isCoordinator: teacher.isCoordinator ?? false,
        isClassTeacher: teacher.isClassTeacher ?? false,
        isSubjectTeacher: teacher.isSubjectTeacher ?? false,
      });
    }
  }, [basicRes, teacher]);

  useEffect(() => {
    const p = personalRes?.data?.teacherPersonalData ?? personalRes?.teacherPersonalData ?? personalRes;
    if (p) {
      setPersonalForm({
        bloodGroup: p.bloodGroup ?? '',
        maritalStatus: p.maritalStatus ?? '',
        nationality: p.nationality ?? '',
        religion: p.religion ?? '',
      });
    } else if (teacher?.teacherPersonalData) {
      const tp = teacher.teacherPersonalData;
      setPersonalForm({
        bloodGroup: tp.bloodGroup ?? '',
        maritalStatus: tp.maritalStatus ?? '',
        nationality: tp.nationality ?? '',
        religion: tp.religion ?? '',
      });
    }
  }, [personalRes, teacher]);

  useEffect(() => {
    const a = academicRes?.data?.teacherAcademicData ?? academicRes?.teacherAcademicData ?? academicRes;
    if (a) {
      setAcademicForm({
        highestQualification: a.highestQualification ?? '',
        specialization: a.specialization ?? '',
        university: a.university ?? '',
        passingYear: a.passingYear ?? a.yearOfPassing ?? '',
      });
    } else if (teacher?.teacherAcademicData) {
      const ta = teacher.teacherAcademicData;
      setAcademicForm({
        highestQualification: ta.highestQualification ?? '',
        specialization: ta.specialization ?? '',
        university: ta.university ?? '',
        passingYear: ta.passingYear ?? ta.yearOfPassing ?? '',
      });
    }
  }, [academicRes, teacher]);

  useEffect(() => {
    const pr = professionalRes?.data?.teacherProfessionalData ?? professionalRes?.teacherProfessionalData ?? professionalRes;
    if (pr) {
      setProfessionalForm({
        designation: pr.designation ?? '',
        totalExperience: pr.totalExperience ?? '',
        previousSchool: pr.previousSchool ?? '',
      });
    } else if (teacher?.teacherProfessionalData) {
      const tp = teacher.teacherProfessionalData;
      setProfessionalForm({
        designation: tp.designation ?? '',
        totalExperience: tp.totalExperience ?? '',
        previousSchool: tp.previousSchool ?? '',
      });
    }
  }, [professionalRes, teacher]);

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
    } else if (teacher?.teacherFamilyDetails) {
      const tf = teacher.teacherFamilyDetails;
      setFamilyForm({
        fatherName: tf.fatherName ?? '',
        motherName: tf.motherName ?? '',
        spouseName: tf.spouseName ?? '',
        children: tf.children ?? 0,
        emergencyContact: tf.emergencyContact ?? '',
      });
    }
  }, [familyRes, teacher]);

  const handleSaveBasic = () => {
    updateBasic.mutate(basicForm, {
      onSuccess: () => { toast.success('Basic details saved'); refetchBasic(); },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Save basic details failed')
    });
  };

  const handleSavePersonal = () => {
    updatePersonal.mutate({ teacherPersonalData: personalForm }, {
      onSuccess: () => { toast.success('Personal data saved'); refetchPersonal(); },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Save personal data failed')
    });
  };

  const handleSaveAcademic = () => {
    updateAcademic.mutate({ teacherAcademicData: academicForm }, {
      onSuccess: () => { toast.success('Academic details saved'); refetchAcademic(); },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Save academic details failed')
    });
  };

  const handleSaveProfessional = () => {
    updateProfessional.mutate({ teacherProfessionalData: professionalForm }, {
      onSuccess: () => { toast.success('Professional data saved'); refetchProfessional(); },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Save professional data failed')
    });
  };

  const handleSaveFamily = () => {
    updateFamily.mutate({ teacherFamilyDetails: familyForm }, {
      onSuccess: () => { toast.success('Family details saved'); refetchFamily(); },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Save family details failed')
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Basic Core */}
      <Card className="erp-card overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-5 px-6">
          <div>
            <CardTitle className="text-base font-bold">Basic details</CardTitle>
            <CardDescription className="text-xs">Update teacher identity configuration.</CardDescription>
          </div>
          {!readOnly && (
            <Button onClick={handleSaveBasic} disabled={updateBasic.isPending} className="rounded-xl h-9 px-4 font-semibold text-xs shrink-0">
              <Save className="mr-1.5 h-3.5 w-3.5" /> Save Basic
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FieldGroup label="First Name"><Input value={basicForm.firstName} onChange={e => setBasicForm(p => ({ ...p, firstName: e.target.value }))} disabled={readOnly} className="rounded-xl" /></FieldGroup>
            <FieldGroup label="Last Name"><Input value={basicForm.lastName} onChange={e => setBasicForm(p => ({ ...p, lastName: e.target.value }))} disabled={readOnly} className="rounded-xl" /></FieldGroup>
            <FieldGroup label="Date of Birth"><Input type="date" value={basicForm.dateOfBirth} onChange={e => setBasicForm(p => ({ ...p, dateOfBirth: e.target.value }))} disabled={readOnly} className="rounded-xl" /></FieldGroup>
            <FieldGroup label="Gender">
              <select value={basicForm.gender} onChange={e => setBasicForm(p => ({ ...p, gender: e.target.value }))} disabled={readOnly}
                className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </FieldGroup>
            <FieldGroup label="Mobile Number"><Input value={basicForm.mobileNumber} onChange={e => setBasicForm(p => ({ ...p, mobileNumber: e.target.value }))} disabled={readOnly} className="rounded-xl" /></FieldGroup>
            <FieldGroup label="Alternate Mobile (optional)"><Input value={basicForm.alternateMobileNumber} onChange={e => setBasicForm(p => ({ ...p, alternateMobileNumber: e.target.value }))} disabled={readOnly} placeholder="Optional" className="rounded-xl" /></FieldGroup>
            <FieldGroup label="Personal Email" className="md:col-span-2"><Input type="email" value={basicForm.emailId} onChange={e => setBasicForm(p => ({ ...p, emailId: e.target.value }))} disabled={readOnly} className="rounded-xl" /></FieldGroup>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Institutional Roles</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {([
                { key: 'isPrincipal',    label: 'Principal'       },
                { key: 'isCoordinator',  label: 'Coordinator'     },
                { key: 'isClassTeacher', label: 'Class Teacher'   },
                { key: 'isSubjectTeacher', label: 'Subject Teacher' },
              ] as const).map(r => (
                <button key={r.key} type="button"
                  onClick={() => {
                    if (readOnly) return;
                    setBasicForm(p => {
                      const nextValue = !(p as any)[r.key];
                      const next = { ...p, [r.key]: nextValue };
                      const EXCLUSIVE = ['isPrincipal', 'isCoordinator', 'isClassTeacher'];
                      if (nextValue && EXCLUSIVE.includes(r.key)) {
                        EXCLUSIVE.forEach(k => {
                          if (k !== r.key) (next as any)[k] = false;
                        });
                      }
                      return next;
                    });
                  }}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-xl border text-left text-xs font-bold transition-all',
                    (basicForm as any)[r.key] 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : cn('bg-muted/30 border-border/50', !readOnly && 'hover:bg-muted/50'),
                    readOnly && 'cursor-default'
                  )}>
                  {r.label}
                  {(basicForm as any)[r.key] && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Data */}
      <Card className="erp-card overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-5 px-6">
          <div>
            <CardTitle className="text-base font-bold">Personal Data</CardTitle>
            <CardDescription className="text-xs">Update nationality and physical details.</CardDescription>
          </div>
          {!readOnly && (
            <Button onClick={handleSavePersonal} disabled={updatePersonal.isPending} className="rounded-xl h-9 px-4 font-semibold text-xs shrink-0">
              <Save className="mr-1.5 h-3.5 w-3.5" /> Save Personal
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FieldGroup label="Blood Group"><Input value={personalForm.bloodGroup} onChange={e => setPersonalForm(p => ({ ...p, bloodGroup: e.target.value }))} disabled={readOnly} className="rounded-xl" /></FieldGroup>
            <FieldGroup label="Marital Status">
              <select value={personalForm.maritalStatus} onChange={e => setPersonalForm(p => ({ ...p, maritalStatus: e.target.value }))} disabled={readOnly}
                className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Select</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </FieldGroup>
            <FieldGroup label="Nationality"><Input value={personalForm.nationality} onChange={e => setPersonalForm(p => ({ ...p, nationality: e.target.value }))} disabled={readOnly} className="rounded-xl" /></FieldGroup>
            <FieldGroup label="Religion"><Input value={personalForm.religion} onChange={e => setPersonalForm(p => ({ ...p, religion: e.target.value }))} disabled={readOnly} className="rounded-xl" /></FieldGroup>
          </div>
        </CardContent>
      </Card>

      {/* Academic Data */}
      <Card className="erp-card overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-5 px-6">
          <div>
            <CardTitle className="text-base font-bold">Academic Data</CardTitle>
            <CardDescription className="text-xs">Update qualification credentials.</CardDescription>
          </div>
          {!readOnly && (
            <Button onClick={handleSaveAcademic} disabled={updateAcademic.isPending} className="rounded-xl h-9 px-4 font-semibold text-xs shrink-0">
              <Save className="mr-1.5 h-3.5 w-3.5" /> Save Academic
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FieldGroup label="Highest Qualification"><Input value={academicForm.highestQualification} onChange={e => setAcademicForm(p => ({ ...p, highestQualification: e.target.value }))} disabled={readOnly} className="rounded-xl" /></FieldGroup>
            <FieldGroup label="Specialization"><Input value={academicForm.specialization} onChange={e => setAcademicForm(p => ({ ...p, specialization: e.target.value }))} disabled={readOnly} className="rounded-xl" /></FieldGroup>
            <FieldGroup label="University/College"><Input value={academicForm.university} onChange={e => setAcademicForm(p => ({ ...p, university: e.target.value }))} disabled={readOnly} className="rounded-xl" /></FieldGroup>
            <FieldGroup label="Passing Year"><Input value={academicForm.passingYear} onChange={e => setAcademicForm(p => ({ ...p, passingYear: e.target.value }))} disabled={readOnly} className="rounded-xl" /></FieldGroup>
          </div>
        </CardContent>
      </Card>

      {/* Professional Data */}
      <Card className="erp-card overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-5 px-6">
          <div>
            <CardTitle className="text-base font-bold">Professional Data</CardTitle>
            <CardDescription className="text-xs">Update expertise and school deployment experience.</CardDescription>
          </div>
          {!readOnly && (
            <Button onClick={handleSaveProfessional} disabled={updateProfessional.isPending} className="rounded-xl h-9 px-4 font-semibold text-xs shrink-0">
              <Save className="mr-1.5 h-3.5 w-3.5" /> Save Professional
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FieldGroup label="Designation"><Input value={professionalForm.designation} onChange={e => setProfessionalForm(p => ({ ...p, designation: e.target.value }))} disabled={readOnly} className="rounded-xl" /></FieldGroup>
            <FieldGroup label="Experience (Years)"><Input value={professionalForm.totalExperience} onChange={e => setProfessionalForm(p => ({ ...p, totalExperience: e.target.value }))} disabled={readOnly} className="rounded-xl" /></FieldGroup>
            <FieldGroup label="Previous School/Employer"><Input value={professionalForm.previousSchool} onChange={e => setProfessionalForm(p => ({ ...p, previousSchool: e.target.value }))} disabled={readOnly} className="rounded-xl" /></FieldGroup>
          </div>
        </CardContent>
      </Card>

      {/* Family & Emergency */}
      <Card className="erp-card overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-5 px-6">
          <div>
            <CardTitle className="text-base font-bold">Family & Emergency details</CardTitle>
            <CardDescription className="text-xs">Update household details and emergency contact.</CardDescription>
          </div>
          {!readOnly && (
            <Button onClick={handleSaveFamily} disabled={updateFamily.isPending} className="rounded-xl h-9 px-4 font-semibold text-xs shrink-0">
              <Save className="mr-1.5 h-3.5 w-3.5" /> Save Family
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FieldGroup label="Father's Name"><Input value={familyForm.fatherName} onChange={e => setFamilyForm(p => ({ ...p, fatherName: e.target.value }))} disabled={readOnly} className="rounded-xl" /></FieldGroup>
            <FieldGroup label="Mother's Name"><Input value={familyForm.motherName} onChange={e => setFamilyForm(p => ({ ...p, motherName: e.target.value }))} disabled={readOnly} className="rounded-xl" /></FieldGroup>
            <FieldGroup label="Spouse Name"><Input value={familyForm.spouseName} onChange={e => setFamilyForm(p => ({ ...p, spouseName: e.target.value }))} disabled={readOnly} className="rounded-xl" /></FieldGroup>
            <FieldGroup label="Number of Children"><Input type="number" value={familyForm.children} onChange={e => setFamilyForm(p => ({ ...p, children: parseInt(e.target.value, 10) || 0 }))} disabled={readOnly} className="rounded-xl" /></FieldGroup>
            <FieldGroup label="Emergency Contact Number" className="md:col-span-2"><Input value={familyForm.emergencyContact} onChange={e => setFamilyForm(p => ({ ...p, emergencyContact: e.target.value }))} disabled={readOnly} className="rounded-xl" /></FieldGroup>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Employment / School Record Form (PUT /teacher/school-record/:recordId) ───

function EmploymentForm({ teacherId, readOnly }: { teacherId: string; readOnly: boolean }) {
  const { data: recordRes, isLoading, refetch } = useTeacherSchoolRecord(teacherId);
  const record = recordRes?.data ?? recordRes;

  const updateRecordMutation = useUpdateSchoolRecord(teacherId);
  const [form, setForm] = useState({
    employeeId: '',
    joiningDate: '',
    employeeEmail: '',
  });

  useEffect(() => {
    if (record) {
      setForm({
        employeeId: record.employeeId ?? '',
        joiningDate: record.joiningDate ? new Date(record.joiningDate).toISOString().slice(0, 10) : '',
        employeeEmail: record.employeeEmail ?? '',
      });
    }
  }, [record]);

  const handleSave = () => {
    if (!record?.id) { toast.error('No school record ID found.'); return; }
    updateRecordMutation.mutate(
      { recordId: record.id, data: form },
      {
        onSuccess: () => { toast.success('Employment record saved'); refetch(); },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Update failed.')
      }
    );
  };

  if (isLoading) {
    return <Card className="h-44 bg-muted/20 animate-pulse rounded-2xl" />;
  }

  return (
    <Card className="erp-card overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-6 px-8">
        <div>
          <CardTitle className="text-xl font-bold tracking-tight">Employment Record</CardTitle>
          <CardDescription className="text-xs font-medium opacity-70 mt-1">School employment details and official contact.</CardDescription>
        </div>
        {!readOnly && record?.id && (
          <Button onClick={handleSave} disabled={updateRecordMutation.isPending} className="rounded-xl h-10 px-6 font-bold shadow-sm text-xs">
            <Save className="mr-2 h-4 w-4" />{updateRecordMutation.isPending ? 'Saving…' : 'Save Changes'}
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FieldGroup label="Employee ID"><Input value={form.employeeId} onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))} disabled={readOnly} className="rounded-xl" /></FieldGroup>
          <FieldGroup label="Joining Date"><Input type="date" value={form.joiningDate} onChange={e => setForm(p => ({ ...p, joiningDate: e.target.value }))} disabled={readOnly} className="rounded-xl" /></FieldGroup>
          <FieldGroup label="Professional Email" className="md:col-span-2"><Input type="email" value={form.employeeEmail} onChange={e => setForm(p => ({ ...p, employeeEmail: e.target.value }))} disabled={readOnly} className="rounded-xl" /></FieldGroup>
        </div>
        {!record?.id && (
          <p className="mt-4 text-xs text-destructive font-semibold">No school record found on backend — cannot save changes.</p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Address Section (POST + PUT + DELETE /teacher/address) ──────────────────

type AddrFields = Omit<Address, 'id'>;
const emptyAddr = (): AddrFields => ({ isPermanent: false, address: '', state: '', city: '', country: '', pincode: '', googleAddressUrl: '', latitude: '', longitude: '' });

function AddressSection({ teacherId, readOnly }: { teacherId: string; readOnly: boolean }) {
  const { data: addressesRes, isLoading, refetch } = useTeacherAddresses(teacherId);
  const addresses: Address[] = addressesRes?.data ?? addressesRes ?? [];

  const addAddrMutation = useAddAddress(teacherId);
  const updateAddrMutation = useUpdateAddress(teacherId);
  const deleteAddrMutation = useDeleteAddress(teacherId);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newAddr, setNewAddr] = useState<AddrFields>(emptyAddr());
  const [editAddr, setEditAddr] = useState<AddrFields>(emptyAddr());

  const saving = addAddrMutation.isPending || updateAddrMutation.isPending || deleteAddrMutation.isPending;

  const handleAdd = () => {
    if (!newAddr.address || !newAddr.city || !newAddr.state || !newAddr.country || !newAddr.pincode) { toast.error('Please fill in all required fields.'); return; }
    addAddrMutation.mutate(newAddr, {
      onSuccess: () => { setShowAdd(false); setNewAddr(emptyAddr()); refetch(); toast.success('Address added'); },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to save address.'),
    });
  };

  const handleUpdate = (id: number) => {
    updateAddrMutation.mutate({ id, addr: editAddr }, {
      onSuccess: () => { setEditingId(null); refetch(); toast.success('Address updated'); },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update address.'),
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm('Delete this address?')) return;
    deleteAddrMutation.mutate(id, {
      onSuccess: () => { refetch(); toast.success('Address deleted'); },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to delete address.'),
    });
  };

  if (isLoading) {
    return <Card className="h-44 bg-muted/20 animate-pulse rounded-2xl" />;
  }

  return (
    <Card className="erp-card overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-6 px-8">
        <div>
          <CardTitle className="text-xl font-bold tracking-tight">Addresses</CardTitle>
          <CardDescription className="text-xs font-medium opacity-70 mt-1">Physical residency and contact locations.</CardDescription>
        </div>
        {!readOnly && (
          <Button variant="secondary" size="sm" className="rounded-xl h-10 px-6 font-bold text-xs border border-border/50"
            onClick={() => { setShowAdd(v => !v); setEditingId(null); }}>
            <Plus className="mr-2 h-4 w-4" />{showAdd ? 'Cancel' : 'Add Address'}
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        {showAdd && <AddressForm data={newAddr} onChange={setNewAddr} onSave={handleAdd} onCancel={() => setShowAdd(false)} saving={saving} mode="add" />}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map(addr => (
            <div key={addr.id}>
              {editingId === addr.id ? (
                <AddressForm data={editAddr} onChange={setEditAddr} onSave={() => handleUpdate(addr.id)} onCancel={() => setEditingId(null)} saving={saving} mode="edit" />
              ) : (
                <div className="relative p-6 rounded-2xl bg-muted/5 border border-border/50 group hover:border-primary/40 hover:bg-background transition-all">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary/70 shrink-0 group-hover:scale-110 transition-transform">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-foreground/80">{addr.city}, {addr.state}</h4>
                        {addr.isPermanent && <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border border-primary/20">Permanent</span>}
                      </div>
                      <p className="text-sm text-muted-foreground/80 leading-relaxed">{addr.address}</p>
                      <div className="flex items-center gap-4 pt-1">
                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">{addr.country}</span>
                        <span className="text-[10px] font-bold text-primary/40">{addr.pincode}</span>
                      </div>
                    </div>
                  </div>
                  {!readOnly && (
                    <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-muted"
                        onClick={() => { setEditingId(addr.id); setEditAddr({ isPermanent: addr.isPermanent, address: addr.address, state: addr.state, city: addr.city, country: addr.country, pincode: addr.pincode, googleAddressUrl: addr.googleAddressUrl ?? '', latitude: addr.latitude ?? '', longitude: addr.longitude ?? '' }); setShowAdd(false); }}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => handleDelete(addr.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {addresses.length === 0 && !showAdd && (
            <div className="col-span-full py-12 text-center text-muted-foreground/40 bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-[10px] font-bold uppercase tracking-widest">No addresses registered.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AddressForm({ data, onChange, onSave, onCancel, saving, mode }: {
  data: AddrFields; onChange: (d: AddrFields) => void; onSave: () => void; onCancel: () => void; saving: boolean; mode: 'add' | 'edit';
}) {
  return (
    <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5 space-y-4">
      <h4 className="text-xs font-bold uppercase tracking-widest text-primary/70">{mode === 'add' ? 'New Address' : 'Edit Address'}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Street Address *</Label>
          <Input value={data.address} onChange={e => onChange({ ...data, address: e.target.value })} placeholder="123 Main Street" className="mt-1 rounded-xl" />
        </div>
        <div>
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">City *</Label>
          <Input value={data.city} onChange={e => onChange({ ...data, city: e.target.value })} placeholder="City" className="mt-1 rounded-xl" />
        </div>
        <div>
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">State *</Label>
          <Input value={data.state} onChange={e => onChange({ ...data, state: e.target.value })} placeholder="State" className="mt-1 rounded-xl" />
        </div>
        <div>
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Country *</Label>
          <Input value={data.country} onChange={e => onChange({ ...data, country: e.target.value })} placeholder="Country" className="mt-1 rounded-xl" />
        </div>
        <div>
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Pincode *</Label>
          <Input value={data.pincode} onChange={e => onChange({ ...data, pincode: e.target.value })} placeholder="000000" className="mt-1 rounded-xl" />
        </div>
        <div className="md:col-span-2 flex items-center gap-3">
          <input type="checkbox" id="addrIsPermanent" checked={!!data.isPermanent} onChange={e => onChange({ ...data, isPermanent: e.target.checked })} className="h-4 w-4 rounded" />
          <Label htmlFor="addrIsPermanent" className="text-xs font-semibold cursor-pointer">Mark as Permanent Address</Label>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" size="sm" className="rounded-xl" onClick={onCancel}>Cancel</Button>
        <Button size="sm" className="rounded-xl" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : mode === 'add' ? 'Add Address' : 'Update Address'}</Button>
      </div>
    </div>
  );
}

// ─── Classes Section (POST + PUT + DELETE /teacher/class) ────────────────────

function ClassesSection({ teacherId, classes, readOnly }: { teacherId: string; classes: TeacherClass[]; readOnly: boolean }) {
  const addClassMutation = useAddClass(teacherId);
  const updateClassMutation = useUpdateClass(teacherId);
  const deleteClassMutation = useDeleteClass(teacherId);
  const { data: ctRes, refetch: refetchCt } = useTeacherClassTeacher(teacherId);
  const { data: coordRes, refetch: refetchCoord } = useTeacherCoordinatorClasses(teacherId);

  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const emptyClass = (): TeacherClass => ({ className: '', sectionName: '', subjectName: '' });
  const [newClass, setNewClass] = useState<TeacherClass>(emptyClass());
  const [editClass, setEditClass] = useState<TeacherClass>(emptyClass());

  const saving = addClassMutation.isPending || updateClassMutation.isPending || deleteClassMutation.isPending;

  const handleAdd = () => {
    if (!newClass.className || !newClass.sectionName || !newClass.subjectName) { toast.error('Please fill in all fields.'); return; }
    addClassMutation.mutate(newClass, {
      onSuccess: () => { setShowAdd(false); setNewClass(emptyClass()); toast.success('Class assignment added'); },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to add class.'),
    });
  };

  const handleUpdate = (id: number) => {
    updateClassMutation.mutate({ id, cls: editClass }, {
      onSuccess: () => { setEditingId(null); toast.success('Class assignment updated'); },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update class.'),
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm('Remove this class assignment?')) return;
    deleteClassMutation.mutate(id, {
      onSuccess: () => toast.success('Class assignment removed'),
      onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to delete class.'),
    });
  };

  const ctc = ctRes?.data?.[0] ?? ctRes?.[0] ?? null;
  const coordMappings = coordRes?.data ?? coordRes ?? [];

  return (
    <div className="space-y-6">
      {/* Class Teacher Assignment Card */}
      <Card className="erp-card overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/10 py-5 px-8">
          <CardTitle className="text-base font-bold tracking-tight flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Class Teacher Assignment
          </CardTitle>
          <CardDescription className="text-xs font-medium opacity-70 mt-0.5">
            The homeroom section this teacher is responsible for.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          {ctc?.className ? (
            <div className="flex items-center gap-5 p-5 rounded-2xl border border-border bg-muted/10">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <GraduationCap className="h-7 w-7 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-primary/70">Assigned Homeroom</p>
                <p className="text-2xl font-bold text-foreground">
                  Class {ctc.className} &mdash; Section {ctc.sectionName}
                </p>
                {ctc.classSectionsId && (
                  <p className="text-xs text-muted-foreground font-mono">ID: {ctc.classSectionsId}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-muted-foreground/40 bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
              <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-[11px] font-bold uppercase tracking-widest">No class teacher assignment</p>
              <p className="text-xs text-muted-foreground/30 mt-1">Assign via the Class Teacher Mapping page or teacher profile edit.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coordinator class mappings */}
      <Card className="erp-card overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/10 py-5 px-8">
          <CardTitle className="text-base font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Class Coordinator Mappings
          </CardTitle>
          <CardDescription className="text-xs font-medium opacity-70 mt-0.5">
            The classes managed as class coordinator.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
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
              <p className="text-[11px] font-bold uppercase tracking-widest">No Coordinator mappings.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subject / Teaching Classes */}
      <Card className="erp-card overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-5 px-8">
          <div>
            <CardTitle className="text-base font-bold tracking-tight flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Subject Teaching Assignments
            </CardTitle>
            <CardDescription className="text-xs font-medium opacity-70 mt-0.5">
              Classes where this teacher delivers instruction.
            </CardDescription>
          </div>
          {!readOnly && (
            <Button variant="secondary" size="sm" className="rounded-xl h-9 px-4 font-semibold text-xs border border-border/50"
              onClick={() => { setShowAdd(v => !v); setEditingId(null); }}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />{showAdd ? 'Cancel' : 'Add'}
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          {showAdd && <ClassForm data={newClass} onChange={setNewClass} onSave={handleAdd} onCancel={() => setShowAdd(false)} saving={saving} mode="add" />}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map(cls => (
              <div key={cls.id}>
                {editingId === cls.id ? (
                  <ClassForm data={editClass} onChange={setEditClass} onSave={() => cls.id !== undefined && handleUpdate(cls.id)} onCancel={() => setEditingId(null)} saving={saving} mode="edit" />
                ) : (
                  <div className="p-5 rounded-2xl bg-muted/10 border border-border/50 group hover:border-primary/40 hover:bg-background transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      {!readOnly && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-muted"
                            onClick={() => { setEditingId(cls.id!); setEditClass({ className: cls.className, sectionName: cls.sectionName, subjectName: cls.subjectName }); setShowAdd(false); }}>
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10"
                            onClick={() => cls.id !== undefined && handleDelete(cls.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <h4 className="font-bold text-foreground/80">Class {cls.className} — {cls.sectionName}</h4>
                    <p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest mt-1.5">{cls.subjectName}</p>
                  </div>
                )}
              </div>
            ))}
            {classes.length === 0 && !showAdd && (
              <div className="col-span-full py-12 text-center text-muted-foreground/40 bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-[10px] font-bold uppercase tracking-widest">No subject teaching assignments.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ClassForm({ data, onChange, onSave, onCancel, saving, mode }: {
  data: TeacherClass; onChange: (d: TeacherClass) => void; onSave: () => void; onCancel: () => void; saving: boolean; mode: 'add' | 'edit';
}) {
  return (
    <div className="p-6 rounded-2xl border border-border bg-muted/5 space-y-4">
      <h4 className="text-xs font-bold uppercase tracking-widest text-primary">{mode === 'add' ? 'New Assignment' : 'Edit Assignment'}</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Class *</Label>
          <Input value={data.className} onChange={e => onChange({ ...data, className: e.target.value })} placeholder="Grade 10" className="mt-1 rounded-xl" />
        </div>
        <div>
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Section *</Label>
          <Input value={data.sectionName} onChange={e => onChange({ ...data, sectionName: e.target.value })} placeholder="A" className="mt-1 rounded-xl" />
        </div>
        <div>
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Subject *</Label>
          <Input value={data.subjectName} onChange={e => onChange({ ...data, subjectName: e.target.value })} placeholder="Mathematics" className="mt-1 rounded-xl" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" size="sm" className="rounded-xl" onClick={onCancel}>Cancel</Button>
        <Button size="sm" className="rounded-xl" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : mode === 'add' ? 'Add Class' : 'Update Class'}</Button>
      </div>
    </div>
  );
}

// ─── Pedagogical Mapping Section (GET/POST/DELETE /class/subject-dtls) ───────

function PedagogicalSection({ teacherId, readOnly }: { teacherId: string; readOnly: boolean }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newMapping, setNewMapping] = useState({
    classId: 0,
    classSectionId: 0,
    subjectId: 0,
    className: '',
    sectionName: '',
    subjectName: ''
  });

  const { data: allDetails, isLoading } = useSubjectDetails();
  const { data: subjectOptsData } = useSubjectOptions(newMapping.classId || undefined);
  const { data: classSectionsData } = useClassSectionLists();
  const createMutation = useCreateSubjectDetail();
  const deleteMutation = useDeleteSubjectDetail();

  const mappings: SubjectDetail[] = (allDetails ?? []).filter((d: SubjectDetail) => d.teacherId === teacherId);

  const classNames: string[] = Array.from(new Set(
    (classSectionsData ?? []).map((s: any) => String(s.className))
  )).sort() as string[];

  const handleAdd = () => {
    if (!newMapping.classId || !newMapping.classSectionId || !newMapping.subjectId) {
      toast.error('Please select class, section, and subject.'); return;
    }
    createMutation.mutate(
      {
        entries: [{
          session: CURRENT_SESSION,
          teacherId,
          classId: newMapping.classId,
          classSectionId: newMapping.classSectionId,
          subjectId: newMapping.subjectId
        }]
      },
      {
        onSuccess: () => {
          setShowAdd(false);
          setNewMapping({
            classId: 0,
            classSectionId: 0,
            subjectId: 0,
            className: '',
            sectionName: '',
            subjectName: ''
          });
          toast.success('Pedagogical mapping added');
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create mapping.'),
      }
    );
  };

  const handleDelete = (id: number | string) => {
    if (!confirm('Remove this pedagogical mapping?')) return;
    deleteMutation.mutate(id as any, {
      onSuccess: () => toast.success('Pedagogical mapping removed'),
      onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to delete mapping.'),
    });
  };

  return (
    <Card className="erp-card overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-6 px-8">
        <div>
          <CardTitle className="text-xl font-bold tracking-tight">Pedagogical Mapping</CardTitle>
          <CardDescription className="text-xs font-medium opacity-70 mt-1">
            Subject assignments for the current session ({CURRENT_SESSION}).
          </CardDescription>
        </div>
        {!readOnly && (
          <Button variant="secondary" size="sm" className="rounded-xl h-10 px-6 font-bold text-xs border border-border/50"
            onClick={() => setShowAdd(v => !v)}>
            <Plus className="mr-2 h-4 w-4" />{showAdd ? 'Cancel' : 'Add Mapping'}
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        {showAdd && (
          <div className="p-6 rounded-2xl border border-border bg-muted/5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary">New Mapping</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Class *</Label>
                <select
                  value={newMapping.classId || ''}
                  onChange={e => {
                    const id = Number(e.target.value);
                    const cs = (classSectionsData ?? []).find((s: any) => s.classId === id);
                    setNewMapping({
                      classId: id,
                      className: cs?.className ?? '',
                      sectionName: '',
                      classSectionId: 0,
                      subjectId: 0,
                      subjectName: ''
                    });
                  }}
                  className="mt-1 w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Select class</option>
                  {classNames.map(name => {
                    const cs = (classSectionsData ?? []).find((s: any) => s.className === name);
                    return <option key={cs?.classId ?? name} value={cs?.classId}>{name}</option>;
                  })}
                </select>
              </div>
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Section *</Label>
                <select
                  value={newMapping.classSectionId || ''}
                  onChange={e => {
                    const id = Number(e.target.value);
                    const cs = (classSectionsData ?? []).find((s: any) => s.id === id);
                    setNewMapping(p => ({ ...p, classSectionId: id, sectionName: cs?.sectionName ?? '', subjectName: '', subjectId: 0 }));
                  }}
                  className="mt-1 w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={!newMapping.classId}>
                  <option value="">Select section</option>
                  {(classSectionsData ?? [])
                    .filter((s: any) => s.classId === newMapping.classId)
                    .map((s: any) => <option key={s.id} value={s.id}>{s.sectionName}</option>)
                  }
                </select>
              </div>
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Subject *</Label>
                <select
                  value={newMapping.subjectId || ''}
                  onChange={e => {
                    const id = Number(e.target.value);
                    const s = (subjectOptsData ?? []).find((so: any) => so.id === id);
                    setNewMapping(p => ({ ...p, subjectId: id, subjectName: s?.subjectName ?? '' }));
                  }}
                  className="mt-1 w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={!newMapping.classId}>
                  <option value="">Select subject</option>
                  {(subjectOptsData ?? []).map((s: any) => <option key={s.id} value={s.id}>{s.subjectName}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button size="sm" className="rounded-xl" onClick={handleAdd} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Saving…' : 'Add Mapping'}
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-28 rounded-2xl bg-muted/20 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mappings.map((m: SubjectDetail) => (
              <div key={m.id} className="p-5 rounded-2xl bg-muted/10 border border-border/50 group hover:border-primary/40 hover:bg-background transition-all relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  {!readOnly && (
                    <Button size="icon" variant="ghost"
                      className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                      onClick={() => handleDelete(m.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <h4 className="font-bold text-foreground/80">{m.className} — {m.sectionName}</h4>
                <p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest mt-1.5">{m.subjectName}</p>
                {m.session && (
                  <p className="text-[9px] text-muted-foreground/50 mt-1">Session: {m.session}</p>
                )}
              </div>
            ))}
            {mappings.length === 0 && !showAdd && (
              <div className="col-span-full py-12 text-center text-muted-foreground/40 bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
                <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-[10px] font-bold uppercase tracking-widest">No pedagogical mappings yet.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Shared Utilities ─────────────────────────────────────────────────────────

function FieldGroup({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{label}</Label>
      {children}
    </div>
  );
}

function RoleBadge({ label }: { label: string }) {
  return <span className="text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider bg-primary/10 text-primary border-primary/20">{label}</span>;
}
