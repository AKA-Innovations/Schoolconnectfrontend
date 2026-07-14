'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Save, UserPlus, FileText,
  Briefcase, BookOpen, X, MapPin,
  ShieldCheck, Globe, Calendar, Mail, Phone,
  CheckCircle2, Plus, Users, User, PhoneCall, Link2,
  Compass, Users2, GraduationCap,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { teacherService } from '@/services/teacher.service';
import { classService } from '@/services/class.service';
import { useCreateSubjectDetail, useDeleteSubjectDetail } from '@/hooks/useClasses';
import { CURRENT_SESSION } from '@/lib/constants';
import { TeacherRegistrationData, TeacherClass } from '@/types/roles';
import { useAuthStore } from '@/store/authStore';
import { useClassSectionLists, useClassList, useSubjectOptions } from '@/hooks/useClasses';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TeacherRegistrationFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  initialData?: any;
}

function FG({ label, children, required, className }: { label: string; children: React.ReactNode; required?: boolean; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

export function TeacherRegistrationForm({ onCancel, onSuccess, initialData }: TeacherRegistrationFormProps) {
  const { schoolId } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const isEditMode = !!initialData?.id;

  // Fetch available class-sections for dropdowns
  const { data: classSections = [] } = useClassSectionLists();
  const { data: classNames = [] } = useClassList();
  const createSubjectMut = useCreateSubjectDetail();
  const deleteSubjectMut = useDeleteSubjectDetail();

  const [formData, setFormData] = useState<TeacherRegistrationData>(() => ({
    username: initialData?.user?.username ?? '',   // ✅ FIXED
    password: '',
    schoolId: initialData?.schoolId ?? schoolId ?? '',
    employeeId: initialData?.employeeId ?? '',

    isPrincipal: initialData?.isPrincipal ?? false,
    isCoordinator: initialData?.isCoordinator ?? false,
    isClassTeacher: initialData?.isClassTeacher ?? false,
    isSubjectTeacher: initialData?.isSubjectTeacher ?? false,

    firstName: initialData?.firstName ?? '',
    lastName: initialData?.lastName ?? '',

    dateOfBirth: initialData?.dateOfBirth
      ? new Date(initialData.dateOfBirth).toISOString().slice(0, 10)
      : '',

    gender: initialData?.gender ?? '',
    mobileNumber: initialData?.mobileNumber ?? '',
    alternateMobileNumber: initialData?.alternateMobileNumber ?? '',
    emailId: initialData?.emailId ?? '',

    // ✅ FIXED (correct source)
    joiningDate: initialData?.schoolRecord?.joiningDate
      ? new Date(initialData.schoolRecord.joiningDate)
        .toISOString()
        .slice(0, 10)
      : '',

    // ✅ FIXED (correct source)
    employeeEmail:
      initialData?.schoolRecord?.employeeEmail ??
      initialData?.employeeEmail ??
      '',

    classes: initialData?.classes ?? [],
  }));
  console.log('INITIAL DATA 👉', initialData);


  // ─── Coordinator class scope state ───────────────────────────────────────
  const [coordinatorClasses, setCoordinatorClasses] = useState<string[]>([]);

  useEffect(() => {
    if (!isEditMode || coordinatorClasses.length > 0) return;
    const existingMappings = initialData?.coordinatorMappings ?? [];
    const resolved = existingMappings
      .map((m: any) => m.className ?? classSections.find((c: any) => c.id === m.classDtlsId)?.className)
      .filter((className: string | undefined): className is string => Boolean(className));
    setCoordinatorClasses(Array.from(new Set(resolved)));
  }, [classSections, coordinatorClasses.length, initialData, isEditMode]);

  const [newClass, setNewClass] = useState<TeacherClass>({
    className: '',
    sectionName: '',
    subjectName: '',
    classId: undefined,
    classSectionId: undefined,
    subjectId: undefined,
  });
  const { data: subjectOptions = [] } = useSubjectOptions(newClass.classId);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // isPrincipal, isCoordinator, isClassTeacher are mutually exclusive.
  // isSubjectTeacher is independent and can be combined with any of them.
  const EXCLUSIVE_ROLES = ['isPrincipal', 'isCoordinator', 'isClassTeacher'] as const;
  const handleCheckboxChange = (name: string) => {
    setFormData(prev => {
      const next = { ...prev, [name]: !(prev as any)[name] };
      // When turning on an exclusive role, turn off the other two
      if (EXCLUSIVE_ROLES.includes(name as any) && !(prev as any)[name]) {
        EXCLUSIVE_ROLES.forEach((role) => {
          if (role !== name) (next as any)[role] = false;
        });
      }
      return next;
    });
  };

  const addClass = () => {
    if (newClass.classId && newClass.classSectionId && newClass.subjectId) {
      setFormData(prev => ({
        ...prev,
        classes: [...prev.classes, { ...newClass }]
      }));
      setNewClass({
        className: '',
        sectionName: '',
        subjectName: '',
        classId: undefined,
        classSectionId: undefined,
        subjectId: undefined,
      });
    } else {
      toast.error('Please select Class, Section and Subject');
    }
  };

  const removeClass = (index: number) => {
    setFormData(prev => ({
      ...prev,
      classes: prev.classes.filter((_, i) => i !== index)
    }));
  };

  const toggleCoordinatorClass = (className: string) => {
    setCoordinatorClasses(prev =>
      prev.includes(className) ? prev.filter((name) => name !== className) : [...prev, className]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditMode) {
        // 1. Update details
        await teacherService.updateTeacherDetails(initialData.id, {
          isPrincipal: formData.isPrincipal,
          isCoordinator: formData.isCoordinator,
          isClassTeacher: formData.isClassTeacher,
          isSubjectTeacher: formData.isSubjectTeacher,
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          mobileNumber: formData.mobileNumber,
          alternateMobileNumber: formData.alternateMobileNumber,
          emailId: formData.emailId,
          teacherPersonalData: {
            bloodGroup: (formData as any).bloodGroup,
            maritalStatus: (formData as any).maritalStatus,
            nationality: (formData as any).nationality,
            religion: (formData as any).religion,
          },
          teacherAcademicData: {
            highestQualification: (formData as any).highestQualification,
            specialization: (formData as any).specialization,
            university: (formData as any).university,
            passingYear: (formData as any).passingYear,
          },
          teacherProfessionalData: {
            designation: (formData as any).designation,
            totalExperience: (formData as any).totalExperience,
            previousSchool: (formData as any).previousSchool,
          },
          teacherFamilyDetails: {
            fatherName: (formData as any).fatherName,
            motherName: (formData as any).motherName,
            emergencyContactName: (formData as any).emergencyContactName,
            emergencyContactPhone: (formData as any).emergencyContactPhone,
          },
        });



        // 3. Handle coordinator class mapping changes
        if (formData.isCoordinator) {
          const prevClassNames = Array.from(new Set<string>(
            (initialData?.coordinatorMappings ?? [])
              .map((m: any) => m.className ?? classSections.find((c: any) => c.id === m.classDtlsId)?.className)
              .filter((className: unknown): className is string => Boolean(className)),
          ));
          const toAdd = coordinatorClasses.filter((className) => !prevClassNames.includes(className));
          const toRemove = prevClassNames.filter((className) => !coordinatorClasses.includes(className));
          await Promise.all([
            ...toAdd.map((className) =>
              teacherService.addCoordinatorClass({
                session: CURRENT_SESSION,
                teacherId: initialData.id,
                className
              }),
            ),
            ...toRemove.flatMap((className) => {
              const mappings = (initialData?.coordinatorMappings ?? []).filter((m: any) => {
                const mappedClassName = m.className ?? classSections.find((c: any) => c.id === m.classDtlsId)?.className;
                return mappedClassName === className;
              });
              return mappings.map((m: any) => teacherService.removeCoordinatorClass(m.id));
            }),
          ]);
        } else if (initialData?.coordinatorMappings?.length) {
          await Promise.all(
            initialData.coordinatorMappings.map((m: any) => teacherService.removeCoordinatorClass(m.id))
          );
        }

        // 4. Sync pedagogical mappings (subject-dtls) with backend
        // Existing mappings for this teacher are in initialData.classes (each may have .id)
        try {
          const existing: any[] = initialData?.classes ?? [];
          const desired: any[] = formData.classes ?? [];

          // Add new mappings that don't exist yet (use react-query mutations)
          const toAdd = desired.filter((d) => !existing.some((ex) => (
            ex.className === d.className && ex.sectionName === d.sectionName && ex.subjectName === d.subjectName
          )));
          const toRemove = existing.filter((ex) => !desired.some((d) => (
            ex.className === d.className && ex.sectionName === d.sectionName && ex.subjectName === d.subjectName
          )));

          await Promise.all(toAdd.map((d) => {
            if (!d.classId || !d.classSectionId || !d.subjectId) {
              console.error('Missing IDs for mapping', d);
              return Promise.resolve();
            }
            return createSubjectMut.mutateAsync({
              entries: [{
                session: CURRENT_SESSION,
                teacherId: initialData.id,
                classId: d.classId,
                classSectionId: d.classSectionId,
                subjectId: d.subjectId,
              }]
            });
          }));

          await Promise.all(toRemove.map((ex) => ex.id ? deleteSubjectMut.mutateAsync(ex.id) : Promise.resolve()));
        } catch (err) {
          console.error('Failed syncing pedagogical mappings', err);
          toast.error('Failed to sync pedagogical mappings. Please try updating mappings separately.');
        }

        toast.success('Teacher profile updated successfully');
      } else {
        const { classes: _classes, ...flatFields } = formData;
        const payload = {
          ...flatFields,
          coordinatorClasses: formData.isCoordinator
            ? coordinatorClasses.map((className) => ({ className, session: CURRENT_SESSION }))
            : undefined,
        };

        await teacherService.registerTeacher(payload as any);

        toast.success('Faculty member onboarded successfully');
      }
      onSuccess();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || (isEditMode ? 'Update failed. Please try again.' : 'Registration protocol failed.'));
    } finally {
      setLoading(false);
    }
  };

  // Unique class names for grouping
  const uniqueClassNames = [...new Set(classSections.map((cs: any) => cs.className))].sort();

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="secondary"
          size="icon"
          onClick={onCancel}
          className="rounded-xl h-10 w-10 border border-border/50 shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {initialData ? 'Update Profile' : 'Onboard Faculty'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {initialData ? 'Update the existing teacher information.' : 'Add a new member to the institutional directory.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Identity Section */}
        <Card className="erp-card overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/10 py-5 px-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <User className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold tracking-tight">Personal Identity</CardTitle>
                <CardDescription className="text-xs font-medium opacity-70 mt-0.5">Core identity fields and contact records.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FG label="First Name" required>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                  <Input name="firstName" required value={formData.firstName} onChange={handleInputChange} className="pl-9 rounded-xl" placeholder="First Name" />
                </div>
              </FG>
              <FG label="Last Name" required>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                  <Input name="lastName" required value={formData.lastName} onChange={handleInputChange} className="pl-9 rounded-xl" placeholder="Last Name" />
                </div>
              </FG>
              <FG label="Birth Date" required>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                  <Input name="dateOfBirth" type="date" required value={formData.dateOfBirth} onChange={handleInputChange} className="pl-9 rounded-xl" />
                </div>
              </FG>
              <FG label="Gender" required>
                <select name="gender" required value={formData.gender} onChange={handleInputChange}
                  className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </FG>
              <FG label="Mobile Number" required>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                  <Input name="mobileNumber" type="tel" required value={formData.mobileNumber} onChange={handleInputChange} className="pl-9 rounded-xl" placeholder="Mobile Number" />
                </div>
              </FG>
              <FG label="Alternate Mobile">
                <div className="relative">
                  <PhoneCall className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                  <Input name="alternateMobileNumber" type="tel" value={formData.alternateMobileNumber ?? ''} onChange={handleInputChange} className="pl-9 rounded-xl" placeholder="Alternate Mobile" />
                </div>
              </FG>
              <FG label="Personal Email" required className="md:col-span-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                  <Input name="emailId" type="email" required value={formData.emailId} onChange={handleInputChange} className="pl-9 rounded-xl" placeholder="Email Address" />
                </div>
              </FG>
            </div>
          </CardContent>
        </Card>

        {/* Credentials & Employment Section */}
        <Card className="erp-card overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/10 py-5 px-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold tracking-tight">Security & Employment Details</CardTitle>
                <CardDescription className="text-xs font-medium opacity-70 mt-0.5">Professional records and system access credentials.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <FG label="Employee ID" required>
                <Input name="employeeId" required value={formData.employeeId} onChange={handleInputChange} className="rounded-xl" placeholder="Employee Code" />
              </FG>
              {!isEditMode && (
                <FG label="Joining Date" required>
                  <Input name="joiningDate" type="date" required={!isEditMode} value={formData.joiningDate} onChange={handleInputChange} className="rounded-xl" />
                </FG>
              )}
              <FG label="Professional Email" required>
                <Input name="employeeEmail" type="email" required value={formData.employeeEmail} onChange={handleInputChange} className="rounded-xl" placeholder="Professional Email" />
              </FG>
            </div>

            {!isEditMode && (
              <div className="border-t border-border/50 pt-6">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 block mb-4">System Credentials</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FG label="Username" required>
                    <Input name="username" required value={formData.username} onChange={handleInputChange} className="rounded-xl" placeholder="System Username" />
                  </FG>
                  <FG label="Password" required>
                    <Input name="password" type="password" required value={formData.password} onChange={handleInputChange} className="rounded-xl" placeholder="Access Password" />
                  </FG>
                </div>
              </div>
            )}

            <div className="border-t border-border/50 pt-6 mt-6">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 block mb-4">Institutional Roles</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: 'isPrincipal', label: 'Principal' },
                  { id: 'isCoordinator', label: 'Coordinator' },
                  { id: 'isClassTeacher', label: 'Class Teacher' },
                  { id: 'isSubjectTeacher', label: 'Subject Teacher' }
                ].map(role => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleCheckboxChange(role.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left",
                      (formData as any)[role.id] ? "bg-primary text-primary-foreground border-primary" : "bg-muted/30 border-border/50 hover:bg-muted/50"
                    )}
                  >
                    <span className="text-xs font-bold">{role.label}</span>
                    {(formData as any)[role.id] && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>



        {/* Coordinator Scope — conditional on isCoordinator */}
        <AnimatePresence>
          {formData.isCoordinator && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <Card className="erp-card overflow-hidden border-l-4 border-l-purple-500">
                <CardHeader className="border-b border-border/50 bg-purple-500/5 py-5 px-8">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                      <Compass className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold tracking-tight">Coordinator Scope</CardTitle>
                      <CardDescription className="text-xs font-medium opacity-70 mt-0.5">Select the classes this coordinator will manage.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 block mb-4">
                    Select Classes ({coordinatorClasses.length} selected)
                  </Label>
                  {classNames.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground/50 border-2 border-dashed rounded-2xl">
                      <p className="text-xs font-bold uppercase tracking-widest">No classes available. Create classes first.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {classNames.map((className) => {
                        const selected = coordinatorClasses.includes(className);
                        return (
                          <button
                            key={className}
                            type="button"
                            onClick={() => toggleCoordinatorClass(className)}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-xl border transition-all text-left",
                              selected
                                ? "bg-purple-500 text-white border-purple-500"
                                : "bg-muted/30 border-border/50 hover:bg-muted/50"
                            )}
                          >
                            <span className="text-xs font-bold">{className}</span>
                            {selected && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>



        {/* Academic Assignments */}
        {/* <Card className="erp-card overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/10 py-5 px-8 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold tracking-tight">Pedagogical mapping</CardTitle>
                <CardDescription className="text-xs font-medium opacity-70 mt-0.5">Classes and subjects assigned to this faculty.</CardDescription>
              </div>
            </div>
            <span className="text-[10px] font-bold px-3 py-1 bg-muted rounded-full text-muted-foreground uppercase tracking-widest border border-border/50">
              {formData.classes.length} Assignments
            </span>
          </CardHeader>
          <CardContent className="p-8">
            <div className="p-4 bg-muted/5 rounded-2xl border border-border/50 flex flex-wrap gap-4 items-end mb-6">
              <div className="flex-1 min-w-30">
                <FG label="Grade">
                  <select
                    value={newClass.classId ?? ''}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      const cs = classSections.find(c => c.classId === id);
                      setNewClass((p) => ({
                        ...p,
                        classId: id,
                        className: cs?.className ?? '',
                        sectionName: '',
                        classSectionId: undefined,
                        subjectName: '',
                        subjectId: undefined
                      }));
                    }}
                    className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select class</option>
                    {uniqueClassNames.map((name) => {
                      const cs = classSections.find(c => c.className === name);
                      return (
                        <option key={cs?.classId ?? name} value={cs?.classId}>
                          {name}
                        </option>
                      );
                    })}
                  </select>
                </FG>
              </div>
              <div className="flex-1 min-w-20">
                <FG label="Section">
                  <select
                    value={newClass.classSectionId ?? ''}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      const cs = classSections.find(c => c.masterSectionId === id);
                      setNewClass((p) => ({
                        ...p,
                        classSectionId: cs?.masterSectionId || cs?.id,
                        sectionName: cs?.sectionName ?? ''
                      }));
                    }}
                    className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    disabled={!newClass.classId}
                  >
                    <option value="">{newClass.classId ? 'Select section' : 'Select class first'}</option>
                    {classSections
                      .filter((cs: any) => cs.classId === newClass.classId)
                      .map((cs: any) => (
                        <option key={cs.masterSectionId} value={cs.masterSectionId}>{cs.sectionName}</option>
                      ))}
                  </select>
                </FG>
              </div>
              <div className="flex-2 min-w-37.5">
                <FG label="Subject">
                  <select
                    value={newClass.subjectId ?? ''}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      const s = subjectOptions.find(so => so.id === id);
                      setNewClass((p) => ({
                        ...p,
                        subjectId: id,
                        subjectName: s?.subjectName ?? ''
                      }));
                    }}
                    className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select subject</option>
                    {subjectOptions.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.subjectName}</option>
                    ))}
                  </select>
                </FG>
              </div>
              <Button type="button" onClick={addClass} className="h-10 w-10 p-0 rounded-xl">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AnimatePresence mode='popLayout'>
                {formData.classes.map((cls, idx) => (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                    key={idx}
                    className="flex items-center justify-between p-4 bg-background border border-border rounded-2xl group hover:border-primary/40 transition-all shadow-sm"
                  >
                    <div>
                      <p className="text-sm font-bold text-foreground">Grade {cls.className} — {cls.sectionName}</p>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">{cls.subjectName}</p>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeClass(idx)} className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10 transition-all">
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {formData.classes.length === 0 && (
                <div className="col-span-full py-12 border-2 border-dashed border-border/50 rounded-2xl flex flex-col items-center justify-center opacity-40 bg-muted/10">
                  <Link2 className="h-8 w-8 mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Awaiting Pedagogical Mapping</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card> */}

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="px-6 h-12 rounded-xl text-xs font-bold uppercase tracking-widest">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="px-10 h-12 rounded-xl text-xs font-bold uppercase tracking-widest shadow-sm">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Processing...' : (initialData ? 'Update Faculty' : 'Complete Registration')}
          </Button>
        </div>
      </form>
    </div>
  );
}