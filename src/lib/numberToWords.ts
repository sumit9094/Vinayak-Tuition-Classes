/**
 * Utility to convert numbers to Indian currency words (Lakh / Crore format)
 * Supports both English ('en') and Gujarati ('gj').
 */

const onesEN = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const tensEN = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

const onesGJ = [
  '', 'એક', 'બે', 'ત્રણ', 'ચાર', 'પાંચ', 'છ', 'સાત', 'આઠ', 'નવ',
  'દસ', 'અગિયાર', 'બાર', 'તેર', 'ચૌદ', 'પંદર', 'સોળ',
  'સત્તર', 'અઢાર', 'ઓગણીસ'
];

const tensGJ = [
  '', '', 'વીસ', 'ત્રીસ', 'ચાલીસ', 'પચાસ', 'સાઠ', 'સિત્તેર', 'એંસી', 'નેવુ'
];

// Special compound numbers 21-99 for natural Gujarati phrasing
function numberToTwoDigitsGJ(n: number): string {
  if (n < 20) return onesGJ[n];
  const ten = Math.floor(n / 10);
  const rem = n % 10;
  if (rem === 0) return tensGJ[ten];
  
  // Natural Gujarati number words 21-99
  const customGJ: Record<number, string> = {
    21: 'એકવીસ', 22: 'બાવીસ', 23: 'તેવીસ', 24: 'ચોવીસ', 25: 'પચ્ચીસ', 26: 'છવ્વીસ', 27: 'સત્તાવીસ', 28: 'અઠ્ઠાવીસ', 29: 'ઓગણત્રીસ',
    31: 'એકત્રીસ', 32: 'બત્રીસ', 33: 'તેત્રીસ', 34: 'ચોત્રીસ', 35: 'પાંત્રીસ', 36: 'છત્રીસ', 37: 'સંત્રીસ', 38: 'અડત્રીસ', 39: 'ઓગણચાળીસ',
    41: 'એકતાલીસ', 42: 'બેતાલીસ', 43: 'તાલીસ', 44: 'ચોવાલીસ', 45: 'પિસ્તાલીસ', 46: 'છેતાલીસ', 47: 'સડતાલીસ', 48: 'અડતાલીસ', 49: 'ઓગણપચાસ',
    51: 'એકાવન', 52: 'બાવન', 53: 'ત્રેપન', 54: 'ચોપન', 55: 'પંચાવન', 56: 'છપ્પન', 57: 'સત્તાવન', 58: 'અઠ્ઠાવન', 59: 'ઓગણસાઠ',
    61: 'એકસઠ', 62: 'બાસઠ', 63: 'ત્રેસઠ', 64: 'ચોસઠ', 65: 'પંસઠ', 66: 'છાસઠ', 67: 'સડસઠ', 68: 'અડસઠ', 69: 'ઓગણસિત્તેર',
    71: 'એકોતેર', 72: 'બોતેર', 73: 'ત્રોતેર', 74: 'ચુમ્માલીસ', 75: 'પંચોતેર', 76: 'છોતેર', 77: 'સિત્તેર', 78: 'અઠ્ઠોતેર', 79: 'ઓગણએંસી',
    81: 'એક્યાસી', 82: 'બ્યાસી', 83: 'ત્યાસી', 84: 'ચોર્યાસી', 85: 'પંચાસી', 86: 'છિયાસી', 87: 'સત્યાસી', 88: 'અઠ્યાસી', 89: 'નવ્યાસી',
    91: 'એકCross', 92: 'બાCross', 93: 'તાCross', 94: 'ચોCross', 95: 'પંચાણું', 96: 'છિન્નામું', 97: 'સત્તાણું', 98: 'અઠ્ઠાણું', 99: 'નવ્વાણું'
  };

  if (customGJ[n]) return customGJ[n];
  return `${tensGJ[ten]} ${onesGJ[rem]}`;
}

function convertLessThanThousandEN(n: number): string {
  let str = '';
  if (n >= 100) {
    str += onesEN[Math.floor(n / 100)] + ' Hundred ';
    n %= 100;
  }
  if (n >= 20) {
    str += tensEN[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + onesEN[n % 10] : '');
  } else if (n > 0) {
    str += onesEN[n];
  }
  return str.trim();
}

function convertLessThanThousandGJ(n: number): string {
  let str = '';
  if (n >= 100) {
    str += onesGJ[Math.floor(n / 100)] + ' સો ';
    n %= 100;
  }
  if (n > 0) {
    str += numberToTwoDigitsGJ(n);
  }
  return str.trim();
}

export function numberToWordsIndian(num: number, lang: 'en' | 'gj' = 'en'): string {
  if (num === 0) {
    return lang === 'gj' ? 'રૂપિયા શૂન્ય પૂરા' : 'Rupees Zero Only';
  }

  const amount = Math.floor(Math.abs(num));
  let result = '';

  const crore = Math.floor(amount / 10000000);
  let remainder = amount % 10000000;

  const lakh = Math.floor(remainder / 100000);
  remainder %= 100000;

  const thousand = Math.floor(remainder / 1000);
  remainder %= 1000;

  if (lang === 'gj') {
    if (crore > 0) {
      result += numberToTwoDigitsGJ(crore) + ' કરોડ ';
    }
    if (lakh > 0) {
      result += numberToTwoDigitsGJ(lakh) + ' લાખ ';
    }
    if (thousand > 0) {
      result += numberToTwoDigitsGJ(thousand) + ' હજાર ';
    }
    if (remainder > 0) {
      result += convertLessThanThousandGJ(remainder);
    }
    return `રૂપિયા ${result.trim()} પૂરા`;
  } else {
    if (crore > 0) {
      result += convertLessThanThousandEN(crore) + ' Crore ';
    }
    if (lakh > 0) {
      result += convertLessThanThousandEN(lakh) + ' Lakh ';
    }
    if (thousand > 0) {
      result += convertLessThanThousandEN(thousand) + ' Thousand ';
    }
    if (remainder > 0) {
      result += convertLessThanThousandEN(remainder);
    }
    return `Rupees ${result.trim()} Only`;
  }
}
