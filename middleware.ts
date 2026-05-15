import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userRole = request.cookies.get('userRole')?.value;
  const path = request.nextUrl.pathname;

  // Хүргэлтийн ажилтан эсвэл админ л /delivery хуудас руу орно
  if (path.startsWith('/delivery')) {
    if (userRole !== 'delivery' && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // Зөвхөн админ /admin хуудас руу орно
  if (path.startsWith('/admin')) {
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/delivery/:path*'],
};
