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
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Header Profile Section */}
      <div className="relative group overflow-hidden rounded-3xl p-8 bg-linear-to-br from-indigo-900 via-slate-900 to-black text-white shadow-card">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
           <SchoolIcon className="h-48 w-48 -rotate-12 translate-x-12 translate-y--12" />
        </div>
        
        <div className="relative flex flex-col md:flex-row items-center md:items-end gap-8">
          <div className="shrink-0 relative">
            <div className="h-32 w-32 rounded-3xl bg-white/10 backdrop-blur-xl border-2 border-white/20 flex items-center justify-center overflow-hidden shadow-2xl relative group-hover:scale-105 transition-transform">
              {teacher.profileImageUrl ? (
                <img src={teacher.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="h-16 w-16 text-white/50" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-emerald-500 border-4 border-slate-900 flex items-center justify-center shadow-lg" title="Active Account">
               <ShieldCheck className="h-4 w-4 text-white" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-2">
              <Badge variant="outline" className="bg-white/5 border-white/20 text-white/90 text-[10px] font-bold tracking-widest uppercase">
                {teacher.employeeId}
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-bold tracking-widest uppercase">
                {teacher.status || 'Active'}
              </Badge>
            </div>
            <h1 className="text-4xl font-black tracking-tight">{teacher.firstName} {teacher.lastName}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-white/60">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{teacher.employeeEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span className="text-sm">{teacher.isPrincipal ? 'Principal Seat' : 'Academic Faculty'}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" size="icon" onClick={onBack} className="rounded-2xl h-12 w-12 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white border-none shadow-none">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Button variant="premium" className="rounded-2xl h-12 px-6 shadow-xl">
               Manage Roles
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-card bg-muted/30 overflow-hidden">
            <CardHeader className="bg-background/50 border-b">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary">Inception Metrics</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
               <div className="space-y-1">
                 <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                   <Calendar className="h-3 w-3" />
                   Onboarding Date
                 </div>
                 <div className="text-sm font-semibold">{new Date(teacher.joiningDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</div>
               </div>
               <div className="space-y-1">
                 <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                   <Activity className="h-3 w-3" />
                   Session Load
                 </div>
                 <div className="text-sm font-semibold">{teacher.classes?.length || 0} Dynamic Assignments</div>
               </div>
               <div className="space-y-1">
                 <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                   <Users className="h-3 w-3" />
                   Gender Attribute
                 </div>
                 <div className="text-sm font-semibold">{teacher.gender}</div>
               </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-card bg-linear-to-br from-primary/5 to-transparent">
             <CardHeader>
               <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary">Quick Actions</CardTitle>
             </CardHeader>
             <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-xs font-bold h-10 border-none bg-background/50 hover:bg-background">
                  <ImageIcon className="h-4 w-4 mr-2 text-primary" />
                  Update Credentials
                </Button>
                <Button variant="outline" className="w-full justify-start text-xs font-bold h-10 border-none bg-background/50 hover:bg-background">
                  <ExternalLink className="h-4 w-4 mr-2 text-primary" />
                  Export Portfolio
                </Button>
             </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-x-auto pb-4 custom-scrollbar">
              <TabsList className="flex w-max min-w-full gap-2 bg-muted/50 p-1.5 rounded-2xl border border-border/50">
                {[
                  { id: 'personal', label: 'Identity' },
                  { id: 'classes', label: 'Pedagogy' },
                  { id: 'addresses', label: 'Geography' },
                  { id: 'academic', label: 'Scholastics' },
                  { id: 'professional', label: 'Career' },
                  { id: 'family', label: 'Kinship' }
                ].map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id} className="rounded-xl px-6 py-2.5 text-xs font-bold tracking-tight uppercase">
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="mt-8 transition-all">
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
    <Card className="border-none shadow-card overflow-hidden">
      <CardHeader className="border-b bg-muted/5 flex flex-row items-center justify-between py-6">
        <div>
          <CardTitle className="text-2xl font-black tracking-tight">{title}</CardTitle>
          <CardDescription className="text-sm mt-1">{description}</CardDescription>
        </div>
        <Button variant="premium" onClick={() => onSave(localData)} className="rounded-xl h-10 px-6 font-bold shadow-lg">
          <Save className="mr-2 h-4 w-4" />
          Synchronize
        </Button>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs shadow-inner border border-slate-800 relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
               <ShieldCheck className="h-32 w-32" />
            </div>
            <textarea 
              className="min-h-[300px] w-full bg-transparent border-none focus:ring-0 resize-none leading-relaxed tracking-wider custom-scrollbar selection:bg-emerald-500/30 selection:text-emerald-200"
              spellCheck={false}
              value={JSON.stringify(localData, null, 2)}
              onChange={(e) => {
                try {
                  setLocalData(JSON.parse(e.target.value));
                } catch (err) {}
              }}
            />
          </div>
          <div className="flex items-center gap-2 p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs font-semibold text-primary/80">
            <Activity className="h-4 w-4 shrink-0" />
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
    <Card className="border-none shadow-card overflow-hidden">
      <CardHeader className="border-b bg-muted/5 flex flex-row items-center justify-between py-6">
        <div>
          <CardTitle className="text-2xl font-black tracking-tight">Geographic Hub</CardTitle>
          <CardDescription className="text-sm mt-1">Verified physical residency and transit records.</CardDescription>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl h-10 px-6 font-bold border-2 hover:bg-muted transition-all">
          <Plus className="mr-2 h-4 w-4" />
          Register Address
        </Button>
      </CardHeader>
      <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map(addr => (
          <div key={addr.id} className="relative p-6 rounded-2xl bg-background border-2 border-border/50 group hover:border-primary/50 hover:shadow-xl transition-all">
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-foreground">{addr.city}, {addr.state}</h4>
                  {addr.isPermanent && <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black tracking-widest uppercase">Permanent</Badge>}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{addr.address}</p>
                <div className="flex items-center gap-4 pt-2">
                   <span className="text-[10px] font-bold text-muted-foreground uppercase">{addr.country}</span>
                   <span className="text-[10px] font-black text-primary opacity-50 tracking-widest">{addr.pincode}</span>
                </div>
              </div>
            </div>
            <Button size="icon" variant="ghost" className="absolute top-4 right-4 h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(addr.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {addresses.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-2xl border-2 border-dashed">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm font-medium">No geographic associations detected.</p>
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
    <Card className="border-none shadow-card overflow-hidden">
      <CardHeader className="border-b bg-muted/5 flex flex-row items-center justify-between py-6">
        <div>
          <CardTitle className="text-2xl font-black tracking-tight">Pedagogical Portfolio</CardTitle>
          <CardDescription className="text-sm mt-1">Institutional academic load and instructional assignments.</CardDescription>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl h-10 px-6 font-bold border-2 hover:bg-muted transition-all">
          <Plus className="mr-2 h-4 w-4" />
          Append Assignment
        </Button>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map(cls => (
            <div key={cls.id} className="p-5 rounded-2xl bg-linear-to-br from-white to-slate-50 border-2 border-border/50 group hover:border-primary/50 hover:bg-white hover:shadow-xl transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                  <BookOpen className="h-5 w-5" />
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => cls.id && handleDelete(cls.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <h4 className="font-extrabold text-foreground">{cls.className} - {cls.sectionName}</h4>
                <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1 opacity-70">{cls.subjectName}</p>
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                   <div className="flex -space-x-2">
                     {[1,2,3].map(i => <div key={i} className="h-6 w-6 rounded-full border-2 border-white bg-muted" />)}
                   </div>
                   <span className="text-[10px] font-bold text-muted-foreground">ACT-0{cls.id}</span>
                </div>
              </div>
            </div>
          ))}
          {classes.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-2xl border-2 border-dashed">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm font-medium">No pedagogical records established.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
