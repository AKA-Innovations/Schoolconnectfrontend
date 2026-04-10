'use client';

import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import { useUpdateSchool } from '@/hooks/useSchool';
import { SchoolDetails } from '@/services/school.service';
import { FieldGroup } from '@/components/admin/shared/FieldGroup';

export function ContactForm({ school }: { school: SchoolDetails }) {
  const { schoolId } = useAuthStore();
  const updateMutation = useUpdateSchool(schoolId ?? '');
  const c = school.contactDetails;
  const [form, setForm] = useState({
    phone: c?.phone ?? '',
    alternatePhone: c?.alternatePhone ?? '',
    fax: c?.fax ?? '',
    email: c?.email ?? '',
  });

  const patch = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

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
          <FieldGroup label="Phone *"><Input value={form.phone} onChange={patch('phone')} className="rounded-xl" /></FieldGroup>
          <FieldGroup label="Alternate Phone"><Input value={form.alternatePhone} onChange={patch('alternatePhone')} placeholder="Optional" className="rounded-xl" /></FieldGroup>
          <FieldGroup label="Fax"><Input value={form.fax} onChange={patch('fax')} placeholder="Optional" className="rounded-xl" /></FieldGroup>
          <FieldGroup label="Official Email *"><Input type="email" value={form.email} onChange={patch('email')} className="rounded-xl" /></FieldGroup>
        </div>
      </CardContent>
    </Card>
  );
}
