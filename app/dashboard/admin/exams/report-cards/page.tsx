import { ReportCardEngine } from '@/components/admin/exams/ReportCardEngine';
import { CURRENT_SESSION } from '@/lib/constants';

export default function ReportCardsPage() {
  return <ReportCardEngine session={CURRENT_SESSION} />;
}
