export default function startsWithNumber(str: string): boolean {
  if (str.length === 0) return false;
  return Number.parseInt(str.charAt(0)) >= 0;
}