'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { TeacherRegistrationForm } from '@/components/admin/TeacherRegistrationForm';

export default function NewTeacherPage() {
  const router = useRouter();

  return (
    <div className="p-2 md:p-4">
       <TeacherRegistrationForm
          onCancel={() => router.back()}
          onSuccess={() => router.push('/dashboard/admin?tab=teachers')}
       />
    </div>
  );
}
