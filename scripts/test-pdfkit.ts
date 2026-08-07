import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

async function generatePdfBuffer(): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A5', margin: 25 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Font Registration
      const fontsDir = path.join(process.cwd(), 'public', 'fonts');
      const regFont = path.join(fontsDir, 'NotoSansGujarati-Regular.ttf');
      const boldFont = path.join(fontsDir, 'NotoSansGujarati-Bold.ttf');

      if (fs.existsSync(regFont)) {
        doc.registerFont('Gujarati', regFont);
      } else {
        doc.font('Helvetica');
      }

      if (fs.existsSync(boldFont)) {
        doc.registerFont('GujaratiBold', boldFont);
      } else {
        doc.font('Helvetica-Bold');
      }

      const fontReg = fs.existsSync(regFont) ? 'Gujarati' : 'Helvetica';
      const fontBold = fs.existsSync(boldFont) ? 'GujaratiBold' : 'Helvetica-Bold';

      // Header
      const logoPath = path.join(process.cwd(), 'public', 'logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 190, 20, { width: 38, height: 38 });
      }

      doc.moveDown(2);
      doc.font(fontBold).fontSize(16).fillColor('#2e1065').text('VINAYAK TUITION CLASSES', { align: 'center' });
      doc.font(fontReg).fontSize(8).fillColor('#64748b').text('Two Branches — Excellence in Education, Standards 9-12', { align: 'center' });

      doc.moveDown(0.8);
      // Divider
      doc.strokeColor('#6366f1').lineWidth(1).moveTo(25, doc.y).lineTo(395, doc.y).stroke();
      doc.moveDown(0.8);

      // Receipt Badge
      doc.rect(295, doc.y, 100, 20).fill('#4c1d95');
      doc.fillColor('#ffffff').font(fontBold).fontSize(9).text('PAYMENT RECEIPT', 300, doc.y - 15, { width: 90, align: 'center' });

      doc.moveDown(1.5);
      // Meta
      doc.fillColor('#334155').font(fontReg).fontSize(10).text('Receipt No.: #0001', 25, doc.y, { continued: true });
      doc.text('                             Date: 07/08/2026', { align: 'right' });

      doc.moveDown(1);
      // Content Table Box
      const tableTop = doc.y;
      doc.rect(25, tableTop, 370, 160).strokeColor('#cbd5e1').lineWidth(1).stroke();

      let currentY = tableTop + 8;
      const rows = [
        ['Student Name:', 'Prajapati Sumit'],
        ['Standard / Class:', 'Std. 12 Commerce'],
        ['Branch:', 'Vinayak 1 - Shivam'],
        ['Fees Month:', 'August 2026'],
        ['Payment Mode:', 'Cash'],
        ['Amount in Words:', 'Two Thousand Rupees Only'],
      ];

      rows.forEach(([label, val]) => {
        doc.font(fontReg).fontSize(9).fillColor('#475569').text(label, 35, currentY);
        doc.font(fontBold).fontSize(9.5).fillColor('#0f172a').text(val, 150, currentY);
        currentY += 22;
        doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(25, currentY - 5).lineTo(395, currentY - 5).stroke();
      });

      // Amount Paid Box
      doc.rect(270, tableTop + 115, 115, 35).fillAndStroke('#ffffff', '#5b21b6');
      doc.fillColor('#3b0764').font(fontBold).fontSize(14).text('₹ 2,000', 275, tableTop + 125, { width: 105, align: 'center' });

      // Footer
      doc.fontSize(7.5).fillColor('#94a3b8').text('This is a computer-generated receipt', 25, 395);

      const stampPath = path.join(process.cwd(), 'public', 'vinayak-official-seal-stamp.png');
      if (fs.existsSync(stampPath)) {
        doc.image(stampPath, 310, 340, { width: 70, height: 70 });
      }

      doc.strokeColor('#64748b').lineWidth(1).moveTo(290, 395).lineTo(390, 395).stroke();
      doc.fontSize(8).fillColor('#334155').font(fontReg).text('Authorized Signatory', 290, 400, { width: 100, align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

async function main() {
  console.log('Generating PDF via pdfkit...');
  const buf = await generatePdfBuffer();
  console.log('✅ Success! PDF Buffer generated cleanly. Size:', buf.length, 'bytes');
}

main().catch(console.error);
