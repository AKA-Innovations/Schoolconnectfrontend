'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useSchool,
  useUpdateAdministrator,
  useUploadAdminImage,
  useDeleteAdminImage,
  useAdministratorBySchool,
} from '@/hooks/useSchool';
import { useAuthStore } from '@/store/authStore';
import { AdministratorDetails, UpdateAdministratorPayload } from '@/services/school.service';
import { User as UserIcon, Camera, Trash2, Save, RefreshCw,
  Shield, Building2, Mail, Phone,
} from 'lucide-react';
import { User } from '@/types/roles';
import { cn } from '@/lib/utils';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminProfilePage() {
  const { user, schoolId } = useAuthStore();
  const { data: school, isLoading: schoolLoading } = useSchool(schoolId);
  const {
    data: adminData,
    isLoading: adminLoading,
    refetch: refetchAdmin,
  } = useAdministratorBySchool(school?.schoolCode);

  const isLoading = schoolLoading || (!!school?.schoolCode && adminLoading);

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8 animate-in fade-in duration-500">
        <HeroCard
          user={user}
          admin={adminData ?? null}
          schoolName={school?.name}
          onRefresh={refetchAdmin}
        />
        {user?.id && (
          <EditCard
            adminId={user.id}
            schoolId={school?.id ?? ''}
            initialData={adminData ?? null}
            onSaved={refetchAdmin}
          />
        )}
      </div>
    </div>
  );
}

// ─── Hero Card ────────────────────────────────────────────────────────────────

