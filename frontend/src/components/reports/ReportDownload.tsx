import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { downloadReport, getMonthlyReports } from '@/api/client';
import { formatDate } from '@/lib/utils';
import { Download, FileText, Loader2, Calendar } from 'lucide-react';

export default function ReportDownload() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [monthlyReports, setMonthlyReports] = useState<
    { filename: string; path: string; created: string }[]
  >([]);

  useEffect(() => {
    getMonthlyReports().then(setMonthlyReports).catch(console.error);
  }, []);

  const handleDownload = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      await downloadReport(startDate, endDate);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthlyDownload = (path: string, filename: string) => {
    const a = document.createElement('a');
    a.href = path;
    a.download = filename;
    a.click();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Download Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="report-start">Start Date</Label>
              <Input
                id="report-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="report-end">End Date</Label>
              <Input
                id="report-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div className="flex items-end">
              <Button
                className="w-full"
                onClick={handleDownload}
                disabled={loading || !startDate || !endDate}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Automatic Monthly Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyReports.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No automatic monthly reports yet. These are generated on the 1st of each month.
            </p>
          ) : (
            <div className="space-y-2">
              {monthlyReports.map((report) => (
                <div
                  key={report.filename}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{report.filename}</p>
                      <p className="text-xs text-muted-foreground">
                        Created {formatDate(report.created)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMonthlyDownload(report.path, report.filename)}
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
