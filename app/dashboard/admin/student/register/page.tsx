'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { StudentRegistrationForm } from '@/components/admin/student/EnrollStudentDialog';

export default function Page() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/dashboard/admin?tab=students');
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-700 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Enroll Student</h1>
        <p className="text-sm text-muted-foreground">Fill student details to create an account</p>
      </div>
      <StudentRegistrationForm onSuccess={handleSuccess} onCancel={() => router.push('/dashboard/admin?tab=students')} />
    </div>
  );
}
