// Helpers for <input type="datetime-local"> to avoid timezone shifts

// Format a Date or ISO string into the local "YYYY-MM-DDTHH:mm" string expected by datetime-local
export function toDatetimeLocalValue(input: string | Date | null | undefined): string {
  if (!input) return '';
  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

// Convert a datetime-local value (no timezone) into an ISO string (UTC) for storage
export function fromDatetimeLocalValue(value: string | null | undefined): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}
