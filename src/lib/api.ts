const RAW_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
export const API_BASE_URL = RAW_BASE_URL.endsWith("/api/v1")
  ? RAW_BASE_URL
  : `${RAW_BASE_URL.replace(/\/$/, "")}/api/v1`;

function normalizeApiError(errorPayload: unknown): string {
  if (!errorPayload || typeof errorPayload !== "object") return "Request failed";
  const detail = (errorPayload as { detail?: unknown }).detail;
  if (typeof detail === "string" && detail.trim()) return detail;
  if (Array.isArray(detail)) {
    const flattened = detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const msg = (item as { msg?: unknown }).msg;
          if (typeof msg === "string" && msg.trim()) return msg;
        }
        return null;
      })
      .filter(Boolean) as string[];
    if (flattened.length > 0) return flattened.join(", ");
  }
  if (detail && typeof detail === "object") {
    const msg = (detail as { msg?: unknown }).msg;
    if (typeof msg === "string" && msg.trim()) return msg;
    const reason = (detail as { reason?: unknown }).reason;
    if (typeof reason === "string" && reason.trim()) return reason;
  }
  return "Request failed";
}

/**
 * Open an external URL (e.g. an OAuth consent page) from the renderer.
 *
 * In the packaged Electron app, top-level navigation to any URL outside the
 * app's own bundle is blocked by the main process's will-navigate guard, so
 * `window.location.href = url` silently does nothing. The preload bridge's
 * `openExternal` routes the request through the main process's
 * `shell.openExternal` instead, which actually opens the OS browser. Falls
 * back to plain navigation when running outside Electron (e.g. the web dev
 * server), where no such block exists.
 */
export function openExternalUrl(url: string): void {
  if (window.irisDesktop?.openExternal) {
    window.irisDesktop.openExternal(url);
  } else {
    window.location.href = url;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("iris_token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw Object.assign(new Error(normalizeApiError(error)), {
      status: response.status,
    });
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
