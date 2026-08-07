import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer, Document, Page, Text } from '@react-pdf/renderer';
import React from 'react';

export async function GET(req: NextRequest) {
  try {
    const doc = React.createElement(
      Document,
      null,
      React.createElement(
        Page,
        null,
        React.createElement(Text, null, 'Minimal Test PDF - Vinayak Tuition')
      )
    );
    const pdfBuffer = await renderToBuffer(doc as any);
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
