'use client';

import React, { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Camera, Trash2, User, RefreshCw, Phone, Calendar, BookOpen, Heart, MapPin, ShieldCheck, PowerOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useStudent, useUpdateStudentStatus, useUploadStudentImage, useDeleteStudentImage } from '@/hooks/useStudents';
import { PersonalTab } from '@/components/admin/student/tabs/PersonalTab';
import { AcademicTab } from '@/components/admin/student/tabs/AcademicTab';
import { ParentsTab } from '@/components/admin/student/tabs/ParentsTab';
import { MedicalTab } from '@/components/admin/student/tabs/MedicalTab';
import { AddressTab } from '@/components/admin/student/tabs/AddressTab';

const AcademicAnalysis = dynamic(() => import('@/components/admin/student/AcademicAnalysis'), { ssr: false });

function ParentsIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ProfileImageSection({ studentId, profileImageUrl }: { studentId: string; profileImageUrl?: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadStudentImage(studentId);
  const deleteMutation = useDeleteStudentImage(studentId);

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
      onSuccess: () => toast.success('Profile image removed'),
      onError: () => toast.error('Delete failed.'),
    });
  };

  const busy = uploadMutation.isPending || deleteMutation.isPending;

  return (
    <div className="shrink-0  relative group cursor-pointer">
      <div className="h-28 w-28 rounded-2xl bg-muted/10 flex items-center justify-center overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border border-border/50">
        {profileImageUrl ? (
          <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <div className="text-primary/60 font-bold text-3xl uppercase tracking-tighter">
            {/* Placeholder initials */}
          </div>
        )}
        <div className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
          <button type="button" onClick={() => fileRef.current?.click()}
            className="text-white text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 hover:text-blue-300 transition-colors">
            <Camera className="h-3 w-3" />
            {busy ? 'Uploading…' : 'Upload'}
          </button>
          {profileImageUrl && (
            <button type="button" onClick={handleDelete}
              className="text-red-300 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 hover:text-red-200 transition-colors">
              <Trash2 className="h-3 w-3" />Remove
            </button>
          )}
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 border-2 border-card shadow-sm flex items-center justify-center">
        <ShieldCheck className="h-3 w-3 text-white" />
      </div>
    </div>
  );
}

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  const { data: student, isLoading, isFetching, refetch } = useStudent(studentId);
  const statusMutation = useUpdateStudentStatus(studentId);
  const [activeTab, setActiveTab] = useState('personal');

  const toggleStatus = () => {
    const next = student?.status === 'Active' ? 'Inactive' : 'Active';
    statusMutation.mutate(next, {
      onSuccess: () => toast.success(`Student marked as ${next}`),
      onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update status'),
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4 animate-pulse">
        <div className="h-24 w-24 rounded-full bg-muted" />
        <div className="h-8 bg-muted rounded w-48" />
        <div className="h-4 bg-muted rounded w-64" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-border/50">
        <User className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <h3 className="text-xl font-bold">Student Not Found</h3>
        <p className="text-muted-foreground mt-2">The record may have been relocated or deleted.</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-6 rounded-xl">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Directory
        </Button>
      </div>
    );
  }

  const tabs = [
    { id: 'personal', label: 'Personal', icon: <User size={13} /> },
    { id: 'academic', label: 'Academic', icon: <BookOpen size={13} /> },
    { id: 'analysis', label: 'Analysis', icon: <BookOpen size={13} /> },
    { id: 'parents', label: 'Parents', icon: <ParentsIcon size={13} /> },
    { id: 'medical', label: 'Medical', icon: <Heart size={13} /> },
    { id: 'address', label: 'Address', icon: <MapPin size={13} /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 animate-in fade-in duration-500">
      {/* Header / Profile Card */}
      <Card className="overflow-hidden border-border shadow-sm">
        <div className="relative p-6 sm:p-8 bg-card flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
          <ProfileImageSection studentId={studentId} profileImageUrl={student.profileImageUrl} />
          <div className="flex-1 text-center md:text-left space-y-1.5">
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-1.5">
              <span className="bg-muted/30 text-muted-foreground px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border border-border/40">
                {student.academics?.[0]?.rollNumber || student.id.slice(-6).toUpperCase()}
              </span>
              <span className={cn(
                'px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border',
                student.status === 'Active'
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : 'bg-red-500/10 text-red-600 border-red-500/20'
              )}>
                {student.status}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {student.firstName} {student.lastName}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-x-5 gap-y-1.5 text-muted-foreground/70 mt-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <Phone className="h-3.5 w-3.5 opacity-40 text-primary" />
                {student.mobileNumber}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <User className="h-3.5 w-3.5 opacity-40 text-primary" />
                {student.gender || '—'}
              </div>
              {student.dateOfBirth && (
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <Calendar className="h-3.5 w-3.5 opacity-40 text-primary" />
                  {new Date(student.dateOfBirth).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </div>
              )}
            </div>
            {student.academics?.[0] && (
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                  Class {student.academics[0].className} - {student.academics[0].sectionName}
                </Badge>
              </div>
            )}
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleStatus}
              disabled={statusMutation.isPending}
              className={cn(
                'rounded-xl h-10 px-4 shadow-sm border font-bold text-[11px] uppercase tracking-widest flex items-center gap-2 transition-all',
                student.status === 'Active'
                  ? 'border-red-200 text-red-600 hover:bg-red-50 bg-background/50'
                  : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 bg-background/50'
              )}
              title={student.status === 'Active' ? 'Deactivate student' : 'Activate student'}
            >
              <PowerOff className="h-3.5 w-3.5" />
              {statusMutation.isPending
                ? 'Updating…'
                : student.status === 'Active' ? 'Deactivate' : 'Activate'}
            </Button>
            <Button variant="secondary" size="icon" onClick={() => refetch()}
              className="rounded-xl h-10 w-10 shadow-sm border border-border/50 bg-background/50 hover:bg-background"
              title="Refresh">
              <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
            </Button>
            <Button variant="secondary" size="icon" onClick={() => router.back()}
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
            {tabs.map(tab => (
              <TabsTrigger key={tab.id} value={tab.id}
                className="rounded-xl px-6 py-2.5 text-[10px] font-bold tracking-widest uppercase gap-1.5 flex items-center data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
                {tab.icon}{tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <div className="mt-6">
          <TabsContent value="personal" className="mt-0">
            <Card className="overflow-hidden border-border shadow-sm rounded-4xl">
              <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-6 px-8">
                <div>
                  <CardTitle className="text-xl font-bold tracking-tight">Personal Information</CardTitle>
                  <CardDescription className="text-xs font-medium opacity-70 mt-1">Core identity and contact details.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <PersonalTab studentId={studentId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="academic" className="mt-0">
            <Card className="overflow-hidden border-border shadow-sm rounded-4xl">
              <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-6 px-8">
                <div>
                  <CardTitle className="text-xl font-bold tracking-tight">Academic Records</CardTitle>
                  <CardDescription className="text-xs font-medium opacity-70 mt-1">Class assignments and academic history.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <AcademicTab studentId={studentId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="mt-0">
            <Card className="overflow-hidden border-border shadow-sm rounded-4xl">
              <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-6 px-8">
                <div>
                  <CardTitle className="text-xl font-bold tracking-tight">Academic Analysis</CardTitle>
                  <CardDescription className="text-xs font-medium opacity-70 mt-1">Performance trends and subject analysis.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <AcademicAnalysis studentId={studentId} student={student} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parents" className="mt-0">
            <Card className="overflow-hidden border-border shadow-sm rounded-4xl">
              <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-6 px-8">
                <div>
                  <CardTitle className="text-xl font-bold tracking-tight">Parent / Guardian Records</CardTitle>
                  <CardDescription className="text-xs font-medium opacity-70 mt-1">Family and emergency contact information.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <ParentsTab studentId={studentId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medical" className="mt-0">
            <Card className="overflow-hidden border-border shadow-sm rounded-4xl">
              <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-6 px-8">
                <div>
                  <CardTitle className="text-xl font-bold tracking-tight">Medical History</CardTitle>
                  <CardDescription className="text-xs font-medium opacity-70 mt-1">Health information and medical records.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <MedicalTab studentId={studentId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="address" className="mt-0">
            <Card className="overflow-hidden border-border shadow-sm rounded-4xl">
              <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-6 px-8">
                <div>
                  <CardTitle className="text-xl font-bold tracking-tight">Address Records</CardTitle>
                  <CardDescription className="text-xs font-medium opacity-70 mt-1">Residential and contact locations.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <AddressTab studentId={studentId} />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
