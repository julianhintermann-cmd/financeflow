import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import db from '../database';

interface CategoryTotal {
  category_name: string;
  category_color: string;
  total: number;
}

interface ExpenseRow {
  date: string;
  description: string;
  category_name: string;
  amount: number;
}

export function generateReport(
  startDate: string,
  endDate: string,
  outputPath: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    const totalRow = db.prepare(
      'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date >= ? AND date <= ?'
    ).get(startDate, endDate) as { total: number };

    const byCategory = db.prepare(`
      SELECT c.name as category_name, c.color as category_color, COALESCE(SUM(e.amount), 0) as total
      FROM categories c
      LEFT JOIN expenses e ON e.category_id = c.id AND e.date >= ? AND e.date <= ?
      GROUP BY c.id
      HAVING total > 0
      ORDER BY total DESC
    `).all(startDate, endDate) as CategoryTotal[];

    const topExpenses = db.prepare(`
      SELECT e.date, e.description, c.name as category_name, e.amount
      FROM expenses e
      LEFT JOIN categories c ON c.id = e.category_id
      WHERE e.date >= ? AND e.date <= ?
      ORDER BY e.amount DESC
      LIMIT 20
    `).all(startDate, endDate) as ExpenseRow[];

    const formatUsd = (n: number) =>
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

    // Title
    doc.fontSize(24).font('Helvetica-Bold').text('FinanceFlow Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica')
      .text(`Period: ${startDate} to ${endDate}`, { align: 'center' });
    doc.moveDown(1);

    // Line
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#3B82F6');
    doc.moveDown(1);

    // Total
    doc.fontSize(16).font('Helvetica-Bold').text('Total Expenses');
    doc.moveDown(0.3);
    doc.fontSize(28).font('Helvetica-Bold').fillColor('#3B82F6')
      .text(formatUsd(totalRow.total));
    doc.fillColor('#000000');
    doc.moveDown(1);

    // By category
    doc.fontSize(16).font('Helvetica-Bold').text('Expenses by Category');
    doc.moveDown(0.5);

    for (const cat of byCategory) {
      const pct = totalRow.total > 0
        ? ((cat.total / totalRow.total) * 100).toFixed(1)
        : '0.0';

      doc.fontSize(11).font('Helvetica');

      const y = doc.y;
      doc.rect(50, y, 10, 10).fill(cat.category_color);
      doc.fillColor('#000000');
      doc.text(`${cat.category_name}`, 68, y);
      doc.text(`${formatUsd(cat.total)} (${pct}%)`, 350, y, { width: 195, align: 'right' });
      doc.moveDown(0.4);
    }

    doc.moveDown(1);

    // Top expenses
    if (topExpenses.length > 0) {
      doc.fontSize(16).font('Helvetica-Bold').text('Top Expenses');
      doc.moveDown(0.5);

      doc.fontSize(9).font('Helvetica-Bold');
      const headerY = doc.y;
      doc.text('Date', 50, headerY, { width: 80 });
      doc.text('Description', 130, headerY, { width: 200 });
      doc.text('Category', 330, headerY, { width: 100 });
      doc.text('Amount', 430, headerY, { width: 115, align: 'right' });
      doc.moveDown(0.3);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#E2E8F0');
      doc.moveDown(0.3);

      doc.font('Helvetica').fontSize(9);
      for (const exp of topExpenses) {
        if (doc.y > 750) {
          doc.addPage();
          doc.y = 50;
        }
        const rowY = doc.y;
        doc.text(exp.date, 50, rowY, { width: 80 });
        doc.text(exp.description || '-', 130, rowY, { width: 200 });
        doc.text(exp.category_name || '-', 330, rowY, { width: 100 });
        doc.text(formatUsd(exp.amount), 430, rowY, { width: 115, align: 'right' });
        doc.moveDown(0.3);
      }
    }

    // Footer
    doc.moveDown(2);
    doc.fontSize(8).fillColor('#9CA3AF')
      .text(`Generated on ${new Date().toLocaleDateString('en-US')} | FinanceFlow`, {
        align: 'center',
      });

    doc.end();
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}
