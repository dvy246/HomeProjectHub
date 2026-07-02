export function parseNumber(val: string): number {
  if (val === "" || val === undefined || val === null) return 0;
  const n = parseFloat(val);
  return Number.isNaN(n) || n < 0 ? 0 : n;
}

export function isValidNumber(val: string): boolean {
  if (val === "" || val === undefined || val === null) return false;
  const n = parseFloat(val);
  return !Number.isNaN(n) && n > 0;
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
