import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export interface FeeReceiptPdfData {
  receiptNumber: string;
  dateStr: string;
  studentName: string;
  standard: string;
  branch: string;
  feesMonth: string;
  paymentMode: string;
  amount: number;
  amountInWords: string;
  isGujarati: boolean;
}

export function generateFeeReceiptPdf(data: FeeReceiptPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A5', margin: 25, autoFirstPage: false });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      const {
        receiptNumber,
        dateStr,
        studentName,
        standard,
        branch,
        feesMonth,
        paymentMode,
        amount,
        amountInWords,
        isGujarati,
      } = data;

      // Register Fonts
      const fontsDir = path.join(process.cwd(), 'public', 'fonts');
      const regFontPath = path.join(fontsDir, 'NotoSansGujarati-Regular.ttf');
      const boldFontPath = path.join(fontsDir, 'NotoSansGujarati-Bold.ttf');

      const hasReg = fs.existsSync(regFontPath);
      const hasBold = fs.existsSync(boldFontPath);

      if (hasReg) {
        doc.registerFont('GujaratiFont', regFontPath);
      }
      if (hasBold) {
        doc.registerFont('GujaratiBoldFont', boldFontPath);
      }

      // Add First Page AFTER registering custom fonts
      doc.addPage();

      const fontReg = hasReg ? 'GujaratiFont' : 'Helvetica';
      const fontBold = hasBold ? 'GujaratiBoldFont' : 'Helvetica-Bold';

      // Header Logo
      const logoPath = path.join(process.cwd(), 'public', 'logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 190, 18, { width: 38, height: 38 });
      }

      doc.moveDown(1.8);
      const mainTitle = isGujarati ? 'શ્રી વિનાયક ટ્યુશન ક્લાસીસ' : 'VINAYAK TUITION CLASSES';
      const subTitle = isGujarati
        ? 'બે શાખાઓ — ધોરણ ૯ થી ૧૨ માટે ગુણવત્તાયુક્ત શિક્ષણ'
        : 'Two Branches — Excellence in Education, Standards 9-12';

      doc.font(fontBold).fontSize(16).fillColor('#2e1065').text(mainTitle, { align: 'center' });
      doc.font(fontReg).fontSize(8).fillColor('#64748b').text(subTitle, { align: 'center' });

      doc.moveDown(0.6);
      // Divider
      doc.strokeColor('#6366f1').lineWidth(1.2).moveTo(25, doc.y).lineTo(395, doc.y).stroke();
      doc.moveDown(0.8);

      // Receipt Badge
      const badgeY = doc.y;
      doc.rect(285, badgeY, 110, 20).fill('#4c1d95');
      doc.fillColor('#ffffff').font(fontBold).fontSize(8.5).text(
        isGujarati ? 'ચુકવણી રસીદ' : 'PAYMENT RECEIPT',
        285,
        badgeY + 5,
        { width: 110, align: 'center' }
      );

      doc.moveDown(1.2);
      // Receipt Meta
      const metaY = doc.y;
      doc.fillColor('#334155').font(fontReg).fontSize(9.5).text(
        `${isGujarati ? 'રસીદ ક્રમાંક: ' : 'Receipt No.: '}${receiptNumber}`,
        25,
        metaY
      );
      doc.text(
        `${isGujarati ? 'તારીખ: ' : 'Date: '}${dateStr}`,
        25,
        metaY,
        { align: 'right' }
      );

      doc.moveDown(1.2);
      // Formatters
      const formatBranch = (b: string) => {
        if (!b) return isGujarati ? 'વિનાયક ૧ - શિવમ' : 'Vinayak 1 - Shivam';
        if (b.toUpperCase().includes('RAILWAY')) {
          return isGujarati ? 'વિનાયક ૨ - રેલવે ઈસ્ટ' : 'Vinayak 2 - Railway East';
        }
        return isGujarati ? 'વિનાયક ૧ - શિવમ' : 'Vinayak 1 - Shivam';
      };

      const formatStandard = (s: string) => {
        if (isGujarati) {
          const stdGJMap: Record<string, string> = {
            '9': 'ધોરણ ૯',
            '10': 'ધોરણ ૧૦',
            '11': 'ધોરણ ૧૧ કોમર્સ',
            '12': 'ધોરણ ૧૨ કોમર્સ',
          };
          return stdGJMap[s] || `ધોરણ ${s}`;
        } else {
          const stdENMap: Record<string, string> = {
            '9': 'Std. 9',
            '10': 'Std. 10',
            '11': 'Std. 11 Commerce',
            '12': 'Std. 12 Commerce',
          };
          return stdENMap[s] || `Std. ${s}`;
        }
      };

      const formatMode = (m: string) => {
        if (m === 'upi') return 'UPI';
        if (m === 'cash') return isGujarati ? 'રોકડ' : 'Cash';
        return m ? m.toUpperCase() : '-';
      };

      // Main Details Box
      const boxTop = doc.y + 4;
      const boxHeight = 165;
      doc.rect(25, boxTop, 370, boxHeight).strokeColor('#cbd5e1').lineWidth(1).stroke();

      const tableRows = [
        [isGujarati ? 'વિદ્યાર્થીનું નામ:' : 'Student Name:', studentName],
        [isGujarati ? 'ધોરણ:' : 'Standard / Class:', formatStandard(standard)],
        [isGujarati ? 'શાખા:' : 'Branch:', formatBranch(branch)],
        [isGujarati ? 'ફી મહિનો:' : 'Fees Month:', feesMonth],
        [isGujarati ? 'ચુકવણી પદ્ધતિ:' : 'Payment Mode:', formatMode(paymentMode)],
        [isGujarati ? 'શબ્દોમાં રકમ:' : 'Amount in Words:', amountInWords],
      ];

      let rowY = boxTop + 7;
      tableRows.forEach(([lbl, val], idx) => {
        const isWordsRow = idx === 5;
        if (isWordsRow) {
          doc.rect(26, rowY - 3, 368, 22).fill('#f1f5f9');
        }

        doc.font(fontReg).fontSize(8.5).fillColor('#475569').text(lbl, 35, rowY);
        doc.font(fontBold).fontSize(9.5).fillColor('#0f172a').text(val, 155, rowY, { width: 230 });

        rowY += 21;
        if (idx < 5) {
          doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(25, rowY - 3).lineTo(395, rowY - 3).stroke();
        }
      });

      // Amount Box
      const amtBoxY = boxTop + boxHeight - 38;
      doc.rect(265, amtBoxY, 120, 32).fillAndStroke('#ffffff', '#5b21b6');
      doc.fillColor('#3b0764').font(fontBold).fontSize(13).text(
        `₹ ${amount ? amount.toLocaleString('en-IN') : '0'}`,
        265,
        amtBoxY + 8,
        { width: 120, align: 'center' }
      );

      // Footer
      const footerY = 398;
      doc.fontSize(7.5).fillColor('#94a3b8').font(fontReg).text(
        isGujarati ? 'આ કોમ્પ્યુટર જનરેટેડ રસીદ છે' : 'This is a computer-generated receipt',
        25,
        footerY
      );

      // Stamp Seal Image
      const stampPath = path.join(process.cwd(), 'public', 'vinayak-official-seal-stamp.png');
      if (fs.existsSync(stampPath)) {
        doc.image(stampPath, 310, 342, { width: 70, height: 70 });
      }

      doc.strokeColor('#64748b').lineWidth(1).moveTo(290, 395).lineTo(390, 395).stroke();
      doc.fontSize(8).fillColor('#334155').font(fontReg).text(
        isGujarati ? 'અધિકૃત સહી' : 'Authorized Signatory',
        290,
        400,
        { width: 100, align: 'center' }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
