/** RFC 4180 field escaping: quote when the value contains quotes, commas, or newlines. */
export function csvCell(value: string | number): string {
  const s = String(value);
  return /["',\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
