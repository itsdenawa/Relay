import { publicEnvironment } from "@/shared/config/env";

function normalizeOrigin(value: string | null | undefined) {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function getAllowedOrigins() {
  const origins = new Set<string>();
  const canonicalOrigin = normalizeOrigin(
    publicEnvironment.NEXT_PUBLIC_SITE_URL,
  );
  const vercelOrigin = process.env.VERCEL_URL
    ? normalizeOrigin(`https://${process.env.VERCEL_URL}`)
    : null;

  if (canonicalOrigin) origins.add(canonicalOrigin);
  if (vercelOrigin) origins.add(vercelOrigin);

  if (process.env.NODE_ENV === "development") {
    origins.add("http://127.0.0.1:3000");
    origins.add("http://localhost:3000");
  }

  return origins;
}

export function getSafeRequestOrigin(
  value: string | null | undefined,
  fallback = publicEnvironment.NEXT_PUBLIC_SITE_URL,
) {
  const fallbackOrigin = normalizeOrigin(fallback);
  const requestedOrigin = normalizeOrigin(value);

  if (requestedOrigin && getAllowedOrigins().has(requestedOrigin)) {
    return requestedOrigin;
  }

  if (fallbackOrigin) {
    return fallbackOrigin;
  }

  return "http://127.0.0.1:3000";
}
