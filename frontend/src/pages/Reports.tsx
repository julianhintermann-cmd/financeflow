import ReportDownload from '@/components/reports/ReportDownload';
import { FileText } from 'lucide-react';

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Reports
        </h1>
        <p className="text-muted-foreground mt-1">
          Download PDF reports of your expenses
        </p>
      </div>
      <ReportDownload />
    </div>
  );
}
