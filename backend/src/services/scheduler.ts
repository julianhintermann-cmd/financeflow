import cron from 'node-cron';
import path from 'path';
import { generateReport } from './report-generator';

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', '..', 'data');

export function startScheduler(): void {
  // Run on the 1st of every month at 02:00
  cron.schedule('0 2 1 * *', async () => {
    try {
      const now = new Date();
      const reportMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      const startDate = reportMonth.toISOString().split('T')[0];
      const endDate = lastDayPrevMonth.toISOString().split('T')[0];

      const reportMonthStr = String(reportMonth.getMonth() + 1).padStart(2, '0');
      const reportYearStr = String(reportMonth.getFullYear());
      const currentMonthStr = String(now.getMonth() + 1).padStart(2, '0');
      const currentYearStr = String(now.getFullYear());

      const filename = `MonthlyReport-${reportMonthStr}${reportYearStr}-${currentMonthStr}${currentYearStr}.pdf`;
      const outputPath = path.join(DATA_DIR, 'Monatsreport', filename);

      await generateReport(startDate, endDate, outputPath);
      console.log(`Monthly report generated: ${filename}`);
    } catch (error) {
      console.error('Monthly report generation error:', error);
    }
  });

  console.log('Scheduler started: monthly report on the 1st of each month at 02:00');
}
