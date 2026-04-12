'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStudent } from '@/hooks/useStudents';
import {
  ArrowLeft, User, Phone, Mail, Calendar, BookOpen,
  Heart, MapPin, GraduationCap,
} from 'lucide-react';

function ParentsIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export default function CoordinatorStudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  const { data: student, isLoading } = useStudent(studentId);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="h-32 bg-muted rounded-xl" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 text-center">
        <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <h2 className="text-xl font-bold text-muted-foreground">Student not found</h2>
        <Button variant="outline" className="mt-4 rounded-xl" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  const academics = student.academics ?? [];
  const parents = student.parents ?? [];
  const medicals = student.medicalHistories ?? [];
  const addresses = student.addresses ?? [];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-4 flex-1">
          <div className="h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center overflow-hidden border border-border/50">
            {student.profileImageUrl ? (
              <img src={student.profileImageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="h-8 w-8 text-blue-500/50" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{student.firstName} {student.lastName}</h1>
            <div className="flex items-center gap-2 mt-1">
              {academics[0] && (
                <Badge variant="secondary" className="rounded-lg text-xs">
                  {academics[0].className} — {academics[0].sectionName}
                </Badge>
              )}
              <Badge className={`text-[9px] border-0 rounded-md ${student.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {student.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="personal">
        <TabsList className="rounded-xl">
          <TabsTrigger value="personal"><User className="h-3 w-3 mr-1" />Personal</TabsTrigger>
          <TabsTrigger value="academic"><BookOpen className="h-3 w-3 mr-1" />Academic</TabsTrigger>
          <TabsTrigger value="parents"><ParentsIcon size={12} className="mr-1" />Parents</TabsTrigger>
          <TabsTrigger value="medical"><Heart className="h-3 w-3 mr-1" />Medical</TabsTrigger>
          <TabsTrigger value="address"><MapPin className="h-3 w-3 mr-1" />Address</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-4">
          <Card className="erp-card">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Date of Birth', value: student.dateOfBirth, icon: Calendar },
                  { label: 'Gender', value: student.gender, icon: User },
                  { label: 'Blood Group', value: student.bloodGroup || '—', icon: Heart },
                  { label: 'Phone', value: student.mobileNumber, icon: Phone },
                  { label: 'Alt. Phone', value: student.alternateMobileNumber || '—', icon: Phone },
                  { label: 'Email', value: student.emailId, icon: Mail },
                  { label: 'Caste', value: student.caste || '—' },
                  { label: 'Religion', value: student.religion || '—' },
                  { label: 'Nationality', value: student.nationality || '—' },
                ].map((field) => (
                  <div key={field.label} className="flex items-start gap-3">
                    {field.icon && <field.icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{field.label}</p>
                      <p className="text-sm font-medium mt-0.5">{field.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic" className="mt-4">
          {academics.length === 0 ? (
            <Card className="erp-card"><CardContent className="p-8 text-center text-sm text-muted-foreground">No academic records</CardContent></Card>
          ) : (
            <div className="space-y-4">
              {academics.map((ac: any) => (
                <Card key={ac.id} className="erp-card">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        { label: 'Class', value: ac.className },
                        { label: 'Section', value: ac.sectionName },
                        { label: 'Roll Number', value: ac.rollNumber },
                        { label: 'Admission No.', value: ac.admissionNumber },
                        { label: 'Admission Date', value: ac.admissionDate },
                        { label: 'Conveyance', value: ac.convenceMode || '—' },
                      ].map((f) => (
                        <div key={f.label}>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{f.label}</p>
                          <p className="text-sm font-medium mt-0.5">{f.value}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="parents" className="mt-4">
          {parents.length === 0 ? (
            <Card className="erp-card"><CardContent className="p-8 text-center text-sm text-muted-foreground">No parent records</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parents.map((p: any) => (
                <Card key={p.id} className="erp-card">
                  <CardContent className="p-5">
                    <Badge variant="secondary" className="rounded-lg mb-3 text-[10px]">{p.relation}</Badge>
                    <p className="font-bold text-lg">{p.firstName} {p.lastName}</p>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2"><Phone className="h-3 w-3" />{p.mobileNumber}</p>
                      {p.emailId && <p className="flex items-center gap-2"><Mail className="h-3 w-3" />{p.emailId}</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="medical" className="mt-4">
          {medicals.length === 0 ? (
            <Card className="erp-card"><CardContent className="p-8 text-center text-sm text-muted-foreground">No medical records</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {medicals.map((m: any) => (
                <Card key={m.id} className="erp-card">
                  <CardContent className="p-5">
                    <p className="text-sm">{m.medicalHistory}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="address" className="mt-4">
          {addresses.length === 0 ? (
            <Card className="erp-card"><CardContent className="p-8 text-center text-sm text-muted-foreground">No addresses</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((a: any) => (
                <Card key={a.id} className="erp-card">
                  <CardContent className="p-5">
                    {a.isPermanent && <Badge className="rounded-lg bg-blue-100 text-blue-700 border-0 text-[9px] mb-2">Permanent</Badge>}
                    <p className="text-sm font-medium">{a.address}</p>
                    <p className="text-sm text-muted-foreground mt-1">{a.city}, {a.state} — {a.pincode}</p>
                    <p className="text-xs text-muted-foreground">{a.country}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
