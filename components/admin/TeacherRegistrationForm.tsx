'use client';

import React, { useState } from 'react';
import {
  ArrowLeft, Save, UserPlus, FileText,
  Briefcase, BookOpen, X, MapPin, 
  ShieldCheck, Globe, Calendar, Mail, Phone,
  CheckCircle2, Plus, Users, User, PhoneCall, Link2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { teacherService } from '@/services/teacher.service';
import { TeacherRegistrationData, TeacherClass } from '@/types/roles';
import { useAuthStore } from '@/store/authStore';
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

  const [formData, setFormData] = useState<TeacherRegistrationData>(() => ({
    username: initialData?.username ?? '',
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
    joiningDate: initialData?.schoolRecords?.[0]?.joiningDate
      ? new Date(initialData.schoolRecords[0].joiningDate).toISOString().slice(0, 10)
      : '',
    employeeEmail: initialData?.employeeEmail ?? initialData?.schoolRecords?.[0]?.employeeEmail ?? '',
    classes: initialData?.classes ?? [],
  }));

  const [newClass, setNewClass] = useState<TeacherClass>({
    className: '',
    sectionName: '',
    subjectName: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string) => {
    setFormData(prev => ({ ...prev, [name]: !(prev as any)[name] }));
  };

  const addClass = () => {
    if (newClass.className && newClass.sectionName && newClass.subjectName) {
      setFormData(prev => ({
        ...prev,
        classes: [...prev.classes, { ...newClass }]
      }));
      setNewClass({ className: '', sectionName: '', subjectName: '' });
    }
  };

  const removeClass = (index: number) => {
    setFormData(prev => ({
      ...prev,
      classes: prev.classes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditMode) {
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
        });
        toast.success('Teacher profile updated successfully');
      } else {
        await teacherService.registerTeacher(formData);
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
              <FG label="School ID" required>
                <Input name="schoolId" required value={formData.schoolId} onChange={handleInputChange} className="rounded-xl" placeholder="School UUID" />
              </FG>
              <FG label="Employee ID" required>
                <Input name="employeeId" required value={formData.employeeId} onChange={handleInputChange} className="rounded-xl" placeholder="Employee Code" />
              </FG>
              <FG label="Joining Date" required>
                <Input name="joiningDate" type="date" required value={formData.joiningDate} onChange={handleInputChange} className="rounded-xl" />
              </FG>
              <FG label="Professional Email" required>
                <Input name="employeeEmail" type="email" required value={formData.employeeEmail} onChange={handleInputChange} className="rounded-xl" placeholder="Professional Email" />
              </FG>
            </div>

            <div className="border-t border-border/50 pt-6">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 block mb-4">System Credentials</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FG label="Username" required>
                    <Input name="username" required value={formData.username} onChange={handleInputChange} className="rounded-xl" placeholder="System Username" />
                 </FG>
                 {!initialData && (
                    <FG label="Password" required>
                       <Input name="password" type="password" required value={formData.password} onChange={handleInputChange} className="rounded-xl" placeholder="Access Password" />
                    </FG>
                 )}
              </div>
            </div>

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

        {/* Academic Assignments */}
        <Card className="erp-card overflow-hidden">
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
              <div className="flex-1 min-w-[120px]">
                <FG label="Grade">
                  <Input placeholder="Grade (e.g. 10)" value={newClass.className} onChange={e => setNewClass({ ...newClass, className: e.target.value })} className="rounded-xl" />
                </FG>
              </div>
              <div className="flex-1 min-w-[80px]">
                <FG label="Section">
                  <Input placeholder="Section (e.g. A)" value={newClass.sectionName} onChange={e => setNewClass({ ...newClass, sectionName: e.target.value })} className="rounded-xl" />
                </FG>
              </div>
              <div className="flex-[2] min-w-[150px]">
                <FG label="Subject">
                  <Input placeholder="Subject" value={newClass.subjectName} onChange={e => setNewClass({ ...newClass, subjectName: e.target.value })} className="rounded-xl" />
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
        </Card>

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