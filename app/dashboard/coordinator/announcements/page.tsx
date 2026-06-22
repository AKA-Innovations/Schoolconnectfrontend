import CommunicationsHub from '@/components/announcements/CommunicationsHub';
import { Suspense } from 'react';

export default function CoordinatorAnnouncementsPage() {
  return (
    <Suspense fallback={<div className="h-64 bg-muted/20 animate-pulse rounded-2xl" />}>
      <CommunicationsHub role="subject_coordinator" />
    </Suspense>
  );
}