function HeroCard({
  user, admin, schoolName, onRefresh,
}: {
  user: User | null;
  admin: AdministratorDetails | null;
  schoolName?: string;
  onRefresh: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadAdminImage(user?.id ?? '');
  const deleteMutation = useDeleteAdminImage(user?.id ?? '');
  const busy = uploadMutation.isPending || deleteMutation.isPending;

  const displayName = admin
    ? `${admin.firstName ?? ''} ${admin.lastName ?? ''}`.trim()
    : (user?.name ?? 'Administrator');
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadMutation.mutate(file, {
      onSuccess: onRefresh,
      onError: () => alert('Upload failed.'),
    });
    e.target.value = '';
  };

  const handleDelete = () => {
    if (!confirm('Delete profile photo?')) return;
    deleteMutation.mutate(undefined, {
      onSuccess: onRefresh,
      onError: () => alert('Delete failed.'),
    });
  };

  return (
    <Card className="erp-card overflow-hidden">
      {/* Accent strip */}
      <div className="h-1.5 bg-gradient-to-r from-secondary via-primary/70 to-primary" />

      <div className="p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative">
        {/* Avatar */}
        <div className="shrink-0 relative group cursor-pointer">
          <div className="h-28 w-28 rounded-2xl overflow-hidden border-4 border-background shadow-md bg-primary/10 flex items-center justify-center">
            {admin?.profileUrl ? (
              <img src={admin.profileUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-extrabold text-primary/60">{initials || <UserIcon className="h-10 w-10" />}</span>
            )}
            <div className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <button type="button" onClick={() => fileRef.current?.click()}
                className="text-white text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 hover:text-blue-300 transition-colors">
                <Camera className="h-3 w-3" />{busy ? 'Uploading…' : 'Upload'}
              </button>
              {admin?.profileUrl && (
                <button type="button" onClick={handleDelete}
                  className="text-red-300 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 hover:text-red-200 transition-colors">
                  <Trash2 className="h-3 w-3" />Remove
                </button>
              )}
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          {/* Role dot */}
          <div className="absolute -bottom-1.5 -right-1.5 h-7 w-7 rounded-full bg-primary border-2 border-background shadow-sm flex items-center justify-center">
            <Shield className="h-3.5 w-3.5 text-white" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left space-y-3 min-w-0">
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            <span className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest">
              School Admin
            </span>
            {admin?.employeeId && (
              <span className="bg-muted/60 text-muted-foreground border border-border/60 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest">
                {admin.employeeId}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{displayName}</h1>

          {user?.username && (
            <p className="text-sm text-muted-foreground/60 font-medium">@{user.username}</p>
          )}

          <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-1.5 text-muted-foreground/70 text-xs font-semibold">
            {(admin?.email) && (
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 opacity-50 text-primary" />
                {admin.email}
              </span>
            )}
            {admin?.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 opacity-50 text-primary" />
                {admin.phone}
              </span>
            )}
            {schoolName && (
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 opacity-50 text-primary" />
                {schoolName}
              </span>
            )}
          </div>
        </div>

        {/* Refresh */}
        <div className="absolute top-4 right-4">
          <Button variant="secondary" size="icon" onClick={onRefresh}
            className="rounded-xl h-10 w-10 border border-border/50 bg-background/70 hover:bg-background"
            title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ─── Edit Card ────────────────────────────────────────────────────────────────

function EditCard({
  adminId, schoolId, initialData, onSaved,
}: {
  adminId: string;
  schoolId: string;
  initialData: AdministratorDetails | null;
  onSaved: () => void;
}) {
  const updateMutation = useUpdateAdministrator(adminId, schoolId);
  const [initialized, setInitialized] = useState(false);
  const [form, setForm] = useState<UpdateAdministratorPayload>({
    employeeId: '',
    firstName: '',
    lastName: '',
    address: '',
    email: '',
    phone: '',
  });

  // Pre-fill once admin data loads
  useEffect(() => {
    if (initialData && !initialized) {
      setForm({
        employeeId: initialData.employeeId ?? '',
        firstName:  initialData.firstName ?? '',
        lastName:   initialData.lastName ?? '',
        address:    initialData.address ?? '',
        email:      initialData.email ?? '',
        phone:      initialData.phone ?? '',
      });
      setInitialized(true);
    }
  }, [initialData, initialized]);

  const set = (k: keyof UpdateAdministratorPayload) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = () => {
    updateMutation.mutate(form, {
      onSuccess: onSaved,
      onError: (e: any) => alert(e.response?.data?.message || 'Update failed.'),
    });
  };

  return (
    <Card className="erp-card overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-5 px-8">
        <div>
          <CardTitle className="text-lg font-bold">Edit Profile</CardTitle>
          <CardDescription className="text-xs font-medium opacity-70 mt-0.5">
            Update your administrator account details.
          </CardDescription>
        </div>
        <Button onClick={handleSave} disabled={updateMutation.isPending}
          className="rounded-xl h-10 px-6 font-bold text-xs shadow-sm">
          <Save className="mr-2 h-4 w-4" />{updateMutation.isPending ? 'Saving…' : 'Save Changes'}
        </Button>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FG label="Employee ID" className="md:col-span-2">
            <Input value={form.employeeId ?? ''} onChange={set('employeeId')} placeholder="EMP-001" className="rounded-xl" />
          </FG>
          <FG label="First Name">
            <Input value={form.firstName ?? ''} onChange={set('firstName')} className="rounded-xl" />
          </FG>
          <FG label="Last Name">
            <Input value={form.lastName ?? ''} onChange={set('lastName')} className="rounded-xl" />
          </FG>
          <FG label="Email">
            <Input type="email" value={form.email ?? ''} onChange={set('email')} className="rounded-xl" />
          </FG>
          <FG label="Phone">
            <Input value={form.phone ?? ''} onChange={set('phone')} className="rounded-xl" />
          </FG>
          <FG label="Address" className="md:col-span-2">
            <Input value={form.address ?? ''} onChange={set('address')} className="rounded-xl" />
          </FG>
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
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6 animate-pulse">
      <div className="h-44 rounded-2xl bg-muted" />
      <div className="h-72 rounded-2xl bg-muted" />
    </div>
  );
}
