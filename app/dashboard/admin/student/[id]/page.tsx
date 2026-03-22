'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminService } from '@/services/admin.service';
import { Student } from '@/types/roles';
import { ArrowLeft, User, BookOpen } from 'lucide-react';

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState(false);

  const [updateForm, setUpdateForm] = useState({
    name: '', email: '', grade: '', class: '', phone: '', dateOfBirth: '', gender: ''
  });

  useEffect(() => {
    loadStudent();
  }, [studentId]);

  const loadStudent = async () => {
    try {
      const mockData = await adminService.getSummary();
      const foundStudent = mockData.students.find(s => s.id === studentId);
      if (foundStudent) {
        setStudent(foundStudent);
        setUpdateForm({
          name: foundStudent.name,
          email: foundStudent.email,
          grade: foundStudent.grade,
          class: foundStudent.class,
          phone: foundStudent.phone || '',
          dateOfBirth: foundStudent.dateOfBirth || '',
          gender: foundStudent.gender || ''
        });
      }
    } catch (error) {
      console.error('Error loading student:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStudentDetails = async () => {
    setApiLoading(true);
    try {
      const response = await fetch(`/api/student/${studentId}/details`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateForm)
      });
      const result = await response.json();
      setApiResponse(result);
      if (response.ok) loadStudent();
    } catch (error: any) {
      setApiResponse({ error: error.message });
    } finally {
      setApiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-center p-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Student Not Found</h2>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 animate-in fade-in duration-500 bg-background">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{student.name}</h1>
            <p className="text-muted-foreground mt-1">Student Record & Academic Corpus</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Badge variant="premium">Student</Badge>
           <Badge variant={student.status === 'active' ? 'success' : 'secondary'}>{student.status}</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl w-fit">
          <TabsTrigger value="details">Profile Overview</TabsTrigger>
          <TabsTrigger value="academic">Academic Data</TabsTrigger>
          <TabsTrigger value="edit">Edit Profile</TabsTrigger>
          <TabsTrigger value="api">API Status</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-8 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="border-none shadow-card bg-slate-50/50 overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-40 h-40 rounded-full p-1 bg-linear-to-tr from-primary to-amber-400 overflow-hidden shadow-xl">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white">
                      {student.profileImageUrl ? (
                        <img src={student.profileImageUrl} alt={student.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted/30">
                          <User className="h-20 w-20 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mt-6">{student.name}</h3>
                  <p className="text-muted-foreground">Grade {student.grade} • Section {student.class}</p>
                  <div className="mt-8 w-full grid grid-cols-2 gap-3">
                     <div className="p-3 bg-white rounded-lg border border-gray-100 text-center">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Attendance</p>
                        <p className="text-lg font-bold text-primary">94%</p>
                     </div>
                     <div className="p-3 bg-white rounded-lg border border-gray-100 text-center">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">GPA</p>
                        <p className="text-lg font-bold text-amber-600">3.8</p>
                     </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 border-none shadow-card">
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-xl">Biographical Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Official Email</Label>
                      <p className="text-foreground font-medium mt-1">{student.email}</p>
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Contact Phone</Label>
                      <p className="text-foreground font-medium mt-1">{student.phone || '—'}</p>
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Enrollment Date</Label>
                      <p className="text-foreground font-medium mt-1">{student.enrollmentDate}</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Date of Birth</Label>
                      <p className="text-foreground font-medium mt-1">{student.dateOfBirth || '—'}</p>
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Registry ID</Label>
                      <p className="text-foreground font-medium mt-1">{student.schoolId}</p>
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Guardian Details</Label>
                      <p className="text-foreground font-medium mt-1">{student.parentDetails?.fatherName || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="academic" className="focus-visible:outline-none">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-none shadow-md">
                 <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                       <BookOpen className="h-4 w-4 text-primary" /> Current Subject Load
                    </CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="space-y-3">
                       {['Mathematics', 'Physics', 'Chemistry', 'English'].map(sub => (
                         <div key={sub} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                            <span className="text-sm">{sub}</span>
                            <Badge variant="outline" className="text-[10px]">A+</Badge>
                         </div>
                       ))}
                    </div>
                 </CardContent>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="edit" className="focus-visible:outline-none">
          <Card className="border-none shadow-card">
             <CardHeader className="border-b pb-4">
                <CardTitle>Modification Controls</CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="std-name">Full Student Name</Label>
                    <Input id="std-name" value={updateForm.name} onChange={(e) => setUpdateForm({ ...updateForm, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="std-email">Primary Email</Label>
                    <Input id="std-email" type="email" value={updateForm.email} onChange={(e) => setUpdateForm({ ...updateForm, email: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="std-grade">Assigned Grade</Label>
                    <Input id="std-grade" value={updateForm.grade} onChange={(e) => setUpdateForm({ ...updateForm, grade: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="std-class">Class Section</Label>
                    <Input id="std-class" value={updateForm.class} onChange={(e) => setUpdateForm({ ...updateForm, class: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="std-gender">Gender Identity</Label>
                    <Select value={updateForm.gender} onValueChange={(value) => setUpdateForm({ ...updateForm, gender: value })}>
                      <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={updateStudentDetails} disabled={apiLoading} variant="premium">
                    {apiLoading ? 'Processing...' : 'Apply Registry Updates'}
                  </Button>
                </div>
             </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="focus-visible:outline-none">
          <Card className="border-none shadow-card overflow-hidden">
             <CardHeader className="bg-slate-900 text-slate-50">
                <CardTitle className="text-lg">API Transaction History</CardTitle>
             </CardHeader>
             <CardContent className="p-0">
                {apiResponse ? (
                  <pre className="p-6 bg-slate-950 text-emerald-400 font-mono text-sm overflow-auto max-h-[500px]">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                ) : (
                  <div className="p-12 text-center text-muted-foreground italic">
                     System waiting for telemetry...
                  </div>
                )}
             </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}