import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabasePublicKey, supabaseUrl } from "@/lib/supabaseConfig";

type AppRole = "student" | "faculty" | "admin";
type CookieToSet = { name: string; value: string; options?: CookieOptions };

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabasePublicKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 2. Check Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const path = url.pathname;

  // RULE 1: If NOT logged in, and trying to access /main -> Kick to Login
  if (!user && path.startsWith("/main")) {
    url.pathname = "/auth/login";
    url.searchParams.set("next", path);
    const redirectResponse = NextResponse.redirect(url);
    response.cookies.getAll().forEach(cookie => {
        redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  }

  // RULE 2: If Logged in, Check ROLE in the 'users' table
  if (user && path.startsWith("/main")) {
    
    // Fetch role securely (Prefer JWT metadata to avoid database hit, fallback to DB for legacy accounts)
    let userRole = user.user_metadata?.role as AppRole | undefined;

    if (!userRole) {
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();
      userRole = userData?.role as AppRole | undefined;
    }

    if (!userRole) {
      url.pathname = "/auth/login";
      const redirectResponse = NextResponse.redirect(url);
      response.cookies.getAll().forEach(cookie => {
          redirectResponse.cookies.set(cookie.name, cookie.value);
      });
      return redirectResponse;
    }

    const isFacultyLike = userRole === "faculty" || userRole === "admin";

    // --- SECURITY LOGIC ---

    // A. STUDENT trying to access FACULTY pages -> Kick to Student Dashboard
    if (!isFacultyLike && path.startsWith("/main/faculty")) {
      url.pathname = "/main/student/dashboard";
      const redirectResponse = NextResponse.redirect(url);
      response.cookies.getAll().forEach(cookie => {
          redirectResponse.cookies.set(cookie.name, cookie.value);
      });
      return redirectResponse;
    }

    // B. FACULTY/ADMIN trying to access STUDENT pages -> Kick to Faculty dashboard
    if (isFacultyLike && path.startsWith("/main/student")) {
      url.pathname = "/main/faculty/dashboard";
      const redirectResponse = NextResponse.redirect(url);
      response.cookies.getAll().forEach(cookie => {
          redirectResponse.cookies.set(cookie.name, cookie.value);
      });
      return redirectResponse;
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|auth/|sw\\.js|manifest\\.json|icons/|workbox-.*\\.js).*)",
  ],
};
