import { NextRequest, NextResponse } from 'next/server';
import React from 'react';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    process.env.OVERRIDE_REACT_PDF_RECONCILER_REACT_VERSION = '18.2.0';
    const { renderToBuffer, Document, Page, Text } = await import('@react-pdf/renderer');

    const pdfElement = (
      <Document>
        <Page>
          <Text>Minimal Test PDF - Vinayak Tuition</Text>
        </Page>
      </Document>
    );

    const pdfBuffer = await renderToBuffer(pdfElement);

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
