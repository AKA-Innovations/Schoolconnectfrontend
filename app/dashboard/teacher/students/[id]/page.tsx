'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStudent } from '@/hooks/useStudents';
import {
  ArrowLeft, User, Phone, Mail, Calendar, GraduationCap,
  MapPin, Heart, Users,
} from 'lucide-react';

export default function TeacherStudentProfilePage() {
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
        <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <h2 className="text-xl font-bold text-muted-foreground">Student not found</h2>
        <Button variant="outline" className="mt-4 rounded-xl" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  const academic = student.academics?.[0];
  const parents = student.parents ?? [];
  const addresses = student.addresses ?? [];
  const medicals = student.medicalHistories ?? [];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-4 flex-1">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden border border-border/50">
            {student.profileImageUrl ? (
              <img src={student.profileImageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="h-8 w-8 text-primary/50" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{student.firstName} {student.lastName}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {academic && (
                <Badge variant="secondary" className="rounded-lg text-xs">
                  {academic.className} — {academic.sectionName}
                  {academic.rollNumber && ` · Roll #${academic.rollNumber}`}
                </Badge>
              )}
              <Badge
                className={`rounded-lg text-xs border-0 ${
                  student.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {student.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="personal">
        <TabsList className="rounded-xl">
          <TabsTrigger value="personal"><User className="h-3 w-3 mr-1" />Personal</TabsTrigger>
          <TabsTrigger value="academic"><GraduationCap className="h-3 w-3 mr-1" />Academic</TabsTrigger>
          <TabsTrigger value="parents"><Users className="h-3 w-3 mr-1" />Parents</TabsTrigger>
          <TabsTrigger value="medical"><Heart className="h-3 w-3 mr-1" />Medical</TabsTrigger>
          <TabsTrigger value="address"><MapPin className="h-3 w-3 mr-1" />Address</TabsTrigger>
        </TabsList>

        {/* Personal */}
        <TabsContent value="personal" className="mt-4">
          <Card className="erp-card">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Date of Birth', value: student.dateOfBirth, icon: Calendar },
                  { label: 'Gender', value: student.gender, icon: User },
                  { label: 'Phone', value: student.mobileNumber, icon: Phone },
                  { label: 'Email', value: student.emailId, icon: Mail },
                  { label: 'Blood Group', value: student.bloodGroup || '—' },
                  { label: 'Nationality', value: student.nationality || '—' },
                  { label: 'Religion', value: student.religion || '—' },
                  { label: 'Caste', value: student.caste || '—' },
                ].map((f) => (
                  <div key={f.label} className="flex items-start gap-3">
                    {f.icon && <f.icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{f.label}</p>
                      <p className="text-sm font-medium mt-0.5">{f.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic */}
        <TabsContent value="academic" className="mt-4">
          <Card className="erp-card">
            <CardContent className="p-6">
              {!academic ? (
                <p className="text-sm text-muted-foreground text-center py-4">No academic record</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: 'Class', value: academic.className },
                    { label: 'Section', value: academic.sectionName },
                    { label: 'Roll Number', value: academic.rollNumber || '—' },
                    { label: 'Admission No.', value: (academic as any).admissionNumber || '—' },
                    { label: 'Admission Date', value: (academic as any).admissionDate || '—' },
                    { label: 'Conveyance', value: (academic as any).conveyance || '—' },
                  ].map((f) => (
                    <div key={f.label}>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{f.label}</p>
                      <p className="text-sm font-medium mt-0.5">{f.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Parents */}
        <TabsContent value="parents" className="mt-4">
          {parents.length === 0 ? (
            <Card className="erp-card"><CardContent className="p-8 text-center text-sm text-muted-foreground">No parent records</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parents.map((p: any) => (
                <Card key={p.id} className="erp-card">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-bold">{p.firstName} {p.lastName}</p>
                      <Badge variant="secondary" className="rounded-lg text-xs">{p.relation}</Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {p.mobileNumber && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{p.mobileNumber}</div>}
                      {p.emailId && <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{p.emailId}</div>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Medical */}
        <TabsContent value="medical" className="mt-4">
          {medicals.length === 0 ? (
            <Card className="erp-card"><CardContent className="p-8 text-center text-sm text-muted-foreground">No medical records</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {medicals.map((m: any) => (
                <Card key={m.id} className="erp-card">
                  <CardContent className="p-5">
                    <p className="text-sm">{m.history || m.notes || JSON.stringify(m)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Address */}
        <TabsContent value="address" className="mt-4">
          {addresses.length === 0 ? (
            <Card className="erp-card"><CardContent className="p-8 text-center text-sm text-muted-foreground">No address records</CardContent></Card>
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
