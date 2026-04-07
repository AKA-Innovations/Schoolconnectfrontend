'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Camera,
  Clock,
  RefreshCw,
  Trash2,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Plus,
  Edit2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import { useAddAddress, useDeleteAddress, useDeleteTeacherImage, useTeacher, useTeacherList, useUpdateAddress, useUploadTeacherImage } from '@/hooks/useTeachers';
import { Address, Teacher } from '@/types/roles';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

function buildAddressForm(address?: Address) {
  return {
    isPermanent: address?.isPermanent ?? false,
    address: address?.address ?? '',
    state: address?.state ?? '',
    city: address?.city ?? '',
    country: address?.country ?? '',
    pincode: address?.pincode ?? '',
    googleAddressUrl: address?.googleAddressUrl ?? '',
    latitude: address?.latitude ?? '',
    longitude: address?.longitude ?? '',
  };
}

function ProfileField({
  label,
  children,
  description,
  className,
}: {
  label: string;
  children: React.ReactNode;
  description?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
        {label}
      </Label>
      {description && <p className="mt-1 text-[11px] text-muted-foreground/60">{description}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

function TeacherProfileSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 animate-pulse">
      <div className="h-44 rounded-3xl bg-muted/40" />
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4 h-120 rounded-3xl bg-muted/40" />
        <div className="lg:col-span-8 h-192 rounded-3xl bg-muted/40" />
      </div>
    </div>
  );
}

export function TeacherProfileManager() {
  const router = useRouter();
  const { user } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [addingAddress, setAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [newAddress, setNewAddress] = useState(buildAddressForm());
  const [editAddress, setEditAddress] = useState(buildAddressForm());

  const teacherId = user?.id ?? '';

  const {
    data: teacher,
    isLoading,
    isFetching,
    refetch,
  } = useTeacher(teacherId);
  
  const uploadMutation = useUploadTeacherImage(teacherId);
  const deleteMutation = useDeleteTeacherImage(teacherId);
  const addAddressMutation = useAddAddress(teacherId);
  const updateAddressMutation = useUpdateAddress(teacherId);
  const deleteAddressMutation = useDeleteAddress(teacherId);

  const loading = isLoading;
  const busy = uploadMutation.isPending || deleteMutation.isPending || addAddressMutation.isPending || updateAddressMutation.isPending || deleteAddressMutation.isPending;

  const fullName = useMemo(() => {
    if (!teacher) return user?.name ?? 'Teacher';
    return `${teacher.firstName ?? ''} ${teacher.lastName ?? ''}`.trim() || user?.name || 'Teacher';
  }, [teacher, user?.name]);

  const initials = useMemo(() => {
    return fullName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [fullName]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !teacherId) return;

    uploadMutation.mutate(file, {
      onSuccess: async () => {
        await refetch();
        toast.success('Profile image updated');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to upload profile image');
      },
    });

    event.target.value = '';
  };

  const handleDeleteImage = () => {
    if (!confirm('Delete profile image?')) return;

    deleteMutation.mutate(undefined, {
      onSuccess: async () => {
        await refetch();
        toast.success('Profile image removed');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to delete profile image');
      },
    });
  };

  const clearAddressForms = () => {
    setNewAddress(buildAddressForm());
    setEditAddress(buildAddressForm());
  };

  const openEditAddress = (address: Address) => {
    setEditingAddressId(address.id);
    setEditAddress(buildAddressForm(address));
    setAddingAddress(false);
  };

  const handleAddAddress = async () => {
    if (!newAddress.address || !newAddress.city || !newAddress.state || !newAddress.country || !newAddress.pincode) {
      toast.error('Please fill in all required address fields.');
      return;
    }

    try {
      await addAddressMutation.mutateAsync(newAddress);
      toast.success('Address added successfully');
      setAddingAddress(false);
      clearAddressForms();
      await refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add address');
    }
  };

  const handleUpdateAddress = async (addressId: number) => {
    if (!editAddress.address || !editAddress.city || !editAddress.state || !editAddress.country || !editAddress.pincode) {
      toast.error('Please fill in all required address fields.');
      return;
    }

    try {
      await updateAddressMutation.mutateAsync({ id: addressId, addr: editAddress });
      toast.success('Address updated successfully');
      setEditingAddressId(null);
      clearAddressForms();
      await refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update address');
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    if (!confirm('Delete this address?')) return;

    try {
      await deleteAddressMutation.mutateAsync(addressId);
      toast.success('Address deleted successfully');
      await refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete address');
    }
  };

  if (loading && !teacher) {
    return <TeacherProfileSkeleton />;
  }

  if (!teacher) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-border/60 bg-card shadow-sm">
          <UserIcon className="h-10 w-10 text-muted-foreground/40" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Teacher profile not available</h1>
          <p className="text-muted-foreground">
            Sign in with a teacher account to view and update your profile.
          </p>
        </div>
        <Button variant="secondary" onClick={() => router.push('/dashboard/teacher')}>
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">Teacher Profile</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{fullName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Update your profile details, roles, and extended records.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => router.push('/dashboard/teacher')}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button variant="secondary" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4 space-y-6">
          <Card className="erp-card overflow-hidden">
            <div className="h-1.5 bg-linear-to-r from-secondary via-primary/70 to-primary" />
            <div className="relative p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="relative group shrink-0">
                  <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border-4 border-background bg-primary/10 shadow-lg shadow-black/5">
                    {teacher.profileImageUrl ? (
                      <img src={teacher.profileImageUrl} alt={fullName} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-3xl font-extrabold tracking-tight text-primary/60">{initials || <UserIcon className="h-10 w-10" />}</span>
                    )}
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-3xl bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-1 rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-white hover:text-primary-foreground"
                    >
                      <Camera className="h-3 w-3" /> {uploadMutation.isPending ? 'Uploading…' : 'Upload'}
                    </button>
                    {teacher.profileImageUrl && (
                      <button
                        type="button"
                        onClick={handleDeleteImage}
                        className="flex items-center gap-1 rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-red-200 hover:text-red-100"
                      >
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                </div>

                <button
                  type="button"
                  onClick={() => refetch()}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/50 bg-background/70 text-foreground shadow-sm transition hover:bg-background"
                  title="Refresh profile"
                >
                  <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                    Teacher Account
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {teacher.employeeId || 'Unassigned'}
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">{fullName}</h2>
                  <p className="mt-1 text-sm text-muted-foreground/70">{teacher.employeeEmail || teacher.emailId}</p>
                </div>

                <div className="space-y-2 pt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary/70" />
                    <span>{teacher.emailId || 'No personal email set'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary/70" />
                    <span>{teacher.mobileNumber || 'No mobile number set'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary/70" />
                    <span>{teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Joining date unavailable'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary/70" />
                    <span>{teacher.gender || 'Gender not set'}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <Card className="erp-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">Current Profile Snapshot</CardTitle>
              <CardDescription className="text-xs font-medium opacity-70">Read-only profile data from the backend.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <SnapshotItem label="Employee ID" value={teacher.employeeId || 'Not set'} />
              <SnapshotItem label="Joining Date" value={teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Not set'} />
              <SnapshotItem label="School ID" value={teacher.schoolId || 'Not set'} />
              <SnapshotItem label="Personal Email" value={teacher.emailId || 'Not set'} />
              <SnapshotItem label="Professional Email" value={teacher.employeeEmail || 'Not set'} />
              <SnapshotItem label="Role Stack" value={[teacher.isPrincipal && 'Principal', teacher.isCoordinator && 'Coordinator', teacher.isClassTeacher && 'Class Teacher', teacher.isSubjectTeacher && 'Subject Teacher'].filter(Boolean).join(' • ') || 'No roles assigned'} />
            </CardContent>
          </Card>

          <Card className="erp-card overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-border/50 bg-muted/10 px-6 py-5 sm:px-8">
              <div>
                <CardTitle className="text-xl font-bold tracking-tight">Addresses</CardTitle>
                <CardDescription className="mt-1 text-xs font-medium opacity-70">Manage the address entries exposed by the teacher address APIs.</CardDescription>
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  setAddingAddress((value) => !value);
                  setEditingAddressId(null);
                  setEditAddress(buildAddressForm());
                }}
                className="rounded-xl px-5 text-xs font-bold"
              >
                <Plus className="mr-2 h-4 w-4" /> {addingAddress ? 'Cancel' : 'Add Address'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6 p-6 sm:p-8">
              {addingAddress && (
                <AddressEditor
                  title="New Address"
                  data={newAddress}
                  onChange={setNewAddress}
                  onSave={handleAddAddress}
                  onCancel={() => {
                    setAddingAddress(false);
                    setNewAddress(buildAddressForm());
                  }}
                  saving={busy}
                />
              )}

              <div className="grid gap-4 md:grid-cols-2">
                {(teacher.addresses ?? []).map((address) => (
                  <div key={address.id} className="rounded-2xl border border-border/60 bg-muted/10 p-5 transition hover:border-primary/30 hover:bg-muted/20">
                    {editingAddressId === address.id ? (
                      <AddressEditor
                        title={`Edit Address #${address.id}`}
                        data={editAddress}
                        onChange={setEditAddress}
                        onSave={() => handleUpdateAddress(address.id)}
                        onCancel={() => {
                          setEditingAddressId(null);
                          setEditAddress(buildAddressForm());
                        }}
                        saving={busy}
                      />
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary/70">
                              <MapPin className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-bold text-foreground">
                                {address.city}, {address.state}
                              </h3>
                              <p className="mt-1 text-sm text-muted-foreground">{address.address}</p>
                            </div>
                          </div>
                          {address.isPermanent && (
                            <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                              Permanent
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                          <span>{address.country}</span>
                          <span>{address.pincode}</span>
                          {address.googleAddressUrl && <span>Maps Link</span>}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="secondary" onClick={() => openEditAddress(address)} className="rounded-xl text-xs font-bold">
                            <Edit2 className="mr-2 h-4 w-4" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteAddress(address.id)}
                            className="rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {(teacher.addresses ?? []).length === 0 && !addingAddress && (
                  <div className="col-span-full rounded-2xl border border-dashed border-border/60 bg-muted/10 py-12 text-center text-muted-foreground/60">
                    <MapPin className="mx-auto h-8 w-8 opacity-40" />
                    <p className="mt-2 text-sm font-medium">No addresses have been added yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AddressEditor({
  title,
  data,
  onChange,
  onSave,
  onCancel,
  saving,
}: {
  title: string;
  data: ReturnType<typeof buildAddressForm>;
  onChange: React.Dispatch<React.SetStateAction<ReturnType<typeof buildAddressForm>>>;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-border/60 bg-background p-5">
      <div>
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">Add or update the address using the teacher address API.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Address" className="md:col-span-2">
          <textarea
            value={data.address}
            onChange={(event) => onChange((current) => ({ ...current, address: event.target.value }))}
            rows={4}
            className="min-h-28 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring"
          />
        </Field>
        <Field label="City">
          <Input value={data.city} onChange={(event) => onChange((current) => ({ ...current, city: event.target.value }))} className="rounded-xl" />
        </Field>
        <Field label="State">
          <Input value={data.state} onChange={(event) => onChange((current) => ({ ...current, state: event.target.value }))} className="rounded-xl" />
        </Field>
        <Field label="Country">
          <Input value={data.country} onChange={(event) => onChange((current) => ({ ...current, country: event.target.value }))} className="rounded-xl" />
        </Field>
        <Field label="Pincode">
          <Input value={data.pincode} onChange={(event) => onChange((current) => ({ ...current, pincode: event.target.value }))} className="rounded-xl" />
        </Field>
        <Field label="Google Maps URL" className="md:col-span-2">
          <Input value={data.googleAddressUrl} onChange={(event) => onChange((current) => ({ ...current, googleAddressUrl: event.target.value }))} className="rounded-xl" />
        </Field>
        <Field label="Latitude">
          <Input value={data.latitude} onChange={(event) => onChange((current) => ({ ...current, latitude: event.target.value }))} className="rounded-xl" />
        </Field>
        <Field label="Longitude">
          <Input value={data.longitude} onChange={(event) => onChange((current) => ({ ...current, longitude: event.target.value }))} className="rounded-xl" />
        </Field>
        <div className="md:col-span-2 flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Permanent Address</p>
            <p className="mt-1 text-[11px] text-muted-foreground/60">Mark this entry as the permanent address for the teacher.</p>
          </div>
          <input
            type="checkbox"
            checked={data.isPermanent}
            onChange={(event) => onChange((current) => ({ ...current, isPermanent: event.target.checked }))}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={onSave} disabled={saving} className="rounded-xl text-xs font-bold">
          {saving ? 'Saving…' : 'Save Address'}
        </Button>
        <Button variant="secondary" onClick={onCancel} className="rounded-xl text-xs font-bold">
          Cancel
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{label}</Label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function SnapshotItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/10 p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}