'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { teacherService } from '@/services/teacher.service';
import { Teacher, Address, TeacherClass, SchoolRecord } from '@/types/roles';
import { ArrowLeft, Save, Plus, Trash2, MapPin, BookOpen, User, Briefcase, Users, Image as ImageIcon, Mail, Phone, Calendar, ShieldCheck, ExternalLink, MoreHorizontal, GraduationCap as SchoolIcon, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeacherDetailsViewProps {
  teacherId: string;
  onBack: () => void;
}

export function TeacherDetailsView({ teacherId, onBack }: TeacherDetailsViewProps) {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    loadTeacher();
  }, [teacherId]);

  const loadTeacher = async () => {
    setLoading(true);
    try {
      const data = await teacherService.getTeacherById(teacherId);
      setTeacher(data);
    } catch (error) {
      console.error('Error loading teacher details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDetails = async (data: any) => {
    try {
      await teacherService.updateTeacherDetails(teacherId, data);
      loadTeacher();
      alert('Profile synchronized successfully');
    } catch (error) {
      console.error('Error updating details:', error);
    }
  };

  if (loading) {
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
      {/* Header Profile Section */}
      <Card className="erp-card overflow-hidden">
        <div className="relative p-6 sm:p-8 bg-card flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
          <div className="shrink-0 relative">
            <div className="h-28 w-28 rounded-2xl bg-muted/10 flex items-center justify-center overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border border-border/50">
              {teacher.profileImageUrl ? (
                <img src={teacher.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="text-primary/60 font-black text-3xl uppercase tracking-tighter">
                  {teacher.firstName.charAt(0)}{teacher.lastName.charAt(0)}
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-2 border-card shadow-sm flex items-center justify-center" title="Active Account">
               <ShieldCheck className="h-3 w-3 text-white" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-1.5">
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-1.5">
              <span className="bg-muted/30 text-muted-foreground px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border border-border/40">
                {teacher.employeeId}
              </span>
              <span className="bg-green-500/10 text-green-600 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border border-green-500/20">
                {teacher.status || 'Active'}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{teacher.firstName} {teacher.lastName}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-x-5 gap-y-1.5 text-muted-foreground/70 mt-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <Mail className="h-3.5 w-3.5 opacity-40 text-primary" />
                {teacher.employeeEmail}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <Briefcase className="h-3.5 w-3.5 opacity-40 text-primary" />
                {teacher.isPrincipal ? 'Principal Seat' : 'Academic Faculty'}
              </div>
            </div>
          </div>

          <div className="flex gap-2.5">
            <Button variant="secondary" size="icon" onClick={onBack} className="rounded-xl h-10 w-10 shadow-sm border border-border/50 bg-background/50 hover:bg-background" title="Back to Directory">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button variant="secondary" className="rounded-xl h-10 px-5 shadow-sm text-xs font-bold border border-border/50 bg-background/50 hover:bg-background">
               Manage Roles
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="erp-card overflow-hidden">
            <CardHeader className="bg-muted/10 border-b border-border/50 pb-4">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary/70">Inception Metrics</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6 px-6">
               <div className="space-y-1.5">
                 <div className="text-[10px] font-black text-muted-foreground/60 uppercase flex items-center gap-1.5 tracking-wider">
                   <Calendar className="h-3 w-3 opacity-60" />
                   Onboarding Date
                 </div>
                 <div className="text-sm font-bold text-foreground/80">{new Date(teacher.joiningDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</div>
               </div>
               <div className="space-y-1.5">
                 <div className="text-[10px] font-black text-muted-foreground/60 uppercase flex items-center gap-1.5 tracking-wider">
                   <Activity className="h-3 w-3 opacity-60" />
                   Session Load
                 </div>
                 <div className="text-sm font-bold text-foreground/80">{teacher.classes?.length || 0} Dynamic Assignments</div>
               </div>
               <div className="space-y-1.5">
                 <div className="text-[10px] font-black text-muted-foreground/60 uppercase flex items-center gap-1.5 tracking-wider">
                   <Users className="h-3 w-3 opacity-60" />
                   Gender Attribute
                 </div>
                 <div className="text-sm font-bold text-foreground/80">{teacher.gender}</div>
               </div>
            </CardContent>
          </Card>

          <Card className="erp-card overflow-hidden bg-primary/5">
             <CardHeader className="pb-3 px-6">
               <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary/70">Quick Actions</CardTitle>
             </CardHeader>
             <CardContent className="space-y-2 px-6 pb-6">
                <Button variant="secondary" className="w-full justify-start text-[11px] font-bold h-10 rounded-xl bg-background/60 border-border/30 hover:bg-background shadow-sm">
                  <ImageIcon className="h-4 w-4 mr-2.5 text-primary/60" />
                  Update Credentials
                </Button>
                <Button variant="secondary" className="w-full justify-start text-[11px] font-bold h-10 rounded-xl bg-background/60 border-border/30 hover:bg-background shadow-sm">
                  <ExternalLink className="h-4 w-4 mr-2.5 text-primary/60" />
                  Export Portfolio
                </Button>
             </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-x-auto pb-4 custom-scrollbar">
              <TabsList className="flex w-max min-w-full gap-2 bg-muted/20 p-1.5 rounded-2xl border border-border/50">
                {[
                  { id: 'personal', label: 'Identity' },
                  { id: 'classes', label: 'Pedagogy' },
                  { id: 'addresses', label: 'Geography' },
                  { id: 'academic', label: 'Scholastics' },
                  { id: 'professional', label: 'Career' },
                  { id: 'family', label: 'Kinship' }
                ].map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id} className="rounded-xl px-6 py-2.5 text-[10px] font-black tracking-widest uppercase data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="mt-6 transition-all">
              <TabsContent value="personal" className="mt-0">
                <DetailsFormSection 
                  title="Profile Identity" 
                  description="Detailed identity markers and secure record management."
                  data={teacher.teacherPersonalData || {}} 
                  onSave={handleUpdateDetails} 
                />
              </TabsContent>

              <TabsContent value="classes" className="mt-0">
                <ClassesSection teacherId={teacherId} initialClasses={teacher.classes || []} />
              </TabsContent>

              <TabsContent value="addresses" className="mt-0">
                <AddressSection teacherId={teacherId} initialAddresses={teacher.addresses || []} />
              </TabsContent>

              <TabsContent value="academic" className="mt-0">
                <DetailsFormSection 
                  title="Academic Credentials" 
                  description="Scholastic history and verified educational certifications."
                  data={teacher.teacherAcademicData || {}} 
                  onSave={handleUpdateDetails} 
                />
              </TabsContent>

              <TabsContent value="professional" className="mt-0">
                <DetailsFormSection 
                  title="Career Documentation" 
                  description="Employment milestones and professional affiliations."
                  data={teacher.teacherProfessionalData || {}} 
                  onSave={handleUpdateDetails} 
                />
              </TabsContent>

              <TabsContent value="family" className="mt-0">
                <DetailsFormSection 
                  title="Kinship Information" 
                  description="Validated family records and emergency contact matrix."
                  data={teacher.teacherFamilyDetails || {}} 
                  onSave={handleUpdateDetails} 
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function DetailsFormSection({ title, description, data, onSave }: { title: string, description: string, data: any, onSave: (d: any) => void }) {
  const [localData, setLocalData] = useState(data);

  return (
    <Card className="erp-card overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-6 px-8">
        <div>
          <CardTitle className="text-xl font-bold tracking-tight">{title}</CardTitle>
          <CardDescription className="text-xs font-medium opacity-70 mt-1">{description}</CardDescription>
        </div>
        <Button onClick={() => onSave(localData)} className="rounded-xl h-10 px-6 font-bold shadow-sm text-xs">
          <Save className="mr-2 h-4 w-4" />
          Synchronize
        </Button>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-muted/20 text-foreground/80 font-mono text-[11px] border border-border/50 relative group overflow-hidden shadow-inner">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
               <ShieldCheck className="h-32 w-32" />
            </div>
            <textarea 
              className="min-h-[300px] w-full bg-transparent border-none focus:ring-0 resize-none leading-relaxed tracking-wide custom-scrollbar selection:bg-primary/20"
              spellCheck={false}
              value={JSON.stringify(localData, null, 2)}
              onChange={(e) => {
                try {
                  setLocalData(JSON.parse(e.target.value));
                } catch (err) {}
              }}
            />
          </div>
          <div className="flex items-center gap-2 p-4 rounded-xl bg-muted/30 border border-border/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
            <Activity className="h-4 w-4 shrink-0 opacity-50" />
            Direct database serialization interface. Data structure validation enforced upon synchronization.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AddressSection({ teacherId, initialAddresses }: { teacherId: string, initialAddresses: Address[] }) {
  const [addresses, setAddresses] = useState(initialAddresses);

  const handleDelete = async (id: number) => {
    if (!confirm('Permanent deletion of this geographic record?')) return;
    try {
      await teacherService.deleteAddress(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (error) { console.error(error); }
  };

  return (
    <Card className="erp-card overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-6 px-8">
        <div>
          <CardTitle className="text-xl font-bold tracking-tight">Geographic Hub</CardTitle>
          <CardDescription className="text-xs font-medium opacity-70 mt-1">Verified physical residency and transit records.</CardDescription>
        </div>
        <Button variant="secondary" size="sm" className="rounded-xl h-10 px-6 font-bold border border-border/50 bg-background/50 hover:bg-background text-xs shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          Register Address
        </Button>
      </CardHeader>
      <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map(addr => (
          <div key={addr.id} className="relative p-6 rounded-2xl bg-muted/5 border border-border/50 group hover:border-primary/40 hover:bg-background transition-all">
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary/70 shrink-0 group-hover:scale-110 transition-transform">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-foreground/80">{addr.city}, {addr.state}</h4>
                  {addr.isPermanent && (
                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[8px] font-black tracking-widest uppercase border border-primary/20">
                      Permanent
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground/80 font-medium leading-relaxed">{addr.address}</p>
                <div className="flex items-center gap-4 pt-2">
                   <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-wider">{addr.country}</span>
                   <span className="text-[10px] font-black text-primary/40 tracking-widest">{addr.pincode}</span>
                </div>
              </div>
            </div>
            <Button size="icon" variant="ghost" className="absolute top-4 right-4 h-8 w-8 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5 opacity-0 group-hover:opacity-100 transition-all rounded-lg" onClick={() => handleDelete(addr.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {addresses.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground/40 bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p className="text-[10px] font-bold uppercase tracking-widest">No geographic associations detected.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ClassesSection({ teacherId, initialClasses }: { teacherId: string, initialClasses: TeacherClass[] }) {
  const [classes, setClasses] = useState(initialClasses);

  const handleDelete = async (id: number) => {
    if (!id || !confirm('Dissociate pedagogical assignment?')) return;
    try {
      await teacherService.deleteClass(id);
      setClasses(prev => prev.filter(c => c.id !== id));
    } catch (error) { console.error(error); }
  };

  return (
    <Card className="erp-card overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-6 px-8">
        <div>
          <CardTitle className="text-xl font-bold tracking-tight">Pedagogical Portfolio</CardTitle>
          <CardDescription className="text-xs font-medium opacity-70 mt-1">Institutional academic load and instructional assignments.</CardDescription>
        </div>
        <Button variant="secondary" size="sm" className="rounded-xl h-10 px-6 font-bold border border-border/50 bg-background/50 hover:bg-background text-xs shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          Append Assignment
        </Button>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map(cls => (
            <div key={cls.id} className="p-5 rounded-2xl bg-muted/5 border border-border/50 group hover:border-primary/40 hover:bg-background transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600/70 group-hover:scale-110 transition-transform">
                  <BookOpen className="h-5 w-5" />
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5 opacity-0 group-hover:opacity-100 transition-all rounded-lg" onClick={() => cls.id && handleDelete(cls.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <h4 className="font-bold text-foreground/80">{cls.className} - {cls.sectionName}</h4>
                <p className="text-[10px] font-black text-primary/70 uppercase tracking-widest mt-1.5">{cls.subjectName}</p>
                <div className="mt-5 pt-4 border-t border-border/50 flex items-center justify-between">
                   <div className="flex -space-x-2">
                     {[1,2,3].map(i => <div key={i} className="h-6 w-6 rounded-full border border-background bg-muted/30" />)}
                   </div>
                   <span className="text-[9px] font-black text-muted-foreground/40 tracking-tighter">ACT-0{cls.id}</span>
                </div>
              </div>
            </div>
          ))}
          {classes.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground/40 bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-[10px] font-bold uppercase tracking-widest">No pedagogical records established.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
