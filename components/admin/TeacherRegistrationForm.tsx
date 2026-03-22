'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, ArrowLeft, Save, Sparkles, UserPlus, Fingerprint, Briefcase, GraduationCap as SchoolIcon, X } from 'lucide-react';
import { teacherService } from '@/services/teacher.service';
import { TeacherRegistrationData, TeacherClass } from '@/types/roles';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

interface TeacherRegistrationFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export function TeacherRegistrationForm({ onCancel, onSuccess, initialData }: TeacherRegistrationFormProps) {
  const { schoolId } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TeacherRegistrationData>({
    username: '',
    password: '',
    schoolId: schoolId || '',
    employeeId: '',
    isPrincipal: false,
    isCoordinator: false,
    isClassTeacher: false,
    isSubjectTeacher: false,
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    mobileNumber: '',
    alternateMobileNumber: '',
    emailId: '',
    joiningDate: '',
    employeeEmail: '',
    classes: [],
  });

  const [newClass, setNewClass] = useState<TeacherClass>({
    className: '',
    sectionName: '',
    subjectName: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
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
      await teacherService.registerTeacher(formData);
      onSuccess();
    } catch (error) {
      console.error('Error registering teacher:', error);
      alert('Failed to register teacher. Please check the network and server status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
              {initialData ? 'Update Profile' : 'Onboard Faculty'}
            </h2>
            <p className="text-muted-foreground">Comprehensive registration for academic staff members.</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full border border-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-primary tracking-wide">SMART FORM</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Details Section */}
            <Card className="border-none shadow-card overflow-hidden">
              <CardHeader className="bg-muted/30 border-b">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-primary" />
                  <CardTitle className="text-lg">Personal Attributes</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">First Name</Label>
                  <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required placeholder="e.g. Jean" className="bg-muted/20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Last Name</Label>
                  <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required placeholder="e.g. Grey" className="bg-muted/20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date of Birth</Label>
                  <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleInputChange} required className="bg-muted/20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gender Identity</Label>
                  <Select 
                    value={formData.gender} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, gender: v }))}
                  >
                    <SelectTrigger className="bg-muted/20">
                      <SelectValue placeholder="Select Gender" />
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </SelectTrigger>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Account & Contact Section */}
            <Card className="border-none shadow-card overflow-hidden">
              <CardHeader className="bg-muted/30 border-b">
                <div className="flex items-center gap-2">
                  <Fingerprint className="h-4 w-4 text-primary" />
                  <CardTitle className="text-lg">Account & Contact</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">System Username</Label>
                  <Input id="username" name="username" value={formData.username} onChange={handleInputChange} required placeholder="j.grey" className="bg-muted/20" />
                </div>
                {!initialData && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Security Password</Label>
                    <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} required className="bg-muted/20" />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="emailId" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Personal Email</Label>
                  <Input id="emailId" name="emailId" type="email" value={formData.emailId} onChange={handleInputChange} required placeholder="jean@example.com" className="bg-muted/20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Primary Mobile</Label>
                  <Input id="mobileNumber" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} required placeholder="+1 234 567 890" className="bg-muted/20" />
                </div>
              </CardContent>
            </Card>

            {/* Assignments Section */}
            <Card className="border-none shadow-card overflow-hidden">
              <CardHeader className="bg-muted/30 border-b">
                <div className="flex items-center gap-2">
                  <SchoolIcon className="h-4 w-4 text-primary" />
                  <CardTitle className="text-lg">Assignments & Pedagogy</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10 items-end">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Class Level</Label>
                    <Input placeholder="Grade 10" value={newClass.className} onChange={e => setNewClass({...newClass, className: e.target.value})} className="h-9" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Section</Label>
                    <Input placeholder="Section A" value={newClass.sectionName} onChange={e => setNewClass({...newClass, sectionName: e.target.value})} className="h-9" />
                  </div>
                  <div className="flex gap-2">
                    <div className="space-y-2 flex-1">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Expertise</Label>
                      <Input placeholder="Mathematics" value={newClass.subjectName} onChange={e => setNewClass({...newClass, subjectName: e.target.value})} className="h-9" />
                    </div>
                    <Button type="button" size="icon" onClick={addClass} className="h-9 w-9 shrink-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {formData.classes.length === 0 ? (
                    <div className="col-span-full py-8 border-2 border-dashed rounded-xl flex items-center justify-center text-muted-foreground text-sm italic">
                      No pedagogical assignments linked
                    </div>
                  ) : (
                    formData.classes.map((cls, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-background border rounded-lg shadow-sm group hover:border-primary/50 transition-colors">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground">{cls.className} - {cls.sectionName}</span>
                          <span className="text-[10px] font-semibold text-primary uppercase">{cls.subjectName}</span>
                        </div>
                        <Button type="button" size="icon" variant="ghost" onClick={() => removeClass(idx)} className="h-7 w-7 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-full">
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            {/* Professional Background Section */}
            <Card className="border-none shadow-card overflow-hidden">
              <CardHeader className="bg-muted/30 border-b">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <CardTitle className="text-lg">Employment</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="employeeId" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Corporate ID</Label>
                  <Input id="employeeId" name="employeeId" value={formData.employeeId} onChange={handleInputChange} required placeholder="EMP-001" className="bg-muted/20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeEmail" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Professional Email</Label>
                  <Input id="employeeEmail" name="employeeEmail" type="email" value={formData.employeeEmail} onChange={handleInputChange} required placeholder="j.grey@school.edu" className="bg-muted/20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="joiningDate" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Inception Date</Label>
                  <Input id="joiningDate" name="joiningDate" type="date" value={formData.joiningDate} onChange={handleInputChange} required className="bg-muted/20" />
                </div>

                <div className="pt-4 space-y-4 border-t">
                  <Label className="text-xs font-bold uppercase tracking-wider text-primary">Organizational Role</Label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: 'isPrincipal', label: 'Principal Seat' },
                      { id: 'isCoordinator', label: 'Curriculum Coordinator' },
                      { id: 'isClassTeacher', label: 'Pastoral Care / Class Teacher' },
                      { id: 'isSubjectTeacher', label: 'Instructional Faculty' }
                    ].map(role => (
                      <div key={role.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <Checkbox 
                          id={role.id} 
                          checked={(formData as any)[role.id]} 
                          onCheckedChange={(c: boolean) => handleCheckboxChange(role.id, !!c)} 
                        />
                        <Label htmlFor={role.id} className="text-sm cursor-pointer font-medium">{role.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="pt-4 flex flex-col gap-3">
              <Button type="submit" variant="premium" className="w-full py-6 group" disabled={loading}>
                {loading ? 'Processing Transaction...' : (
                  <>
                    <Save className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    {initialData ? 'Synchronize Record' : 'Commit Registration'}
                  </>
                )}
              </Button>
              <Button type="button" variant="ghost" onClick={onCancel} className="w-full hover:bg-red-50 hover:text-red-500 transition-colors">
                Abort Changes
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
