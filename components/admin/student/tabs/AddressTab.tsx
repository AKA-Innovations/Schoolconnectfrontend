'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Plus, Edit2, Save, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudent, useAddAddress, useUpdateAddress, useDeleteAddress } from '@/hooks/useStudents';
import type { CreateAddressPayload } from '@/services/student.service';

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value || '—'}</p>
    </div>
  );
}

const emptyAddress = (): CreateAddressPayload => ({
  address: '', state: '', city: '', country: '', pincode: '', isPermanent: false, googleAddressUrl: '', latitude: '', longitude: '',
});

const addrFields: { label: string; key: keyof CreateAddressPayload; span2?: boolean }[] = [
  { label: 'Address *', key: 'address', span2: true }, { label: 'City *', key: 'city' },
  { label: 'State *', key: 'state' }, { label: 'Country *', key: 'country' },
  { label: 'Pincode *', key: 'pincode' }, { label: 'Google Maps URL', key: 'googleAddressUrl', span2: true },
  { label: 'Latitude', key: 'latitude' }, { label: 'Longitude', key: 'longitude' },
];

export function AddressTab({ studentId }: { studentId: string }) {
  const { data: student } = useStudent(studentId);
  const addMutation = useAddAddress(studentId);
  const updateMutation = useUpdateAddress(studentId);
  const deleteMutation = useDeleteAddress(studentId);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<CreateAddressPayload>(emptyAddress());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<CreateAddressPayload>>({});
  const [error, setError] = useState('');

  const handleAdd = () => {
    setError('');
    if (!form.address || !form.city || !form.state || !form.country || !form.pincode) {
      setError('Address, city, state, country, and pincode are required'); return;
    }
    addMutation.mutate(form, {
      onSuccess: () => { setAddOpen(false); setForm(emptyAddress()); },
      onError: (err: any) => setError(err?.response?.data?.message ?? 'Failed to add address'),
    });
  };

  const handleUpdate = (id: number) => {
    updateMutation.mutate({ addressId: id, data: editForm }, { onSuccess: () => setEditingId(null) });
  };

  const addresses = student?.addresses ?? [];

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Dialog open={addOpen} onOpenChange={open => { setAddOpen(open); if (!open) { setForm(emptyAddress()); setError(''); } }}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl h-9 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus size={13} className="mr-2" /> Add Address
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg rounded-[2rem] border-none shadow-2xl p-8">
            <DialogHeader className="mb-4"><DialogTitle className="text-xl font-bold">Add Address</DialogTitle></DialogHeader>
            {error && <div className="mb-3 px-4 py-3 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold">{error}</div>}
            <div className="grid grid-cols-2 gap-3">
              {addrFields.map(({ label, key, span2 }) => (
                <div key={key} className={cn('space-y-1', span2 && 'col-span-2')}>
                  <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>
                  <Input value={(form[key] as string) ?? ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} className="rounded-xl h-9" />
                </div>
              ))}
              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" id="isPerm" checked={!!form.isPermanent} onChange={e => setForm(p => ({ ...p, isPermanent: e.target.checked }))} className="rounded" />
                <label htmlFor="isPerm" className="text-xs font-semibold text-muted-foreground cursor-pointer">Permanent Address</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setAddOpen(false)} className="flex-1 rounded-xl h-10">Cancel</Button>
              <Button onClick={handleAdd} disabled={addMutation.isPending} className="flex-1 rounded-xl h-10 bg-primary hover:bg-primary/90 text-primary-foreground">
                {addMutation.isPending ? 'Adding...' : 'Add Address'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-36 gap-2 text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border">
          <MapPin size={32} className="opacity-20" /><p className="text-sm font-semibold">No address records yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map(addr => (
            <Card key={addr.id} className="rounded-2xl border-border shadow-sm">
              <CardContent className="p-5">
                {editingId === addr.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {addrFields.map(({ label, key, span2 }) => (
                        <div key={key} className={cn('space-y-1', span2 && 'col-span-2')}>
                          <Label className="text-xs font-semibold text-muted-foreground">{label.replace(' *', '')}</Label>
                          <Input value={(editForm[key] as string) ?? ''} onChange={e => setEditForm(p => ({ ...p, [key]: e.target.value }))} className="rounded-xl h-9" />
                        </div>
                      ))}
                      <div className="col-span-2 flex items-center gap-2">
                        <input type="checkbox" checked={!!editForm.isPermanent} onChange={e => setEditForm(p => ({ ...p, isPermanent: e.target.checked }))} className="rounded" />
                        <label className="text-xs font-semibold text-muted-foreground">Permanent Address</label>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingId(null)} className="rounded-xl"><X size={13} /></Button>
                      <Button size="sm" onClick={() => handleUpdate(addr.id)} disabled={updateMutation.isPending} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                        <Save size={13} className="mr-1.5" /> Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1">
                      <InfoRow label="Address" value={addr.address} />
                      <InfoRow label="City" value={addr.city} />
                      <InfoRow label="State" value={addr.state} />
                      <InfoRow label="Country" value={addr.country} />
                      <InfoRow label="Pincode" value={addr.pincode} />
                      {addr.isPermanent !== undefined && (
                        <div className="space-y-0.5">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Type</p>
                          <Badge className={cn('rounded-full text-[9px] font-bold px-2 border-0 shadow-none', addr.isPermanent ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>
                            {addr.isPermanent ? 'Permanent' : 'Current'}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => {
                        setEditingId(addr.id);
                        setEditForm({ address: addr.address, city: addr.city, state: addr.state, country: addr.country, pincode: addr.pincode, isPermanent: addr.isPermanent, googleAddressUrl: addr.googleAddressUrl, latitude: addr.latitude, longitude: addr.longitude });
                      }} className="h-8 w-8 rounded-xl hover:bg-muted"><Edit2 size={13} /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { if (confirm('Delete this address?')) deleteMutation.mutate(addr.id); }} className="h-8 w-8 rounded-xl hover:bg-destructive/10 hover:text-destructive"><Trash2 size={13} /></Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
