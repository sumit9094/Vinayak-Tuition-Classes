import { renderToBuffer } from '@react-pdf/renderer';
import { FeeReceiptDocument } from '../src/components/pdf/FeeReceiptDocument';

async function test() {
  try {
    console.log('Testing FeeReceiptDocument with undefined logoPath & stampPath...');
    const element = FeeReceiptDocument({
      receiptNumber: '#0001',
      dateStr: '07/08/2026',
      studentName: 'Prajapati Sumit',
      standard: '12',
      branch: 'Vinayak 1 - Shivam',
      feesMonth: 'August 2026',
      paymentMode: 'cash',
      amount: 2000,
      amountInWords: 'Two Thousand Rupees Only',
      isGujarati: false,
      logoPath: undefined,
      stampPath: undefined,
    });

    const buffer = await renderToBuffer(element as any);
    console.log('Success! Buffer size:', buffer.length);
  } catch (err: any) {
    console.error('FAILED TO RENDER PDF:');
    console.error(err);
  }
}

test();
