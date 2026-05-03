const configuredSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const configuredSupabasePublicKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function decodeJwtPayload(token: string) {
  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  try {
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(atob(padded)) as { role?: string };
  } catch {
    return null;
  }
}

function assertSafePublicKey(key: string) {
  if (key.startsWith("sb_secret_")) {
    throw new Error(
      "Invalid Supabase public key: received an sb_secret key. Use NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or the legacy anon key."
    );
  }

  const payload = decodeJwtPayload(key);
  if (payload?.role === "service_role") {
    throw new Error(
      "Invalid Supabase public key: NEXT_PUBLIC_SUPABASE_ANON_KEY is currently set to a service_role key. Replace it with the project's publishable key or legacy anon key."
    );
  }
}

if (!configuredSupabaseUrl || !configuredSupabasePublicKey) {
  throw new Error(
    "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or legacy NEXT_PUBLIC_SUPABASE_ANON_KEY)."
  );
}

assertSafePublicKey(configuredSupabasePublicKey);

export const supabaseUrl = configuredSupabaseUrl;
export const supabasePublicKey = configuredSupabasePublicKey;
