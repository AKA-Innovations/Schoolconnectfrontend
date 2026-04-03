'use client';

import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SchoolDetails, UpdateSchoolPayload, UpdateAdministratorPayload } from '@/services/school.service';
import {
  useSchool, useUpdateSchool, useUploadSchoolImage, useDeleteSchoolImage,
  useUploadOwnerImage, useDeleteOwnerImage,
  useUpdateAdministrator, useUploadAdminImage, useDeleteAdminImage,
} from '@/hooks/useSchool';
import { useAuthStore } from '@/store/authStore';
import {
  Save, Camera, Trash2, Building2, User, Phone,
  Mail, MapPin, ShieldCheck, RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Root ─────────────────────────────────────────────────────────────────────

export function SchoolManagement() {
  const { schoolId, user } = useAuthStore();
  const { data: school, isLoading, isFetching, refetch } = useSchool(schoolId);
  const [activeTab, setActiveTab] = useState('school');

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-40 rounded-2xl bg-muted" />
        <div className="h-96 rounded-2xl bg-muted" />
      </div>
    );
  }

  if (!school) {
    return (
      <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-border/50">
        <Building2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <h3 className="text-xl font-bold">School Not Found</h3>
        <p className="text-muted-foreground mt-2">Could not load school data.</p>
        <Button variant="outline" onClick={() => refetch()} className="mt-6">
          <RefreshCw className="mr-2 h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">

      {/* Header */}
      <Card className="erp-card overflow-hidden">
        <div className="relative p-6 sm:p-8 bg-card flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* School logo */}
          <SchoolImageSection school={school} />

          <div className="flex-1 text-center md:text-left space-y-1.5">
            <span className="inline-block bg-muted/30 text-muted-foreground px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border border-border/40">
              {school.schoolCode}
            </span>
            <h1 className="text-2xl font-bold tracking-tight">{school.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-x-5 gap-y-1.5 text-muted-foreground/70 mt-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold">
                <MapPin className="h-3.5 w-3.5 opacity-40 text-primary" />
                {school.city}, {school.state}, {school.country}
              </span>
              {school.contactDetails?.email && (
                <span className="flex items-center gap-1.5 text-xs font-semibold">
                  <Mail className="h-3.5 w-3.5 opacity-40 text-primary" />
                  {school.contactDetails.email}
                </span>
              )}
              {school.contactDetails?.phone && (
                <span className="flex items-center gap-1.5 text-xs font-semibold">
                  <Phone className="h-3.5 w-3.5 opacity-40 text-primary" />
                  {school.contactDetails.phone}
                </span>
              )}
            </div>
          </div>
          <div className="absolute top-4 right-4">
            <Button variant="secondary" size="icon" onClick={() => refetch()}
              className="rounded-xl h-10 w-10 shadow-sm border border-border/50 bg-background/50 hover:bg-background"
              title="Refresh">
              <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex w-max min-w-full gap-2 bg-muted/20 p-1.5 rounded-2xl border border-border/50">
          {[
            { id: 'school',  label: 'School Details' },
            { id: 'contact', label: 'Contact'         },
            { id: 'owner',   label: 'Owner'           },
            { id: 'admin',   label: 'Administrator'   },
          ].map(tab => (
            <TabsTrigger key={tab.id} value={tab.id}
              className="rounded-xl px-6 py-2.5 text-[10px] font-bold tracking-widest uppercase data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6">
          <TabsContent value="school"  className="mt-0"><SchoolDetailsForm  school={school} /></TabsContent>
          <TabsContent value="contact" className="mt-0"><ContactForm        school={school} /></TabsContent>
          <TabsContent value="owner"   className="mt-0"><OwnerForm          school={school} /></TabsContent>
          <TabsContent value="admin"   className="mt-0"><AdministratorForm  adminId={user?.id} schoolId={schoolId} /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// ─── School logo upload / delete ──────────────────────────────────────────────

function SchoolImageSection({ school }: { school: SchoolDetails }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { schoolId } = useAuthStore();
  const uploadMutation = useUploadSchoolImage(schoolId ?? '');
  const deleteMutation = useDeleteSchoolImage(schoolId ?? '');
  const busy = uploadMutation.isPending || deleteMutation.isPending;

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !schoolId) return;
    uploadMutation.mutate(file, { onError: () => alert('Upload failed.') });
    e.target.value = '';
  };

  const handleDelete = () => {
    if (!schoolId || !confirm('Delete school profile image?')) return;
    deleteMutation.mutate(undefined, { onError: () => alert('Delete failed.') });
  };

  return (
    <div className="shrink-0 relative group cursor-pointer">
      <div className="h-24 w-24 rounded-2xl bg-muted/10 flex items-center justify-center overflow-hidden border border-border/50">
        {school.profileUrl ? (
          <img src={school.profileUrl} alt="School" className="w-full h-full object-cover" />
        ) : (
          <Building2 className="h-10 w-10 text-primary/30" />
        )}
        <div className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
          <button type="button" onClick={() => fileRef.current?.click()}
            className="text-white text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 hover:text-blue-300 transition-colors">
            <Camera className="h-3 w-3" />{busy ? 'Uploading…' : 'Upload'}
          </button>
          {school.profileUrl && (
            <button type="button" onClick={handleDelete}
              className="text-red-300 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 hover:text-red-200 transition-colors">
              <Trash2 className="h-3 w-3" />Remove
            </button>
          )}
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
    </div>
  );
}

// ─── School Details Form ──────────────────────────────────────────────────────────────────────

function SchoolDetailsForm({ school }: { school: SchoolDetails }) {
  const { schoolId } = useAuthStore();
  const updateMutation = useUpdateSchool(schoolId ?? '');
  const [form, setForm] = useState({
    schoolCode: school.schoolCode ?? '',
    name: school.name ?? '',
    address: school.address ?? '',
    city: school.city ?? '',
    state: school.state ?? '',
    pincode: school.pincode ?? '',
    country: school.country ?? '',
    schoolAffiliation: school.schoolAffiliation ?? '',
    schoolBoard: school.schoolBoard ?? '',
  });

  const handleSave = () => {
    if (!schoolId) return;
    updateMutation.mutate(form, {
      onError: (err: any) => alert(err.response?.data?.message || 'Update failed.'),
    });
  };

  return (
    <Card className="erp-card overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-6 px-8">
        <div>
          <CardTitle className="text-xl font-bold tracking-tight">School Details</CardTitle>
          <CardDescription className="text-xs font-medium opacity-70 mt-1">Core institution information.</CardDescription>
        </div>
        <Button onClick={handleSave} disabled={updateMutation.isPending} className="rounded-xl h-10 px-6 font-bold shadow-sm text-xs">
          <Save className="mr-2 h-4 w-4" />{updateMutation.isPending ? 'Saving…' : 'Save Changes'}
        </Button>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FG label="School Code"><Input value={form.schoolCode} onChange={e => setForm(p => ({ ...p, schoolCode: e.target.value }))} className="rounded-xl" /></FG>
          <FG label="School Name" className="md:col-span-1"><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="rounded-xl" /></FG>
          <FG label="Address" className="md:col-span-2"><Input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} className="rounded-xl" /></FG>
          <FG label="City"><Input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className="rounded-xl" /></FG>
          <FG label="State"><Input value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} className="rounded-xl" /></FG>
          <FG label="Pincode"><Input value={form.pincode} onChange={e => setForm(p => ({ ...p, pincode: e.target.value }))} className="rounded-xl" /></FG>
          <FG label="Country"><Input value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} className="rounded-xl" /></FG>
          <FG label="Affiliation"><Input value={form.schoolAffiliation} onChange={e => setForm(p => ({ ...p, schoolAffiliation: e.target.value }))} className="rounded-xl" /></FG>
          <FG label="Board"><Input value={form.schoolBoard} onChange={e => setForm(p => ({ ...p, schoolBoard: e.target.value }))} className="rounded-xl" /></FG>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Contact Form ──────────────────────────────────────────────────────────────

function ContactForm({ school }: { school: SchoolDetails }) {
  const { schoolId } = useAuthStore();
  const updateMutation = useUpdateSchool(schoolId ?? '');
  const c = school.contactDetails;
  const [form, setForm] = useState({
    phone: c?.phone ?? '',
    alternatePhone: c?.alternatePhone ?? '',
    fax: c?.fax ?? '',
    email: c?.email ?? '',
  });

  const handleSave = () => {
    if (!schoolId) return;
    updateMutation.mutate({ contactDetails: form }, {
      onError: (err: any) => alert(err.response?.data?.message || 'Update failed.'),
    });
  };

  return (
    <Card className="erp-card overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-6 px-8">
        <div>
          <CardTitle className="text-xl font-bold tracking-tight">Contact Details</CardTitle>
          <CardDescription className="text-xs font-medium opacity-70 mt-1">School contact numbers and official email.</CardDescription>
        </div>
        <Button onClick={handleSave} disabled={updateMutation.isPending} className="rounded-xl h-10 px-6 font-bold shadow-sm text-xs">
          <Save className="mr-2 h-4 w-4" />{updateMutation.isPending ? 'Saving…' : 'Save Changes'}
        </Button>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FG label="Phone *"><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="rounded-xl" /></FG>
          <FG label="Alternate Phone"><Input value={form.alternatePhone} onChange={e => setForm(p => ({ ...p, alternatePhone: e.target.value }))} placeholder="Optional" className="rounded-xl" /></FG>
          <FG label="Fax"><Input value={form.fax} onChange={e => setForm(p => ({ ...p, fax: e.target.value }))} placeholder="Optional" className="rounded-xl" /></FG>
          <FG label="Official Email *"><Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="rounded-xl" /></FG>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Owner Form ────────────────────────────────────────────────────────────────

function OwnerForm({ school }: { school: SchoolDetails }) {
  const { schoolId } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const o = school.ownerDetails;
  const updateMutation = useUpdateSchool(schoolId ?? '');
  const uploadImgMutation = useUploadOwnerImage(schoolId ?? '');
  const deleteImgMutation = useDeleteOwnerImage(schoolId ?? '');
  const imgBusy = uploadImgMutation.isPending || deleteImgMutation.isPending;
  const [form, setForm] = useState({
    firstName: o?.firstName ?? '',
    lastName: o?.lastName ?? '',
    address: o?.address ?? '',
    email: o?.email ?? '',
    phone: o?.phone ?? '',
  });

  const handleSave = () => {
    if (!schoolId) return;
    updateMutation.mutate({ ownerDetails: form }, {
      onError: (err: any) => alert(err.response?.data?.message || 'Update failed.'),
    });
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !schoolId) return;
    uploadImgMutation.mutate(file, { onError: () => alert('Upload failed.') });
    e.target.value = '';
  };

  const handleDeleteImg = () => {
    if (!schoolId || !confirm('Delete owner profile image?')) return;
    deleteImgMutation.mutate(undefined, { onError: () => alert('Delete failed.') });
  };

  return (
    <Card className="erp-card overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-6 px-8">
        <div>
          <CardTitle className="text-xl font-bold tracking-tight">Owner Details</CardTitle>
          <CardDescription className="text-xs font-medium opacity-70 mt-1">School owner / management contact.</CardDescription>
        </div>
        <Button onClick={handleSave} disabled={updateMutation.isPending} className="rounded-xl h-10 px-6 font-bold shadow-sm text-xs">
          <Save className="mr-2 h-4 w-4" />{updateMutation.isPending ? 'Saving…' : 'Save Changes'}
        </Button>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        {/* Owner avatar */}
        <div className="flex items-center gap-6">
          <div className="shrink-0 relative group cursor-pointer">
            <div className="h-20 w-20 rounded-2xl bg-muted/10 border border-border/50 overflow-hidden flex items-center justify-center">
              {o?.profileUrl ? (
                <img src={o.profileUrl} alt="Owner" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-primary/50 uppercase">
                  {(o?.firstName ?? '?').charAt(0)}
                </span>
              )}
              <div className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="text-white text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 hover:text-blue-300">
                  <Camera className="h-3 w-3" />{imgBusy ? 'Uploading…' : 'Upload'}
                </button>
                {o?.profileUrl && (
                  <button type="button" onClick={handleDeleteImg}
                    className="text-red-300 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 hover:text-red-200">
                    <Trash2 className="h-3 w-3" />Remove
                  </button>
                )}
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </div>
          <div>
            <p className="font-bold text-foreground">{o?.firstName} {o?.lastName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{o?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FG label="First Name"><Input value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} className="rounded-xl" /></FG>
          <FG label="Last Name"><Input value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} className="rounded-xl" /></FG>
          <FG label="Address" className="md:col-span-2"><Input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} className="rounded-xl" /></FG>
          <FG label="Email"><Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="Optional" className="rounded-xl" /></FG>
          <FG label="Phone"><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="rounded-xl" /></FG>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Administrator Form (PUT /administrator/:id + profile image) ──────────────

function AdministratorForm({ adminId, schoolId }: { adminId?: string; schoolId: string | null }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const updateMutation = useUpdateAdministrator(adminId ?? '', schoolId ?? '');
  const uploadImgMutation = useUploadAdminImage(adminId ?? '');
  const deleteImgMutation = useDeleteAdminImage(adminId ?? '');
  const imgBusy = uploadImgMutation.isPending || deleteImgMutation.isPending;
  const [form, setForm] = useState<UpdateAdministratorPayload>({
    employeeId: '',
    firstName: '',
    lastName: '',
    address: '',
    email: '',
    phone: '',
  });
  const [profileUrl, setProfileUrl] = useState<string | undefined>();

  if (!adminId) {
    return (
      <div className="text-center py-12 text-muted-foreground/50 bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
        <ShieldCheck className="h-8 w-8 mx-auto mb-2 opacity-20" />
        <p className="text-[10px] font-bold uppercase tracking-widest">No administrator ID available.</p>
      </div>
    );
  }

  const handleSave = () => {
    updateMutation.mutate(form, {
      onError: (err: any) => alert(err.response?.data?.message || 'Update failed.'),
    });
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadImgMutation.mutate(file, { onError: () => alert('Upload failed.') });
    e.target.value = '';
  };

  const handleDeleteImg = () => {
    if (!confirm('Delete administrator profile image?')) return;
    deleteImgMutation.mutate(undefined, {
      onSuccess: () => setProfileUrl(undefined),
      onError: () => alert('Delete failed.'),
    });
  };

  return (
    <Card className="erp-card overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-6 px-8">
        <div>
          <CardTitle className="text-xl font-bold tracking-tight">Administrator Profile</CardTitle>
          <CardDescription className="text-xs font-medium opacity-70 mt-1">Update your administrator details and profile image.</CardDescription>
        </div>
        <Button onClick={handleSave} disabled={updateMutation.isPending} className="rounded-xl h-10 px-6 font-bold shadow-sm text-xs">
          <Save className="mr-2 h-4 w-4" />{updateMutation.isPending ? 'Saving…' : 'Save Changes'}
        </Button>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        {/* Admin avatar */}
        <div className="flex items-center gap-6">
          <div className="shrink-0 relative group cursor-pointer">
            <div className="h-20 w-20 rounded-2xl bg-muted/10 border border-border/50 overflow-hidden flex items-center justify-center">
              {profileUrl ? (
                <img src={profileUrl} alt="Admin" className="w-full h-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-primary/30" />
              )}
              <div className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="text-white text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 hover:text-blue-300">
                  <Camera className="h-3 w-3" />{imgBusy ? 'Uploading…' : 'Upload'}
                </button>
                {profileUrl && (
                  <button type="button" onClick={handleDeleteImg}
                    className="text-red-300 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 hover:text-red-200">
                    <Trash2 className="h-3 w-3" />Remove
                  </button>
                )}
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </div>
          <div>
            <p className="font-bold text-foreground">{form.firstName} {form.lastName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{form.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FG label="Employee ID"><Input value={form.employeeId ?? ''} onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))} className="rounded-xl" /></FG>
          <FG label="First Name"><Input value={form.firstName ?? ''} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} className="rounded-xl" /></FG>
          <FG label="Last Name"><Input value={form.lastName ?? ''} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} className="rounded-xl" /></FG>
          <FG label="Phone"><Input value={form.phone ?? ''} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="rounded-xl" /></FG>
          <FG label="Email"><Input type="email" value={form.email ?? ''} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="rounded-xl" /></FG>
          <FG label="Address" className="md:col-span-2"><Input value={form.address ?? ''} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} className="rounded-xl" /></FG>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Shared field-group helper ─────────────────────────────────────────────────

function FG({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
