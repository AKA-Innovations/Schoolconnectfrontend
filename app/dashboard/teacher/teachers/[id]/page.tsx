'use client';

import { useParams, useRouter } from 'next/navigation';
import { TeacherDetailsView } from '@/components/admin/TeacherDetailsView';

export default function TeacherProfileViewPage() {
  const params = useParams();
  const router = useRouter();
  const teacherId = params.id as string;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <TeacherDetailsView
        teacherId={teacherId}
        onBack={() => router.back()}
        readOnly={true}
      />
    </div>
  );
}
