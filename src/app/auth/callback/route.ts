import { type NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/shared/api/supabase/server";
import { getSafeRedirectPath, getSafeRequestOrigin } from "@/shared/lib";

function getRedirectOrigin(request: NextRequest) {
  if (process.env.NODE_ENV === "development") {
    const host = request.headers.get("host");

    if (host) {
      return getSafeRequestOrigin(`${request.nextUrl.protocol}//${host}`);
    }
  }

  return getSafeRequestOrigin(request.nextUrl.origin);
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = getSafeRedirectPath(
    request.nextUrl.searchParams.get("next"),
    "/",
  );
  const origin = getRedirectOrigin(request);

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  const loginUrl = new URL("/login", origin);
  loginUrl.searchParams.set(
    "error",
    "This sign-in link is invalid or expired. Please try again.",
  );
  return NextResponse.redirect(loginUrl);
}
