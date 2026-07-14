'use client';

import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useSchool, useUpdateSchool,
  useUploadSchoolImage, useDeleteSchoolImage,
  useUploadOwnerImage, useDeleteOwnerImage,
} from '@/hooks/useSchool';
import { useAuthStore } from '@/store/authStore';
import { SchoolDetails } from '@/services/school.service';
import {
  Building2, MapPin, Phone, Mail, Camera, Trash2,
  Save, RefreshCw, Award, User, BookOpen, Pencil,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { StructureManagement } from '@/components/admin/school/StructureManagement';
import PeriodSlotsPage from '@/app/dashboard/admin/class/period-slots/page';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SchoolProfilePage() {
  const { schoolId } = useAuthStore();
  const { data: school, isLoading, isFetching, refetch } = useSchool(schoolId);
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  if (isLoading) return <PageSkeleton />;

  if (!school) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <Building2 className="h-16 w-16 text-muted-foreground/20" />
        <h2 className="text-xl font-bold">School Not Found</h2>
        <p className="text-muted-foreground text-sm">Unable to load school details.</p>
        <Button onClick={() => refetch()} variant="outline" className="rounded-xl">
          <RefreshCw className="mr-2 h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  if (activeTab === 'structure') {
    return (
      <div className="bg-transparent py-2">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-in fade-in duration-500">
          <StructureManagement />
        </div>
      </div>
    );
  }

  if (activeTab === 'periods') {
    return (
      <div className="bg-transparent py-2">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-in fade-in duration-500">
          <PeriodSlotsPage />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent py-2">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-in fade-in duration-500">
        <HeroCard school={school} isFetching={isFetching} onRefresh={refetch} schoolId={schoolId!} />
        <InfoGrid school={school} />
        <EditSection school={school} schoolId={schoolId!} />
      </div>
    </div>
  );
}

// ─── Hero Card ────────────────────────────────────────────────────────────────

function HeroCard({
  school, isFetching, onRefresh, schoolId,
}: {
  school: SchoolDetails; isFetching: boolean; onRefresh: () => void; schoolId: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadSchoolImage(schoolId);
  const deleteMutation = useDeleteSchoolImage(schoolId);
  const busy = uploadMutation.isPending || deleteMutation.isPending;

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadMutation.mutate(file, { onError: () => alert('Upload failed.') });
    e.target.value = '';
  };

  const handleDelete = () => {
    if (!confirm('Delete school profile image?')) return;
    deleteMutation.mutate(undefined, { onError: () => alert('Delete failed.') });
  };

  return (
    <Card className="erp-card overflow-hidden">
      {/* accent strip */}
      <div className="h-1.5 bg-gradient-to-r from-primary via-primary/70 to-secondary" />

      <div className="p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative">
        {/* Logo / upload */}
        <div className="shrink-0 relative group cursor-pointer">
          <div className="h-28 w-28 rounded-2xl overflow-hidden border-4 border-background shadow-md bg-muted/10 flex items-center justify-center">
            {school.profileUrl ? (
              <img src={school.profileUrl} alt="School" className="w-full h-full object-cover" />
            ) : (
              <Building2 className="h-12 w-12 text-primary/30" />
            )}
            <div className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} 
                className="text-primary-foreground text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 hover:text-primary-hover">
                <Camera className="h-3 w-3" />{busy ? 'Uploading…' : 'Upload'}
              </button>
              {school.profileUrl && (
                <button type="button" onClick={handleDelete}
                  className="text-destructive text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 hover:text-destructive">
                  <Trash2 className="h-3 w-3" />Remove
                </button>
              )}
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left space-y-3 min-w-0">
          {/* Badge row */}
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            <span className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest">
              {school.schoolCode}
            </span>
            <span className={cn(
              'px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest border',
              school.isActive
                ? 'bg-success/10 text-success border-success/20'
                : 'bg-destructive/10 text-destructive border-destructive/20'
            )}>
              {school.isActive ? '● Active' : '● Inactive'}
            </span>
            {school.schoolBoard && (
              <span className="bg-muted/50 text-muted-foreground border border-border/60 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest">
                {school.schoolBoard}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-foreground leading-tight">
            {school.name}
          </h1>

          {school.schoolAffiliation && (
            <p className="text-sm text-muted-foreground/80 font-semibold flex items-center gap-1.5 justify-center md:justify-start">
              <Award className="h-3.5 w-3.5 text-primary/50 shrink-0" />
              Affiliated to {school.schoolAffiliation}
            </p>
          )}

          {/* Meta strip */}
          <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-1.5 text-muted-foreground/70 text-xs font-semibold pt-1">
            {(school.city || school.state) && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 opacity-50 text-primary" />
                {[school.city, school.state, school.country].filter(Boolean).join(', ')}
              </span>
            )}
            {school.contactDetails?.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 opacity-50 text-primary" />
                {school.contactDetails.email}
              </span>
            )}
            {school.contactDetails?.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 opacity-50 text-primary" />
                {school.contactDetails.phone}
              </span>
            )}
          </div>
        </div>

        {/* Refresh */}
        <div className="absolute top-4 right-4">
          <Button variant="secondary" size="icon" onClick={onRefresh}
            className="rounded-xl h-10 w-10 border border-border/50 bg-background/70 hover:bg-background"
            title="Refresh">
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ─── Info Grid ────────────────────────────────────────────────────────────────

function InfoGrid({ school }: { school: SchoolDetails }) {
  const c = school.contactDetails;
  const o = school.ownerDetails;

  const cards: { title: string; icon: React.ReactNode; rows: { label: string; value?: string | null }[] }[] = [
    {
      title: 'Location',
      icon: <MapPin className="h-4 w-4" />,
      rows: [
        { label: 'Address', value: school.address },
        { label: 'City', value: school.city },
        { label: 'State', value: school.state },
        { label: 'Country / Pincode', value: [school.country, school.pincode].filter(Boolean).join(' — ') || null },
      ],
    },
    {
      title: 'Contact',
      icon: <Phone className="h-4 w-4" />,
      rows: [
        { label: 'Email', value: c?.email },
        { label: 'Phone', value: c?.phone },
        { label: 'Alternate Phone', value: c?.alternatePhone },
        { label: 'Fax', value: c?.fax },
      ],
    },
    {
      title: 'Academics',
      icon: <BookOpen className="h-4 w-4" />,
      rows: [
        { label: 'Board', value: school.schoolBoard },
        { label: 'Affiliation', value: school.schoolAffiliation },
        { label: 'School Code', value: school.schoolCode },
      ],
    },
    {
      title: 'Owner',
      icon: <User className="h-4 w-4" />,
      rows: [
        { label: 'Name', value: o ? `${o.firstName ?? ''} ${o.lastName ?? ''}`.trim() || null : null },
        { label: 'Email', value: o?.email },
        { label: 'Phone', value: o?.phone },
        { label: 'Address', value: o?.address },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="erp-card overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                {card.icon}
              </div>
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">{card.title}</p>
            </div>
            <div className="space-y-3">
              {card.rows
                .filter(r => r.value)
                .map((r, i) => (
                  <div key={i}>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">{r.label}</p>
                    <p className="text-sm font-semibold text-foreground/80 mt-0.5 leading-snug">{r.value}</p>
                  </div>
                ))}
              {card.rows.every(r => !r.value) && (
                <p className="text-xs text-muted-foreground/40 italic">No data recorded.</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Edit Section ─────────────────────────────────────────────────────────────

function EditSection({ school, schoolId }: { school: SchoolDetails; schoolId: string }) {
  const [editTab, setEditTab] = useState('details');

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <Pencil className="h-4 w-4 text-primary/50" />
        <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Edit School Information
        </h2>
      </div>
      <Tabs value={editTab} onValueChange={setEditTab}>
        <TabsList className="flex w-max gap-1.5 bg-muted/20 p-1.5 rounded-2xl border border-border/50 mb-6">
          {[
            { id: 'details', label: 'School Details' },
            { id: 'contact', label: 'Contact' },
            { id: 'owner',   label: 'Owner' },
          ].map(t => (
            <TabsTrigger key={t.id} value={t.id}
              className="rounded-xl px-6 py-2.5 text-[10px] font-bold tracking-widest uppercase data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="details" className="mt-0">
          <SchoolDetailsForm school={school} schoolId={schoolId} />
        </TabsContent>
        <TabsContent value="contact" className="mt-0">
          <ContactForm school={school} schoolId={schoolId} />
        </TabsContent>
        <TabsContent value="owner" className="mt-0">
          <OwnerForm school={school} schoolId={schoolId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── School Details Form ──────────────────────────────────────────────────────

function SchoolDetailsForm({ school, schoolId }: { school: SchoolDetails; schoolId: string }) {
  const mutation = useUpdateSchool(schoolId);
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

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <Card className="erp-card overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-5 px-8">
        <div>
          <CardTitle className="text-lg font-bold">School Details</CardTitle>
          <CardDescription className="text-xs font-medium opacity-70 mt-0.5">Core institution information and identifiers.</CardDescription>
        </div>
        <Button
          onClick={() => mutation.mutate(form, { onError: (e: any) => alert(e.response?.data?.message || 'Update failed.') })}
          disabled={mutation.isPending}
          className="rounded-xl h-10 px-6 font-bold text-xs shadow-sm">
          <Save className="mr-2 h-4 w-4" />{mutation.isPending ? 'Saving…' : 'Save Changes'}
        </Button>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FG label="School Code"><Input value={form.schoolCode} onChange={set('schoolCode')} className="rounded-xl" /></FG>
          <FG label="School Name"><Input value={form.name} onChange={set('name')} className="rounded-xl" /></FG>
          <FG label="Address" className="md:col-span-2"><Input value={form.address} onChange={set('address')} className="rounded-xl" /></FG>
          <FG label="City"><Input value={form.city} onChange={set('city')} className="rounded-xl" /></FG>
          <FG label="State"><Input value={form.state} onChange={set('state')} className="rounded-xl" /></FG>
          <FG label="Pincode"><Input value={form.pincode} onChange={set('pincode')} className="rounded-xl" /></FG>
          <FG label="Country"><Input value={form.country} onChange={set('country')} className="rounded-xl" /></FG>
          <FG label="Affiliation"><Input value={form.schoolAffiliation} onChange={set('schoolAffiliation')} className="rounded-xl" /></FG>
          <FG label="Board"><Input value={form.schoolBoard} onChange={set('schoolBoard')} className="rounded-xl" /></FG>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Contact Form ─────────────────────────────────────────────────────────────

function ContactForm({ school, schoolId }: { school: SchoolDetails; schoolId: string }) {
  const mutation = useUpdateSchool(schoolId);
  const c = school.contactDetails;
  const [form, setForm] = useState({
    phone: c?.phone ?? '',
    alternatePhone: c?.alternatePhone ?? '',
    fax: c?.fax ?? '',
    email: c?.email ?? '',
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <Card className="erp-card overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-5 px-8">
        <div>
          <CardTitle className="text-lg font-bold">Contact Details</CardTitle>
          <CardDescription className="text-xs font-medium opacity-70 mt-0.5">School contact numbers and official email address.</CardDescription>
        </div>
        <Button
          onClick={() => mutation.mutate({ contactDetails: form }, { onError: (e: any) => alert(e.response?.data?.message || 'Update failed.') })}
          disabled={mutation.isPending}
          className="rounded-xl h-10 px-6 font-bold text-xs shadow-sm">
          <Save className="mr-2 h-4 w-4" />{mutation.isPending ? 'Saving…' : 'Save Changes'}
        </Button>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FG label="Primary Phone *"><Input value={form.phone} onChange={set('phone')} className="rounded-xl" /></FG>
          <FG label="Alternate Phone"><Input value={form.alternatePhone} onChange={set('alternatePhone')} placeholder="Optional" className="rounded-xl" /></FG>
          <FG label="Fax"><Input value={form.fax} onChange={set('fax')} placeholder="Optional" className="rounded-xl" /></FG>
          <FG label="Official Email *"><Input type="email" value={form.email} onChange={set('email')} className="rounded-xl" /></FG>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Owner Form ───────────────────────────────────────────────────────────────

function OwnerForm({ school, schoolId }: { school: SchoolDetails; schoolId: string }) {
  const saveMutation = useUpdateSchool(schoolId);
  const uploadMutation = useUploadOwnerImage(schoolId);
  const deleteMutation = useDeleteOwnerImage(schoolId);
  const fileRef = useRef<HTMLInputElement>(null);
  const o = school.ownerDetails;
  const imgBusy = uploadMutation.isPending || deleteMutation.isPending;
  const [form, setForm] = useState({
    firstName: o?.firstName ?? '',
    lastName: o?.lastName ?? '',
    address: o?.address ?? '',
    email: o?.email ?? '',
    phone: o?.phone ?? '',
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadMutation.mutate(file, { onError: () => alert('Upload failed.') });
    e.target.value = '';
  };

  const handleDeleteImg = () => {
    if (!confirm('Delete owner profile image?')) return;
    deleteMutation.mutate(undefined, { onError: () => alert('Delete failed.') });
  };

  return (
    <Card className="erp-card overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-5 px-8">
        <div>
          <CardTitle className="text-lg font-bold">Owner Details</CardTitle>
          <CardDescription className="text-xs font-medium opacity-70 mt-0.5">School owner & management contact information.</CardDescription>
        </div>
        <Button
          onClick={() => saveMutation.mutate({ ownerDetails: form }, { onError: (e: any) => alert(e.response?.data?.message || 'Update failed.') })}
          disabled={saveMutation.isPending}
          className="rounded-xl h-10 px-6 font-bold text-xs shadow-sm">
          <Save className="mr-2 h-4 w-4" />{saveMutation.isPending ? 'Saving…' : 'Save Changes'}
        </Button>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        {/* Owner avatar */}
        <div className="flex items-center gap-5">
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
                  className="text-foreground/70 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 hover:text-accent/90">
                  <Camera className="h-3 w-3" />{imgBusy ? 'Uploading…' : 'Upload'}
                </button>
                {o?.profileUrl && (
                  <button type="button" onClick={handleDeleteImg}
                    className="text-destructive/50 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 hover:text-destructive/70">
                    <Trash2 className="h-3 w-3" />Remove
                  </button>
                )}
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </div>
          <div>
            <p className="font-bold text-foreground">{o?.firstName} {o?.lastName}</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">{o?.email}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">School Owner</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FG label="First Name"><Input value={form.firstName} onChange={set('firstName')} className="rounded-xl" /></FG>
          <FG label="Last Name"><Input value={form.lastName} onChange={set('lastName')} className="rounded-xl" /></FG>
          <FG label="Address" className="md:col-span-2"><Input value={form.address} onChange={set('address')} className="rounded-xl" /></FG>
          <FG label="Email"><Input type="email" value={form.email} onChange={set('email')} placeholder="Optional" className="rounded-xl" /></FG>
          <FG label="Phone"><Input value={form.phone} onChange={set('phone')} className="rounded-xl" /></FG>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function FG({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6 animate-pulse">
      <div className="h-44 rounded-2xl bg-muted" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-40 rounded-2xl bg-muted" />)}
      </div>
      <div className="h-12 w-64 rounded-2xl bg-muted" />
      <div className="h-80 rounded-2xl bg-muted" />
    </div>
  );
}
