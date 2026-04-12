'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTeacher } from '@/hooks/useTeachers';
import { useSubjectDetails } from '@/hooks/useClasses';
import {
  ArrowLeft, User, Phone, Mail, Calendar, BookOpen,
  MapPin, Briefcase, Users,
} from 'lucide-react';

export default function TeacherProfileViewPage() {
  const params    = useParams();
  const router    = useRouter();
  const teacherId = params.id as string;
  const { data: teacher, isLoading } = useTeacher(teacherId);
  const { data: subjectDetails = [] } = useSubjectDetails();

  const teacherSubjects = subjectDetails.filter((sd) => sd.teacherId === teacherId);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="h-32 bg-muted rounded-xl" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 text-center">
        <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <h2 className="text-xl font-bold text-muted-foreground">Teacher not found</h2>
        <Button variant="outline" className="mt-4 rounded-xl" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  const addresses    = teacher.addresses ?? [];
  const schoolRecord = teacher.schoolRecord;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-4 flex-1">
          <div className="h-16 w-16 rounded-2xl bg-green-500/10 flex items-center justify-center overflow-hidden border border-border/50">
            {teacher.profileImageUrl ? (
              <img src={teacher.profileImageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="h-8 w-8 text-green-500/50" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{teacher.firstName} {teacher.lastName}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="secondary" className="rounded-lg text-xs">{teacher.employeeId}</Badge>
              {teacher.isPrincipal      && <Badge className="text-[9px] bg-red-100    text-red-700    border-0">Principal</Badge>}
              {teacher.isCoordinator    && <Badge className="text-[9px] bg-purple-100 text-purple-700 border-0">Coordinator</Badge>}
              {teacher.isClassTeacher   && <Badge className="text-[9px] bg-blue-100   text-blue-700   border-0">Class Teacher</Badge>}
              {teacher.isSubjectTeacher && <Badge className="text-[9px] bg-green-100  text-green-700  border-0">Subject Teacher</Badge>}
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="personal">
        <TabsList className="rounded-xl">
          <TabsTrigger value="personal"><User        className="h-3 w-3 mr-1" />Personal</TabsTrigger>
          <TabsTrigger value="subjects"><BookOpen    className="h-3 w-3 mr-1" />Subjects</TabsTrigger>
          <TabsTrigger value="employment"><Briefcase className="h-3 w-3 mr-1" />Employment</TabsTrigger>
          <TabsTrigger value="address"><MapPin       className="h-3 w-3 mr-1" />Address</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-4">
          <Card className="erp-card">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Date of Birth',   value: teacher.dateOfBirth,                  icon: Calendar },
                  { label: 'Gender',           value: teacher.gender,                        icon: User },
                  { label: 'Phone',            value: teacher.mobileNumber,                  icon: Phone },
                  { label: 'Alt. Phone',       value: teacher.alternateMobileNumber || '—',  icon: Phone },
                  { label: 'Email',            value: teacher.emailId,                       icon: Mail },
                  { label: 'Blood Group',      value: teacher.bloodGroup     || '—' },
                  { label: 'Marital Status',   value: teacher.maritalStatus  || '—' },
                  { label: 'Nationality',      value: teacher.nationality    || '—' },
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

        <TabsContent value="subjects" className="mt-4">
          {teacherSubjects.length === 0 ? (
            <Card className="erp-card"><CardContent className="p-8 text-center text-sm text-muted-foreground">No subject assignments</CardContent></Card>
          ) : (
            <Card className="erp-card overflow-hidden">
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/10">
                      {['#', 'Class', 'Subject', 'Session'].map((h) => (
                        <th key={h} className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {teacherSubjects.map((sd, i) => (
                      <tr key={sd.id} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                        <td className="py-3 px-4 text-sm text-muted-foreground">{i + 1}</td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary" className="rounded-lg">{sd.className} — {sd.sectionName}</Badge>
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold">{sd.subjectName}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{sd.session}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="employment" className="mt-4">
          <Card className="erp-card">
            <CardContent className="p-6">
              {schoolRecord ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: 'Employee Email', value: schoolRecord.employeeEmail },
                    { label: 'Joining Date',   value: schoolRecord.joiningDate },
                    { label: 'Status',         value: schoolRecord.isActive ? 'Active' : 'Inactive' },
                  ].map((f) => (
                    <div key={f.label}>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{f.label}</p>
                      <p className="text-sm font-medium mt-0.5">{f.value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No school record available</p>
              )}
            </CardContent>
          </Card>
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
