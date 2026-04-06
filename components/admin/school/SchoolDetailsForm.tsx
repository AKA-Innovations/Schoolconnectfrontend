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

export function SchoolDetailsForm({ school }: { school: SchoolDetails }) {
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

  const patch = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

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
          <FieldGroup label="School Code"><Input value={form.schoolCode} onChange={patch('schoolCode')} className="rounded-xl" /></FieldGroup>
          <FieldGroup label="School Name"><Input value={form.name} onChange={patch('name')} className="rounded-xl" /></FieldGroup>
          <FieldGroup label="Address" className="md:col-span-2"><Input value={form.address} onChange={patch('address')} className="rounded-xl" /></FieldGroup>
          <FieldGroup label="City"><Input value={form.city} onChange={patch('city')} className="rounded-xl" /></FieldGroup>
          <FieldGroup label="State"><Input value={form.state} onChange={patch('state')} className="rounded-xl" /></FieldGroup>
          <FieldGroup label="Pincode"><Input value={form.pincode} onChange={patch('pincode')} className="rounded-xl" /></FieldGroup>
          <FieldGroup label="Country"><Input value={form.country} onChange={patch('country')} className="rounded-xl" /></FieldGroup>
          <FieldGroup label="Affiliation"><Input value={form.schoolAffiliation} onChange={patch('schoolAffiliation')} className="rounded-xl" /></FieldGroup>
          <FieldGroup label="Board"><Input value={form.schoolBoard} onChange={patch('schoolBoard')} className="rounded-xl" /></FieldGroup>
        </div>
      </CardContent>
    </Card>
  );
}
