import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ONLY_ROUTES = ["/giris", "/sifremi-unuttum", "/kayit"];
const SESSION_NEUTRAL_ROUTES = ["/sifre-sifirla"];
const PASSTHROUGH_PREFIXES = ["/auth/", "/api/"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (PASSTHROUGH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return response;
  }

  const isAuthenticated = Boolean(user);

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = isAuthenticated ? "/anasayfa" : "/giris";
    return NextResponse.redirect(url);
  }

  if (PUBLIC_ONLY_ROUTES.includes(pathname)) {
    if (isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = "/anasayfa";
      return NextResponse.redirect(url);
    }
    return response;
  }

  if (SESSION_NEUTRAL_ROUTES.includes(pathname)) {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = "/giris";
      return NextResponse.redirect(url);
    }
    return response;
  }

  if (!isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/giris";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}
