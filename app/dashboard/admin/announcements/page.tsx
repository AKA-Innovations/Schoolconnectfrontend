import CommunicationsHub from '@/components/announcements/CommunicationsHub';
import { Suspense } from 'react';

export default function AdminAnnouncementsPage() {
  return (
    <Suspense fallback={<div className="h-64 bg-muted/20 animate-pulse rounded-2xl" />}>
      <CommunicationsHub role="school_admin" />
    </Suspense>
  );
}


