export function getMonthsOwed(joinDate: Date | string, currentDate: Date = new Date()): string[] {
  const months: string[] = [];
  const start = new Date(joinDate);
  const end = new Date(currentDate);

  const startYear = start.getFullYear();
  const startMonth = start.getMonth();

  const endYear = end.getFullYear();
  const endMonth = end.getMonth();

  let year = startYear;
  let month = startMonth;

  while (year < endYear || (year === endYear && month <= endMonth)) {
    const monthStr = (month + 1).toString().padStart(2, '0');
    months.push(`${year}-${monthStr}`);
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }
  return months;
}
