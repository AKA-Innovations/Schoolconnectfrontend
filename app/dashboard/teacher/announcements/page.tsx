import CommunicationsHub from '@/components/announcements/CommunicationsHub';
import { Suspense } from 'react';

export default function TeacherAnnouncementsPage() {
  return (
    <Suspense fallback={<div className="h-64 bg-muted/20 animate-pulse rounded-2xl" />}>
      <CommunicationsHub role="teacher" />
    </Suspense>
  );
}


