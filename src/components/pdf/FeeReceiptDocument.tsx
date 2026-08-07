import React from 'react';
import { Document, Page, Text, View, Image, Font, StyleSheet } from '@react-pdf/renderer';
import path from 'path';
import fs from 'fs';

// Hybrid Font Registration:
// Uses local disk TTF files bundled via outputFileTracingIncludes for zero-latency rendering.
// Falls back to Google Fonts CDN URLs if local file is unavailable.
const publicDir = path.join(process.cwd(), 'public');
const fontsDir = path.join(publicDir, 'fonts');
const regFontPath = path.join(fontsDir, 'NotoSansGujarati-Regular.ttf');
const boldFontPath = path.join(fontsDir, 'NotoSansGujarati-Bold.ttf');

const regExists = fs.existsSync(regFontPath);
const boldExists = fs.existsSync(boldFontPath);

const gujaratiRegularUrl =
  'https://fonts.gstatic.com/s/notosansgujarati/v27/wlpWgx_HC1ti5ViekvcxnhMlCVo3f5pv17ivlzsUB14gg1TMR2Gw4VceEl7MA_ypFwPM_OdiEUUv.ttf';
const gujaratiBoldUrl =
  'https://fonts.gstatic.com/s/notosansgujarati/v27/wlpWgx_HC1ti5ViekvcxnhMlCVo3f5pv17ivlzsUB14gg1TMR2Gw4VceEl7MA_xOEAPM_OdiEUUv.ttf';

try {
  Font.register({
    family: 'NotoSansGujarati',
    fonts: [
      { src: regExists ? regFontPath : gujaratiRegularUrl, fontWeight: 'normal' },
      { src: boldExists ? boldFontPath : gujaratiBoldUrl, fontWeight: 'bold' },
    ],
  });
} catch (err) {
  console.error('Font registration warning:', err);
}

// Disable automatic hyphenation for clean Gujarati & English word rendering
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSansGujarati',
    fontSize: 9,
    padding: 24,
    backgroundColor: '#ffffff',
    color: '#1e293b',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    width: 38,
    height: 38,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e1065',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 8,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 2,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#6366f1',
    marginVertical: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  badge: {
    backgroundColor: '#4c1d95',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  badgeText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 9,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  metaText: {
    fontSize: 10,
    color: '#334155',
  },
  boldMetaText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  card: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    alignItems: 'center',
  },
  labelCell: {
    width: '38%',
    fontSize: 9,
    color: '#475569',
  },
  valueCell: {
    width: '62%',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  wordsRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    alignItems: 'center',
  },
  wordsLabel: {
    width: '38%',
    fontSize: 8.5,
    color: '#475569',
  },
  wordsValue: {
    width: '62%',
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  amountBoxContainer: {
    padding: 12,
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 4,
  },
  amountBox: {
    borderWidth: 1.5,
    borderColor: '#5b21b6',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  amountText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3b0764',
  },
  footer: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  generatedNote: {
    fontSize: 7.5,
    color: '#94a3b8',
  },
  signatoryContainer: {
    alignItems: 'center',
    width: 140,
    position: 'relative',
  },
  signLine: {
    width: 120,
    borderTopWidth: 1,
    borderTopColor: '#64748b',
    marginBottom: 4,
  },
  signText: {
    fontSize: 8,
    color: '#334155',
  },
  stampImage: {
    position: 'absolute',
    top: -45,
    width: 80,
    height: 80,
    opacity: 0.88,
  },
});

interface FeeReceiptProps {
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
  logoPath?: string;
  stampPath?: string;
}

