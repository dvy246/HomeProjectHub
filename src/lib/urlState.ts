/**
 * urlState.ts — bidirectional URL ↔ state synchronization utilities.
 *
 * Syncs a flat Record<string, string | number | boolean> with browser URL
 * query parameters using history.replaceState (no page reload).
 *
 * Usage in a designer:
 *   import { getUrlParam, setUrlParams, copyShareUrl } from "../../lib/urlState";
 *   // Initialize state from URL on mount:
 *   const [length, setLength] = useState(() => getUrlParam("len", 12));
 *   // Write back on state change:
 *   useEffect(() => { setUrlParams({ len: length, wid: width }); }, [length, width]);
 */

type ParamValue = string | number | boolean;
type ParamRecord = Record<string, ParamValue>;

/** Read a numeric URL param, returning defaultValue if missing or not a number. */
export function getUrlParam(key: string, defaultValue: number): number;
/** Read a string URL param, returning defaultValue if missing. */
export function getUrlParam(key: string, defaultValue: string): string;
/** Read a boolean URL param ("1"/"true" → true), returning defaultValue if missing. */
export function getUrlParam(key: string, defaultValue: boolean): boolean;
export function getUrlParam(key: string, defaultValue: ParamValue): ParamValue {
  if (typeof window === "undefined") return defaultValue;
  const params = new URLSearchParams(window.location.search);
  const raw = params.get(key);
  if (raw === null) return defaultValue;

  if (typeof defaultValue === "number") {
    const parsed = parseFloat(raw);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  if (typeof defaultValue === "boolean") {
    return raw === "1" || raw === "true";
  }
  return raw;
}

/**
 * Write multiple params to the URL query string without reloading.
 * Params equal to their defaults are omitted to keep URLs clean.
 */
export function setUrlParams(params: ParamRecord, defaults?: ParamRecord): void {
  if (typeof window === "undefined") return;
  const current = new URLSearchParams(window.location.search);

  for (const [key, value] of Object.entries(params)) {
    const defaultVal = defaults?.[key];
    if (defaultVal !== undefined && String(value) === String(defaultVal)) {
      current.delete(key);
    } else if (typeof value === "boolean") {
      value ? current.set(key, "1") : current.delete(key);
    } else {
      current.set(key, String(value));
    }
  }

  const newSearch = current.toString();
  const newUrl =
    window.location.pathname +
    (newSearch ? "?" + newSearch : "") +
    window.location.hash;

  window.history.replaceState(null, "", newUrl);
}

/**
 * Copies the current page URL (including synced state params) to clipboard.
 * Returns a Promise<boolean> — true on success.
 */
export async function copyShareUrl(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    await navigator.clipboard.writeText(window.location.href);
    return true;
  } catch {
    return false;
  }
}
