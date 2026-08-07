import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A5', margin: 25, autoFirstPage: false });
      const chunks: Buffer[] = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      const fontPath = path.join(process.cwd(), 'public', 'fonts', 'NotoSansGujarati-Regular.ttf');
      if (fs.existsSync(fontPath)) {
        doc.registerFont('CustomFont', fontPath);
      }
      doc.addPage();
      if (fs.existsSync(fontPath)) {
        doc.font('CustomFont');
      }

      doc.fontSize(16).text('Minimal Test PDF - Vinayak Tuition (PDFKit Native)', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text('PDFKit Serverless Generation is 100% Working on Vercel!');
      doc.end();
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="test.pdf"',
      },
    });
  } catch (err: any) {
    console.error('Test PDF Error:', err);
    return NextResponse.json(
      { error: err.message, stack: err.stack },
      { status: 500 }
    );
  }
}
