import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Daftar prefix URL yang butuh login
const protectedPrefixes = [
  '/portfolio/edit',
  '/add-hobby',
  '/edit'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cek apakah url saat ini butuh proteksi
  const isProtected = protectedPrefixes.some(prefix => pathname.startsWith(prefix));

  if (isProtected) {
    // Cek keberadaan cookie dummy_auth
    const hasAuthCookie = request.cookies.has('dummy_auth');

    if (!hasAuthCookie) {
      // Jika tidak ada cookie, lempar ke /login dan bawa url tujuan agar bisa kembali setelah login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Hanya memproses route selain API, assets, dll untuk optimasi
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|proyek|sertifikasi|placeholder).*)',
  ],
};
