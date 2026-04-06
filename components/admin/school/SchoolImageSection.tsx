'use client';

import React, { useRef } from 'react';
import { Building2, Camera, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUploadSchoolImage, useDeleteSchoolImage } from '@/hooks/useSchool';
import { SchoolDetails } from '@/services/school.service';

export function SchoolImageSection({ school }: { school: SchoolDetails }) {
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
