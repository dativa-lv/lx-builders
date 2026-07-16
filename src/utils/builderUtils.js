export function isDate(format) {
  return (
    format === 'date' ||
    format === 'time' ||
    format === 'time-full' ||
    format === 'date-time' ||
    format === 'date-time-full' ||
    format === 'year' ||
    format === 'month' ||
    format === 'month-year' ||
    format === 'quarters' ||
    format === 'day-month'
  );
}
