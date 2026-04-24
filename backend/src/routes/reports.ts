import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { generateReport } from '../services/report-generator';

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', '..', 'data');

const router = Router();

router.get('/download', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      res.status(400).json({ error: 'Start and end date are required' });
      return;
    }

    const filename = `Report-${startDate}-${endDate}.pdf`;
    const outputPath = path.join(DATA_DIR, 'reports', filename);

    await generateReport(startDate as string, endDate as string, outputPath);

    res.download(outputPath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      fs.unlink(outputPath, () => {});
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

router.get('/monthly', (_req: Request, res: Response) => {
  const reportDir = path.join(DATA_DIR, 'Monatsreport');
  if (!fs.existsSync(reportDir)) {
    res.json([]);
    return;
  }

  const files = fs.readdirSync(reportDir)
    .filter((f) => f.endsWith('.pdf'))
    .sort()
    .reverse()
    .map((f) => ({
      filename: f,
      path: `/api/reports/monthly/${f}`,
      created: fs.statSync(path.join(reportDir, f)).mtime.toISOString(),
    }));

  res.json(files);
});

router.get('/monthly/:filename', (req: Request, res: Response) => {
  const filename = req.params.filename as string;
  const filePath = path.join(DATA_DIR, 'Monatsreport', filename);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: 'Report not found' });
    return;
  }

  res.download(filePath, filename as string);
});

export default router;
