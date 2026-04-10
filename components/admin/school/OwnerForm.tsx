'use client';

import React, { useRef, useState } from 'react';
import { Save, Camera, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import { useUpdateSchool, useUploadOwnerImage, useDeleteOwnerImage } from '@/hooks/useSchool';
import { SchoolDetails } from '@/services/school.service';
import { FieldGroup } from '@/components/admin/shared/FieldGroup';

export function OwnerForm({ school }: { school: SchoolDetails }) {
  const { schoolId } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const o = school.ownerDetails;
  const updateMutation = useUpdateSchool(schoolId ?? '');
  const uploadImgMutation = useUploadOwnerImage(schoolId ?? '');
  const deleteImgMutation = useDeleteOwnerImage(schoolId ?? '');
  const imgBusy = uploadImgMutation.isPending || deleteImgMutation.isPending;
  const [form, setForm] = useState({
    firstName: o?.firstName ?? '', lastName: o?.lastName ?? '',
    address: o?.address ?? '', email: o?.email ?? '', phone: o?.phone ?? '',
  });

  const patch = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

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
              {o?.profileUrl
                ? <img src={o.profileUrl} alt="Owner" className="w-full h-full object-cover" />
                : <span className="text-2xl font-bold text-primary/50 uppercase">{(o?.firstName ?? '?').charAt(0)}</span>
              }
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
          <FieldGroup label="First Name"><Input value={form.firstName} onChange={patch('firstName')} className="rounded-xl" /></FieldGroup>
          <FieldGroup label="Last Name"><Input value={form.lastName} onChange={patch('lastName')} className="rounded-xl" /></FieldGroup>
          <FieldGroup label="Address" className="md:col-span-2"><Input value={form.address} onChange={patch('address')} className="rounded-xl" /></FieldGroup>
          <FieldGroup label="Email"><Input type="email" value={form.email} onChange={patch('email')} placeholder="Optional" className="rounded-xl" /></FieldGroup>
          <FieldGroup label="Phone"><Input value={form.phone} onChange={patch('phone')} className="rounded-xl" /></FieldGroup>
        </div>
      </CardContent>
    </Card>
  );
}
