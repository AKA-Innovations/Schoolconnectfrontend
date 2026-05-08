'use client';

import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useTeacher, useUpdateTeacher, useUploadTeacherImage, useDeleteTeacherImage,
  useAddAddress, useUpdateAddress, useDeleteAddress,
  useAddClass, useUpdateClass, useDeleteClass,
  useUpdateSchoolRecord } from '@/hooks/useTeachers';
import { useSubjectDetails, useCreateSubjectDetail, useDeleteSubjectDetail, useSubjectOptions, useClassSectionLists } from '@/hooks/useClasses';
import { Teacher, Address, TeacherClass, SchoolRecord } from '@/types/roles';
import { SubjectDetail } from '@/types/class.types';
import { CURRENT_SESSION } from '@/lib/constants';
import {
  ArrowLeft, Save, Plus, Trash2, MapPin, BookOpen, Briefcase,
  Users, Mail, Phone, Calendar, ShieldCheck, Activity,
  Edit2, CheckCircle2, Camera, RefreshCw, GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeacherDetailsViewProps {
  teacherId: string;
  onBack: () => void;
}

// ─── Root Component ──────────────────────────────────────────────────────────

export function TeacherDetailsView({ teacherId, onBack }: TeacherDetailsViewProps) {
  const [activeTab, setActiveTab] = useState('personal');
  const { data: teacher, isLoading, isFetching, refetch } = useTeacher(teacherId);

  if (isLoading) {
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
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">

      {/* Header / Profile Card */}
      <Card className="erp-card overflow-hidden">
        <div className="relative p-6 sm:p-8 bg-card flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
          <ProfileImageSection teacher={teacher} teacherId={teacherId} />
          <div className="flex-1 text-center md:text-left space-y-1.5">
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-1.5">
              <span className="bg-muted/30 text-muted-foreground px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border border-border/40">
                {teacher.employeeId}
              </span>
              <span className={cn(
                'px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border',
                teacher.status === 'active'
                  ? 'bg-green-500/10 text-green-600 border-green-500/20'
                  : 'bg-red-500/10 text-red-600 border-red-500/20'
              )}>
                {teacher.status}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {teacher.firstName} {teacher.lastName}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-x-5 gap-y-1.5 text-muted-foreground/70 mt-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <Mail className="h-3.5 w-3.5 opacity-40 text-primary" />
                {teacher.employeeEmail}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <Phone className="h-3.5 w-3.5 opacity-40 text-primary" />
                {teacher.mobileNumber}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <Calendar className="h-3.5 w-3.5 opacity-40 text-primary" />
                Joined {teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—'}
              </div>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
              {teacher.isPrincipal && <RoleBadge label="Principal" color="purple" />}
              {teacher.isCoordinator && <RoleBadge label="Coordinator" color="blue" />}
              {teacher.isClassTeacher && <RoleBadge label="Class Teacher" color="orange" />}
              {teacher.isSubjectTeacher && <RoleBadge label="Subject Teacher" color="green" />}
            </div>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <Button variant="secondary" size="icon" onClick={() => refetch()}
              className="rounded-xl h-10 w-10 shadow-sm border border-border/50 bg-background/50 hover:bg-background"
              title="Refresh">
              <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
            </Button>
            <Button variant="secondary" size="icon" onClick={onBack}
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
            {[
              { id: 'personal',     label: 'Identity'      },
              { id: 'employment',   label: 'Employment'    },
              { id: 'pedagogical',  label: 'Pedagogical'   },
              { id: 'classes',      label: 'Classes'       },
              { id: 'addresses',    label: 'Addresses'     },
              { id: 'extended',     label: 'Extended Data' },
            ].map(tab => (
              <TabsTrigger key={tab.id} value={tab.id}
                className="rounded-xl px-6 py-2.5 text-[10px] font-bold tracking-widest uppercase data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <div className="mt-6">
          <TabsContent value="personal"    className="mt-0"><PersonalDetailsForm teacher={teacher} teacherId={teacherId} /></TabsContent>
          <TabsContent value="employment"  className="mt-0"><EmploymentForm teacher={teacher} teacherId={teacherId} /></TabsContent>
          <TabsContent value="pedagogical" className="mt-0"><PedagogicalSection teacherId={teacherId} /></TabsContent>
          <TabsContent value="classes"     className="mt-0"><ClassesSection teacherId={teacherId} classes={teacher.classes || []} /></TabsContent>
          <TabsContent value="addresses"   className="mt-0"><AddressSection teacherId={teacherId} addresses={teacher.addresses || []} /></TabsContent>
          <TabsContent value="extended"    className="mt-0"><ExtendedDataSection teacher={teacher} teacherId={teacherId} /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// ─── Profile Image (PUT + DELETE /teacher/:id/profile-image) ─────────────────

function ProfileImageSection({ teacher, teacherId }: { teacher: Teacher; teacherId: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadTeacherImage(teacherId);
  const deleteMutation = useDeleteTeacherImage(teacherId);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadMutation.mutate(file, {
      onError: () => alert('Upload failed.'),
    });
    e.target.value = '';
  };

  const handleDelete = () => {
    if (!confirm('Delete profile image?')) return;
    deleteMutation.mutate(undefined, {
      onError: () => alert('Delete failed.'),
    });
  };

  const busy = uploadMutation.isPending || deleteMutation.isPending;

  return (
    <div className="shrink-0 relative group cursor-pointer">
      <div className="h-28 w-28 rounded-2xl bg-muted/10 flex items-center justify-center overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border border-border/50">
        {teacher.profileImageUrl ? (
          <img src={teacher.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <div className="text-primary/60 font-bold text-3xl uppercase tracking-tighter">
            {(teacher.firstName ?? '?').charAt(0)}{(teacher.lastName ?? '').charAt(0)}
          </div>
        )}
        <div className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
          <button type="button" onClick={() => fileRef.current?.click()}
            className="text-white text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 hover:text-blue-300 transition-colors">
            <Camera className="h-3 w-3" />
            {busy ? 'Uploading…' : 'Upload'}
          </button>
          {teacher.profileImageUrl && (
            <button type="button" onClick={handleDelete}
              className="text-red-300 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 hover:text-red-200 transition-colors">
              <Trash2 className="h-3 w-3" />Remove
            </button>
          )}
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-2 border-card shadow-sm flex items-center justify-center">
        <ShieldCheck className="h-3 w-3 text-white" />
      </div>
    </div>
  );
}

// ─── Personal Identity Form (PUT /teacher/:id/details) ───────────────────────

function PersonalDetailsForm({ teacher, teacherId }: { teacher: Teacher; teacherId: string }) {
  const updateMutation = useUpdateTeacher(teacherId);
  const [form, setForm] = useState({
    firstName: teacher.firstName ?? '',
    lastName: teacher.lastName ?? '',
    dateOfBirth: teacher.dateOfBirth ? new Date(teacher.dateOfBirth).toISOString().slice(0, 10) : '',
    gender: teacher.gender ?? '',
    mobileNumber: teacher.mobileNumber ?? '',
    alternateMobileNumber: teacher.alternateMobileNumber ?? '',
    emailId: teacher.emailId ?? '',
    isPrincipal: teacher.isPrincipal ?? false,
    isCoordinator: teacher.isCoordinator ?? false,
    isClassTeacher: teacher.isClassTeacher ?? false,
    isSubjectTeacher: teacher.isSubjectTeacher ?? false,
  });

  const handleSave = () => {
    updateMutation.mutate(
      { ...form, alternateMobileNumber: form.alternateMobileNumber || undefined },
      { onError: (err: any) => alert(err.response?.data?.message || 'Update failed.') }
    );
  };

  return (
    <Card className="erp-card overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-6 px-8">
        <div>
          <CardTitle className="text-xl font-bold tracking-tight">Personal Identity</CardTitle>
          <CardDescription className="text-xs font-medium opacity-70 mt-1">Core identity fields and role assignments.</CardDescription>
        </div>
        <Button onClick={handleSave} disabled={updateMutation.isPending} className="rounded-xl h-10 px-6 font-bold shadow-sm text-xs">
          <Save className="mr-2 h-4 w-4" />{updateMutation.isPending ? 'Saving…' : 'Save Changes'}
        </Button>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FieldGroup label="First Name"><Input value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} className="rounded-xl" /></FieldGroup>
          <FieldGroup label="Last Name"><Input value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} className="rounded-xl" /></FieldGroup>
          <FieldGroup label="Date of Birth"><Input type="date" value={form.dateOfBirth} onChange={e => setForm(p => ({ ...p, dateOfBirth: e.target.value }))} className="rounded-xl" /></FieldGroup>
          <FieldGroup label="Gender">
            <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
              className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </FieldGroup>
          <FieldGroup label="Mobile Number"><Input value={form.mobileNumber} onChange={e => setForm(p => ({ ...p, mobileNumber: e.target.value }))} className="rounded-xl" /></FieldGroup>
          <FieldGroup label="Alternate Mobile (optional)"><Input value={form.alternateMobileNumber} onChange={e => setForm(p => ({ ...p, alternateMobileNumber: e.target.value }))} placeholder="Optional" className="rounded-xl" /></FieldGroup>
          <FieldGroup label="Personal Email" className="md:col-span-2"><Input type="email" value={form.emailId} onChange={e => setForm(p => ({ ...p, emailId: e.target.value }))} className="rounded-xl" /></FieldGroup>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Institutional Roles</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {([
              { key: 'isPrincipal',    label: 'Principal'       },
              { key: 'isCoordinator',  label: 'Coordinator'     },
              { key: 'isClassTeacher', label: 'Class Teacher'   },
              { key: 'isSubjectTeacher', label: 'Subject Teacher' },
            ] as const).map(r => (
              <button key={r.key} type="button"
                onClick={() => setForm(p => ({ ...p, [r.key]: !(p as any)[r.key] }))}
                className={cn(
                  'flex items-center justify-between p-3 rounded-xl border text-left text-xs font-bold transition-all',
                  (form as any)[r.key] ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/30 border-border/50 hover:bg-muted/50'
                )}>
                {r.label}
                {(form as any)[r.key] && <CheckCircle2 className="h-4 w-4 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Employment / School Record Form (PUT /teacher/school-record/:recordId) ───

function EmploymentForm({ teacher, teacherId }: { teacher: Teacher; teacherId: string }) {
  const record = teacher.schoolRecords?.[0];
  const updateRecordMutation = useUpdateSchoolRecord(teacherId);
  const [form, setForm] = useState({
    employeeId: record?.employeeId ?? teacher.employeeId ?? '',
    joiningDate: record?.joiningDate ? new Date(record.joiningDate).toISOString().slice(0, 10) : '',
    employeeEmail: record?.employeeEmail ?? teacher.employeeEmail ?? '',
  });

  const handleSave = () => {
    if (!record?.id) { alert('No school record found for this teacher.'); return; }
    updateRecordMutation.mutate(
      { recordId: record.id, data: form },
      { onError: (err: any) => alert(err.response?.data?.message || 'Update failed.') }
    );
  };

  return (
    <Card className="erp-card overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-6 px-8">
        <div>
          <CardTitle className="text-xl font-bold tracking-tight">Employment Record</CardTitle>
          <CardDescription className="text-xs font-medium opacity-70 mt-1">School employment details and official contact.</CardDescription>
        </div>
        <Button onClick={handleSave} disabled={updateRecordMutation.isPending} className="rounded-xl h-10 px-6 font-bold shadow-sm text-xs">
          <Save className="mr-2 h-4 w-4" />{updateRecordMutation.isPending ? 'Saving…' : 'Save Changes'}
        </Button>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FieldGroup label="Employee ID"><Input value={form.employeeId} onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))} className="rounded-xl" /></FieldGroup>
          <FieldGroup label="Joining Date"><Input type="date" value={form.joiningDate} onChange={e => setForm(p => ({ ...p, joiningDate: e.target.value }))} className="rounded-xl" /></FieldGroup>
          <FieldGroup label="Professional Email" className="md:col-span-2"><Input type="email" value={form.employeeEmail} onChange={e => setForm(p => ({ ...p, employeeEmail: e.target.value }))} className="rounded-xl" /></FieldGroup>
        </div>
        {!record?.id && (
          <p className="mt-4 text-xs text-destructive font-semibold">No school record found — cannot save changes.</p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Address Section (POST + PUT + DELETE /teacher/address) ──────────────────

type AddrFields = Omit<Address, 'id'>;
const emptyAddr = (): AddrFields => ({ isPermanent: false, address: '', state: '', city: '', country: '', pincode: '', googleAddressUrl: '', latitude: '', longitude: '' });

function AddressSection({ teacherId, addresses }: { teacherId: string; addresses: Address[] }) {
  const addAddrMutation = useAddAddress(teacherId);
  const updateAddrMutation = useUpdateAddress(teacherId);
  const deleteAddrMutation = useDeleteAddress(teacherId);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newAddr, setNewAddr] = useState<AddrFields>(emptyAddr());
  const [editAddr, setEditAddr] = useState<AddrFields>(emptyAddr());

  const saving = addAddrMutation.isPending || updateAddrMutation.isPending || deleteAddrMutation.isPending;

  const handleAdd = () => {
    if (!newAddr.address || !newAddr.city || !newAddr.state || !newAddr.country || !newAddr.pincode) { alert('Please fill in all required fields.'); return; }
    addAddrMutation.mutate(newAddr, {
      onSuccess: () => { setShowAdd(false); setNewAddr(emptyAddr()); },
      onError: (err: any) => alert(err.response?.data?.message || 'Failed to save address.'),
    });
  };

  const handleUpdate = (id: number) => {
    updateAddrMutation.mutate({ id, addr: editAddr }, {
      onSuccess: () => setEditingId(null),
      onError: (err: any) => alert(err.response?.data?.message || 'Failed to update address.'),
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm('Delete this address?')) return;
    deleteAddrMutation.mutate(id, {
      onError: (err: any) => alert(err.response?.data?.message || 'Failed to delete address.'),
    });
  };

  return (
    <Card className="erp-card overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-6 px-8">
        <div>
          <CardTitle className="text-xl font-bold tracking-tight">Addresses</CardTitle>
          <CardDescription className="text-xs font-medium opacity-70 mt-1">Physical residency and contact locations.</CardDescription>
        </div>
        <Button variant="secondary" size="sm" className="rounded-xl h-10 px-6 font-bold text-xs border border-border/50"
          onClick={() => { setShowAdd(v => !v); setEditingId(null); }}>
          <Plus className="mr-2 h-4 w-4" />{showAdd ? 'Cancel' : 'Add Address'}
        </Button>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        {showAdd && <AddressForm data={newAddr} onChange={setNewAddr} onSave={handleAdd} onCancel={() => setShowAdd(false)} saving={saving} mode="add" />}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map(addr => (
            <div key={addr.id}>
              {editingId === addr.id ? (
                <AddressForm data={editAddr} onChange={setEditAddr} onSave={() => handleUpdate(addr.id)} onCancel={() => setEditingId(null)} saving={saving} mode="edit" />
              ) : (
                <div className="relative p-6 rounded-2xl bg-muted/5 border border-border/50 group hover:border-primary/40 hover:bg-background transition-all">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary/70 shrink-0 group-hover:scale-110 transition-transform">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-foreground/80">{addr.city}, {addr.state}</h4>
                        {addr.isPermanent && <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border border-primary/20">Permanent</span>}
                      </div>
                      <p className="text-sm text-muted-foreground/80 leading-relaxed">{addr.address}</p>
                      <div className="flex items-center gap-4 pt-1">
                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">{addr.country}</span>
                        <span className="text-[10px] font-bold text-primary/40">{addr.pincode}</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-muted"
                      onClick={() => { setEditingId(addr.id); setEditAddr({ isPermanent: addr.isPermanent, address: addr.address, state: addr.state, city: addr.city, country: addr.country, pincode: addr.pincode, googleAddressUrl: addr.googleAddressUrl ?? '', latitude: addr.latitude ?? '', longitude: addr.longitude ?? '' }); setShowAdd(false); }}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => handleDelete(addr.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {addresses.length === 0 && !showAdd && (
            <div className="col-span-full py-12 text-center text-muted-foreground/40 bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-[10px] font-bold uppercase tracking-widest">No addresses registered.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AddressForm({ data, onChange, onSave, onCancel, saving, mode }: {
  data: AddrFields; onChange: (d: AddrFields) => void; onSave: () => void; onCancel: () => void; saving: boolean; mode: 'add' | 'edit';
}) {
  return (
    <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5 space-y-4">
      <h4 className="text-xs font-bold uppercase tracking-widest text-primary/70">{mode === 'add' ? 'New Address' : 'Edit Address'}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Street Address *</Label>
          <Input value={data.address} onChange={e => onChange({ ...data, address: e.target.value })} placeholder="123 Main Street" className="mt-1 rounded-xl" />
        </div>
        <div>
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">City *</Label>
          <Input value={data.city} onChange={e => onChange({ ...data, city: e.target.value })} placeholder="City" className="mt-1 rounded-xl" />
        </div>
        <div>
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">State *</Label>
          <Input value={data.state} onChange={e => onChange({ ...data, state: e.target.value })} placeholder="State" className="mt-1 rounded-xl" />
        </div>
        <div>
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Country *</Label>
          <Input value={data.country} onChange={e => onChange({ ...data, country: e.target.value })} placeholder="Country" className="mt-1 rounded-xl" />
        </div>
        <div>
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Pincode *</Label>
          <Input value={data.pincode} onChange={e => onChange({ ...data, pincode: e.target.value })} placeholder="000000" className="mt-1 rounded-xl" />
        </div>
        <div className="md:col-span-2 flex items-center gap-3">
          <input type="checkbox" id="addrIsPermanent" checked={!!data.isPermanent} onChange={e => onChange({ ...data, isPermanent: e.target.checked })} className="h-4 w-4 rounded" />
          <Label htmlFor="addrIsPermanent" className="text-xs font-semibold cursor-pointer">Mark as Permanent Address</Label>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" size="sm" className="rounded-xl" onClick={onCancel}>Cancel</Button>
        <Button size="sm" className="rounded-xl" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : mode === 'add' ? 'Add Address' : 'Update Address'}</Button>
      </div>
    </div>
  );
}

// ─── Classes Section (POST + PUT + DELETE /teacher/class) ────────────────────

function ClassesSection({ teacherId, classes }: { teacherId: string; classes: TeacherClass[] }) {
  const addClassMutation = useAddClass(teacherId);
  const updateClassMutation = useUpdateClass(teacherId);
  const deleteClassMutation = useDeleteClass(teacherId);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const emptyClass = (): TeacherClass => ({ className: '', sectionName: '', subjectName: '' });
  const [newClass, setNewClass] = useState<TeacherClass>(emptyClass());
  const [editClass, setEditClass] = useState<TeacherClass>(emptyClass());

  const saving = addClassMutation.isPending || updateClassMutation.isPending || deleteClassMutation.isPending;

  const handleAdd = () => {
    if (!newClass.className || !newClass.sectionName || !newClass.subjectName) { alert('Please fill in all fields.'); return; }
    addClassMutation.mutate(newClass, {
      onSuccess: () => { setShowAdd(false); setNewClass(emptyClass()); },
      onError: (err: any) => alert(err.response?.data?.message || 'Failed to add class.'),
    });
  };

  const handleUpdate = (id: number) => {
    updateClassMutation.mutate({ id, cls: editClass }, {
      onSuccess: () => setEditingId(null),
      onError: (err: any) => alert(err.response?.data?.message || 'Failed to update class.'),
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm('Remove this class assignment?')) return;
    deleteClassMutation.mutate(id, {
      onError: (err: any) => alert(err.response?.data?.message || 'Failed to delete class.'),
    });
  };

  return (
    <Card className="erp-card overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-6 px-8">
        <div>
          <CardTitle className="text-xl font-bold tracking-tight">Class Assignments</CardTitle>
          <CardDescription className="text-xs font-medium opacity-70 mt-1">Academic load and instructional assignments.</CardDescription>
        </div>
        <Button variant="secondary" size="sm" className="rounded-xl h-10 px-6 font-bold text-xs border border-border/50"
          onClick={() => { setShowAdd(v => !v); setEditingId(null); }}>
          <Plus className="mr-2 h-4 w-4" />{showAdd ? 'Cancel' : 'Add Class'}
        </Button>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        {showAdd && <ClassForm data={newClass} onChange={setNewClass} onSave={handleAdd} onCancel={() => setShowAdd(false)} saving={saving} mode="add" />}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map(cls => (
            <div key={cls.id}>
              {editingId === cls.id ? (
                <ClassForm data={editClass} onChange={setEditClass} onSave={() => cls.id !== undefined && handleUpdate(cls.id)} onCancel={() => setEditingId(null)} saving={saving} mode="edit" />
              ) : (
                <div className="p-5 rounded-2xl bg-muted/5 border border-border/50 group hover:border-primary/40 hover:bg-background transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600/70 group-hover:scale-110 transition-transform">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-muted"
                        onClick={() => { setEditingId(cls.id!); setEditClass({ className: cls.className, sectionName: cls.sectionName, subjectName: cls.subjectName }); setShowAdd(false); }}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10"
                        onClick={() => cls.id !== undefined && handleDelete(cls.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <h4 className="font-bold text-foreground/80">{cls.className} — {cls.sectionName}</h4>
                  <p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest mt-1.5">{cls.subjectName}</p>
                </div>
              )}
            </div>
          ))}
          {classes.length === 0 && !showAdd && (
            <div className="col-span-full py-12 text-center text-muted-foreground/40 bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-[10px] font-bold uppercase tracking-widest">No class assignments.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ClassForm({ data, onChange, onSave, onCancel, saving, mode }: {
  data: TeacherClass; onChange: (d: TeacherClass) => void; onSave: () => void; onCancel: () => void; saving: boolean; mode: 'add' | 'edit';
}) {
  return (
    <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5 space-y-4">
      <h4 className="text-xs font-bold uppercase tracking-widest text-primary/70">{mode === 'add' ? 'New Assignment' : 'Edit Assignment'}</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Class *</Label>
          <Input value={data.className} onChange={e => onChange({ ...data, className: e.target.value })} placeholder="Grade 10" className="mt-1 rounded-xl" />
        </div>
        <div>
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Section *</Label>
          <Input value={data.sectionName} onChange={e => onChange({ ...data, sectionName: e.target.value })} placeholder="A" className="mt-1 rounded-xl" />
        </div>
        <div>
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Subject *</Label>
          <Input value={data.subjectName} onChange={e => onChange({ ...data, subjectName: e.target.value })} placeholder="Mathematics" className="mt-1 rounded-xl" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" size="sm" className="rounded-xl" onClick={onCancel}>Cancel</Button>
        <Button size="sm" className="rounded-xl" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : mode === 'add' ? 'Add Class' : 'Update Class'}</Button>
      </div>
    </div>
  );
}

// ─── Extended Data (PUT /teacher/:id/details — JSON blob fields) ─────────────

function ExtendedDataSection({ teacher, teacherId }: { teacher: Teacher; teacherId: string }) {
  const updateMutation = useUpdateTeacher(teacherId);
  const [fields, setFields] = useState({
    teacherPersonalData: JSON.stringify(teacher.teacherPersonalData ?? {}, null, 2),
    teacherAcademicData: JSON.stringify(teacher.teacherAcademicData ?? {}, null, 2),
    teacherProfessionalData: JSON.stringify(teacher.teacherProfessionalData ?? {}, null, 2),
    teacherFamilyDetails: JSON.stringify(teacher.teacherFamilyDetails ?? {}, null, 2),
  });

  const tryParse = (val: string) => { try { return JSON.parse(val); } catch { return undefined; } };

  const handleSave = async () => {
    const payload: Record<string, any> = {};
    const entries: [string, string][] = [
      ['teacherPersonalData', fields.teacherPersonalData],
      ['teacherAcademicData', fields.teacherAcademicData],
      ['teacherProfessionalData', fields.teacherProfessionalData],
      ['teacherFamilyDetails', fields.teacherFamilyDetails],
    ];
    for (const [key, raw] of entries) {
      const parsed = tryParse(raw);
      if (parsed === undefined) { alert(`Invalid JSON in ${key}`); return; }
      payload[key] = parsed;
    }
    updateMutation.mutate(payload, {
      onError: (err: any) => alert(err.response?.data?.message || 'Save failed.'),
    });
  };

  const sections = [
    { key: 'teacherPersonalData',     label: 'Personal Data'      },
    { key: 'teacherAcademicData',     label: 'Academic Data'      },
    { key: 'teacherProfessionalData', label: 'Professional Data'  },
    { key: 'teacherFamilyDetails',    label: 'Family Details'     },
  ];

  return (
    <Card className="erp-card overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-6 px-8">
        <div>
          <CardTitle className="text-xl font-bold tracking-tight">Extended Data</CardTitle>
          <CardDescription className="text-xs font-medium opacity-70 mt-1">Additional JSON records for personal, academic, professional, and family data.</CardDescription>
        </div>
        <Button onClick={handleSave} disabled={updateMutation.isPending} className="rounded-xl h-10 px-6 font-bold shadow-sm text-xs">
          <Save className="mr-2 h-4 w-4" />{updateMutation.isPending ? 'Saving…' : 'Save All'}
        </Button>
      </CardHeader>
      <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map(s => (
          <div key={s.key} className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{s.label}</Label>
            <textarea
              className="w-full min-h-[200px] p-4 bg-muted/10 border border-border/50 rounded-xl font-mono text-[11px] resize-y outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed"
              value={(fields as any)[s.key]}
              onChange={e => setFields(prev => ({ ...prev, [s.key]: e.target.value }))}
              spellCheck={false}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Pedagogical Mapping Section (GET/POST/DELETE /class/subject-dtls) ───────

function PedagogicalSection({ teacherId }: { teacherId: string }) {
  const { data: allDetails, isLoading } = useSubjectDetails();
  const { data: subjectOptsData } = useSubjectOptions();
  const { data: classSectionsData } = useClassSectionLists();
  const createMutation = useCreateSubjectDetail();
  const deleteMutation = useDeleteSubjectDetail();

  const [showAdd, setShowAdd] = useState(false);
  const [newMapping, setNewMapping] = useState({ className: '', sectionName: '', subjectName: '' });

  const mappings: SubjectDetail[] = (allDetails ?? []).filter((d: SubjectDetail) => d.teacherId === teacherId);

  const classNames: string[] = Array.from(new Set(
    (classSectionsData ?? []).map((s: any) => String(s.className))
  )).sort() as string[];

  const sectionsForClass: string[] = Array.from(new Set(
    (classSectionsData ?? [])
      .filter((s: any) => String(s.className) === newMapping.className)
      .map((s: any) => String(s.sectionName))
  )).sort() as string[];

  const subjectNamesForClass: string[] = Array.from(new Set(
    (subjectOptsData ?? [])
      .filter((s: any) => String(s.className) === newMapping.className)
      .map((s: any) => String(s.subjectName))
  )).sort() as string[];

  const handleAdd = () => {
    if (!newMapping.className || !newMapping.sectionName || !newMapping.subjectName) {
      alert('Please select class, section, and subject.'); return;
    }
    createMutation.mutate(
      { session: CURRENT_SESSION, teacherId, ...newMapping },
      {
        onSuccess: () => { setShowAdd(false); setNewMapping({ className: '', sectionName: '', subjectName: '' }); },
        onError: (err: any) => alert(err.response?.data?.message || 'Failed to create mapping.'),
      }
    );
  };

  const handleDelete = (id: number) => {
    if (!confirm('Remove this pedagogical mapping?')) return;
    deleteMutation.mutate(id, {
      onError: (err: any) => alert(err.response?.data?.message || 'Failed to delete mapping.'),
    });
  };

  return (
    <Card className="erp-card overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between py-6 px-8">
        <div>
          <CardTitle className="text-xl font-bold tracking-tight">Pedagogical Mapping</CardTitle>
          <CardDescription className="text-xs font-medium opacity-70 mt-1">
            Subject assignments for the current session ({CURRENT_SESSION}).
          </CardDescription>
        </div>
        <Button variant="secondary" size="sm" className="rounded-xl h-10 px-6 font-bold text-xs border border-border/50"
          onClick={() => setShowAdd(v => !v)}>
          <Plus className="mr-2 h-4 w-4" />{showAdd ? 'Cancel' : 'Add Mapping'}
        </Button>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        {showAdd && (
          <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary/70">New Mapping</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Class *</Label>
                <select
                  value={newMapping.className}
                  onChange={e => setNewMapping({ className: e.target.value, sectionName: '', subjectName: '' })}
                  className="mt-1 w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Select class</option>
                  {classNames.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Section *</Label>
                <select
                  value={newMapping.sectionName}
                  onChange={e => setNewMapping(p => ({ ...p, sectionName: e.target.value, subjectName: '' }))}
                  className="mt-1 w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={!newMapping.className}>
                  <option value="">Select section</option>
                  {sectionsForClass.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Subject *</Label>
                <select
                  value={newMapping.subjectName}
                  onChange={e => setNewMapping(p => ({ ...p, subjectName: e.target.value }))}
                  className="mt-1 w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={!newMapping.className}>
                  <option value="">Select subject</option>
                  {subjectNamesForClass.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button size="sm" className="rounded-xl" onClick={handleAdd} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Saving…' : 'Add Mapping'}
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-28 rounded-2xl bg-muted/20 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mappings.map((m: SubjectDetail) => (
              <div key={m.id} className="p-5 rounded-2xl bg-muted/5 border border-border/50 group hover:border-primary/40 hover:bg-background transition-all relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600/70 group-hover:scale-110 transition-transform">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <Button size="icon" variant="ghost"
                    className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                    onClick={() => handleDelete(m.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <h4 className="font-bold text-foreground/80">{m.className} — {m.sectionName}</h4>
                <p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest mt-1.5">{m.subjectName}</p>
                {m.session && (
                  <p className="text-[9px] text-muted-foreground/50 mt-1">Session: {m.session}</p>
                )}
              </div>
            ))}
            {mappings.length === 0 && !showAdd && (
              <div className="col-span-full py-12 text-center text-muted-foreground/40 bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
                <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-[10px] font-bold uppercase tracking-widest">No pedagogical mappings yet.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Shared Utilities ─────────────────────────────────────────────────────────

function FieldGroup({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{label}</Label>
      {children}
    </div>
  );
}

function RoleBadge({ label, color }: { label: string; color: 'purple' | 'blue' | 'orange' | 'green' }) {
  const styles = { purple: 'bg-purple-100 text-purple-700 border-purple-200', blue: 'bg-blue-100 text-blue-700 border-blue-200', orange: 'bg-orange-100 text-orange-700 border-orange-200', green: 'bg-green-100 text-green-700 border-green-200' };
  return <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider', styles[color])}>{label}</span>;
}
