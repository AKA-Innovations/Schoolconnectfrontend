'use client';

import { useParams, useRouter } from 'next/navigation';
import { TeacherDetailsView } from '@/components/admin/TeacherDetailsView';

export default function TeacherProfilePage() {
  const params = useParams();
  const router = useRouter();
  const teacherId = params.id as string;

  return (
    <div className="p-4 md:p-8">
      <TeacherDetailsView
        teacherId={teacherId}
        onBack={() => router.push('/dashboard/admin?tab=teachers')}
        readOnly={true}
      />
    </div>
  );
}
