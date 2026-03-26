export function safeParse<T>(
  value: unknown,
  parser: (val: any) => T
): T | null {
  try {
    return parser(value);
  } catch {
    return null;
  }
}

export function parseJsonSafe<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function parseDateSafe(value: string): Date | null {
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  } catch {
    return null;
  }
}
