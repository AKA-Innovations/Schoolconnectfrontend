import { ResultMonitoring } from '@/components/admin/exams/ResultMonitoring';
import { CURRENT_SESSION } from '@/lib/constants';

export default function ResultMonitoringPage() {
  return <ResultMonitoring session={CURRENT_SESSION} />;
}