export const FeeReceiptDocument: React.FC<FeeReceiptProps> = ({
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
  logoPath,
  stampPath,
}) => {
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

  return (
    <Document title={`Fee_Receipt_${receiptNumber.replace('#', '')}`}>
      <Page size="A5" style={styles.page}>
        {/* Header */}
        <View style={styles.headerContainer}>
          {logoPath && <Image src={logoPath} style={styles.logo} />}
          <Text style={styles.title}>
            {isGujarati ? 'શ્રી વિનાયક ટ્યુશન ક્લાસીસ' : 'VINAYAK TUITION CLASSES'}
          </Text>
          <Text style={styles.subtitle}>
            {isGujarati
              ? 'બે શાખાઓ — ધોરણ ૯ થી ૧૨ માટે ગુણવત્તાયુક્ત શિક્ષણ'
              : 'Two Branches — Excellence in Education, Standards 9-12'}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Badge */}
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {isGujarati ? 'ચુકવણી રસીદ' : 'PAYMENT RECEIPT'}
            </Text>
          </View>
        </View>

        {/* Receipt Meta */}
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {isGujarati ? 'રસીદ ક્રમાંક: ' : 'Receipt No.: '}
            <Text style={styles.boldMetaText}>{receiptNumber}</Text>
          </Text>
          <Text style={styles.metaText}>
            {isGujarati ? 'તારીખ: ' : 'Date: '}
            <Text style={styles.boldMetaText}>{dateStr}</Text>
          </Text>
        </View>

        {/* Data Box */}
        <View style={styles.card}>
          {/* Row 1: Student Name */}
          <View style={styles.tableRow}>
            <Text style={styles.labelCell}>
              {isGujarati ? 'વિદ્યાર્થીનું નામ:' : 'Student Name:'}
            </Text>
            <Text style={styles.valueCell}>{studentName}</Text>
          </View>

          {/* Row 2: Standard */}
          <View style={styles.tableRow}>
            <Text style={styles.labelCell}>
              {isGujarati ? 'ધોરણ:' : 'Standard / Class:'}
            </Text>
            <Text style={styles.valueCell}>{formatStandard(standard)}</Text>
          </View>

          {/* Row 3: Branch */}
          <View style={styles.tableRow}>
            <Text style={styles.labelCell}>
              {isGujarati ? 'શાખા:' : 'Branch:'}
            </Text>
            <Text style={styles.valueCell}>{formatBranch(branch)}</Text>
          </View>

          {/* Row 4: Fees Month */}
          <View style={styles.tableRow}>
            <Text style={styles.labelCell}>
              {isGujarati ? 'ફી મહિનો:' : 'Fees Month:'}
            </Text>
            <Text style={styles.valueCell}>{feesMonth}</Text>
          </View>

          {/* Row 5: Payment Mode */}
          <View style={{ ...styles.tableRow, borderBottomWidth: 1, borderBottomColor: '#cbd5e1' }}>
            <Text style={styles.labelCell}>
              {isGujarati ? 'ચુકવણી પદ્ધતિ:' : 'Payment Mode:'}
            </Text>
            <Text style={styles.valueCell}>{formatMode(paymentMode)}</Text>
          </View>

          {/* Amount in Words Row */}
          <View style={styles.wordsRow}>
            <Text style={styles.wordsLabel}>
              {isGujarati ? 'શબ્દોમાં રકમ:' : 'Amount in Words:'}
            </Text>
            <Text style={styles.wordsValue}>{amountInWords}</Text>
          </View>

          {/* Amount Paid Box */}
          <View style={styles.amountBoxContainer}>
            <Text style={styles.amountLabel}>
              {isGujarati ? 'ચુકવેલ રકમ' : 'Amount Paid'}
            </Text>
            <View style={styles.amountBox}>
              <Text style={styles.amountText}>₹ {amount ? amount.toLocaleString('en-IN') : '0'}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.generatedNote}>
            {isGujarati ? 'આ કોમ્પ્યુટર જનરેટેડ રસીદ છે' : 'This is a computer-generated receipt'}
          </Text>

          <View style={styles.signatoryContainer}>
            {stampPath && <Image src={stampPath} style={styles.stampImage} />}
            <View style={styles.signLine} />
            <Text style={styles.signText}>
              {isGujarati ? 'અધિકૃત સહી' : 'Authorized Signatory'}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
