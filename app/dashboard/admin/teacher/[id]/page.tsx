'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminService } from '@/services/admin.service';
import { Teacher } from '@/types/roles';
import { ArrowLeft, User, MapPin, Award, Upload } from 'lucide-react';

export default function TeacherProfilePage() {
  const params = useParams();
  const router = useRouter();
  const teacherId = params.id as string;

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState(false);

  const [updateForm, setUpdateForm] = useState({
    firstName: '', lastName: '', emailId: '', mobileNumber: '', dateOfBirth: '', gender: ''
  });

  useEffect(() => {
    loadTeacher();
  }, [teacherId]);

  const loadTeacher = async () => {
    try {
      const mockData = await adminService.getSummary();
      const foundTeacher = mockData.teachers.find(t => t.id === teacherId);
      if (foundTeacher) {
        setTeacher(foundTeacher);
        setUpdateForm({
          firstName: foundTeacher.firstName || '',
          lastName: foundTeacher.lastName || '',
          emailId: foundTeacher.emailId || '',
          mobileNumber: foundTeacher.mobileNumber || '',
          dateOfBirth: foundTeacher.dateOfBirth || '',
          gender: foundTeacher.gender || ''
        });
      }
    } catch (error) {
      console.error('Error loading teacher:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTeacherDetails = async () => {
    setApiLoading(true);
    try {
      const response = await fetch(`/api/teacher/${teacherId}/details`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateForm)
      });
      const result = await response.json();
      setApiResponse(result);
      if (response.ok) loadTeacher();
    } catch (error: any) {
      setApiResponse({ error: error.message });
    } finally {
      setApiLoading(false);
    }
  };

  const uploadProfileImage = async (file: File) => {
    setApiLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await fetch(`/api/teacher/${teacherId}/profile-image`, {
        method: 'PUT',
        body: formData
      });
      const result = await response.json();
      setApiResponse(result);
      if (response.ok) loadTeacher();
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

  if (!teacher) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-center p-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Teacher Not Found</h2>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const teacherName = teacher.name || `${teacher.firstName} ${teacher.lastName}`;

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 animate-in fade-in duration-500 bg-background">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{teacherName}</h1>
            <p className="text-muted-foreground mt-1">Faculty Profile & Management</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Badge variant="premium" className="px-3 py-1">Teacher</Badge>
           <Badge variant={teacher.status === 'active' ? 'success' : 'secondary'}>{teacher.status}</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl w-fit">
          <TabsTrigger value="details">Profile Overview</TabsTrigger>
          <TabsTrigger value="edit">Edit Details</TabsTrigger>
          <TabsTrigger value="api">API Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-8 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="border-none shadow-card bg-slate-50/50 overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="relative group cursor-pointer">
                    <div className="w-40 h-40 rounded-full p-1 bg-linear-to-tr from-primary to-blue-400 overflow-hidden shadow-xl group-hover:scale-105 transition-transform">
                      <div className="w-full h-full rounded-full overflow-hidden bg-white">
                        {teacher.profileImageUrl ? (
                          <img src={teacher.profileImageUrl} alt={teacherName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted/30">
                            <User className="h-20 w-20 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                    </div>
                    <label className="absolute bottom-2 right-2 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer border border-border">
                      <Upload className="h-5 w-5" />
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadProfileImage(file);
                      }} />
                    </label>
                  </div>
                  <h3 className="text-2xl font-bold mt-6">{teacherName}</h3>
                  <p className="text-primary font-medium">Faculty Member</p>
                  <div className="mt-6 w-full space-y-3">
                     <div className="flex items-center gap-3 text-sm text-muted-foreground p-3 bg-white rounded-lg border border-gray-100">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{teacher.addresses?.[0]?.city || 'Location N/A'}</span>
                     </div>
                     <div className="flex items-center gap-3 text-sm text-muted-foreground p-3 bg-white rounded-lg border border-gray-100">
                        <Award className="h-4 w-4 text-primary" />
                        <span>Joined {teacher.joiningDate}</span>
                     </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 border-none shadow-card">
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-xl">Information Corpus</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Official Email</Label>
                      <p className="text-foreground font-medium mt-1">{teacher.emailId}</p>
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Mobile Number</Label>
                      <p className="text-foreground font-medium mt-1">{teacher.mobileNumber || '—'}</p>
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Gender</Label>
                      <p className="text-foreground font-medium mt-1 capitalize">{teacher.gender || '—'}</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Date of Birth</Label>
                      <p className="text-foreground font-medium mt-1">{teacher.dateOfBirth || '—'}</p>
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Employee ID</Label>
                      <p className="text-foreground font-medium mt-1">{teacher.employeeId}</p>
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground font-bold">School ID</Label>
                      <p className="text-foreground font-medium mt-1">{teacher.schoolId}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-10">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground font-bold block mb-3">Academic Assignments</Label>
                  <div className="flex flex-wrap gap-2">
                    {teacher.classes?.map((cls, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-primary/5 text-primary border-primary/10 px-3 py-1 font-semibold">
                        {cls.className} - {cls.sectionName} ({cls.subjectName})
                      </Badge>
                    ))}
                    {(!teacher.classes || teacher.classes.length === 0) && <span className="text-muted-foreground italic text-sm">No classes assigned yet.</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="edit" className="focus-visible:outline-none">
          <Card className="border-none shadow-card">
             <CardHeader className="border-b pb-4">
                <CardTitle>Core Details Modification</CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="upd-fname">First Name</Label>
                    <Input id="upd-fname" value={updateForm.firstName} onChange={(e) => setUpdateForm({ ...updateForm, firstName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="upd-lname">Last Name</Label>
                    <Input id="upd-lname" value={updateForm.lastName} onChange={(e) => setUpdateForm({ ...updateForm, lastName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="upd-email">Official Email</Label>
                    <Input id="upd-email" type="email" value={updateForm.emailId} onChange={(e) => setUpdateForm({ ...updateForm, emailId: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="upd-phone">Contact Number</Label>
                    <Input id="upd-phone" value={updateForm.mobileNumber} onChange={(e) => setUpdateForm({ ...updateForm, mobileNumber: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="upd-dob">Birth Date</Label>
                    <Input id="upd-dob" type="date" value={updateForm.dateOfBirth} onChange={(e) => setUpdateForm({ ...updateForm, dateOfBirth: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="upd-gender">Gender Identity</Label>
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
                  <Button onClick={updateTeacherDetails} disabled={apiLoading} variant="premium">
                    {apiLoading ? 'Processing...' : 'Synchronize Changes'}
                  </Button>
                </div>
             </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="focus-visible:outline-none">
          <Card className="border-none shadow-card overflow-hidden">
             <CardHeader className="bg-slate-900 text-slate-50">
                <CardTitle className="text-lg">Recent API Transaction Log</CardTitle>
             </CardHeader>
             <CardContent className="p-0">
                {apiResponse ? (
                  <pre className="p-6 bg-slate-950 text-emerald-400 font-mono text-sm overflow-auto max-h-[500px]">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                ) : (
                  <div className="p-12 text-center text-muted-foreground italic">
                     No API activity recorded in this session.
                  </div>
                )}
             </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}