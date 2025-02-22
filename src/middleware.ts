import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME } from "./constants";

// Định nghĩa các routes cần check
export const config = {
  matcher: ["/chat", "/"],
};

export async function middleware(request: NextRequest) {
  // Lấy token từ cookies
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // Lấy pathname để check route hiện tại
  const pathname = request.nextUrl.pathname;

  // Nếu đang ở trang login và có token -> redirect sang chat
  if (pathname === "/" && token) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  // Nếu đang ở trang chat và không có token -> redirect về login
  if (pathname.startsWith("/chat") && !token) {
    const loginUrl = new URL("/", request.url);
    // Thêm callbackUrl để sau khi login xong redirect lại trang cũ
    loginUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify token nếu có
    if (token) {
      // Thêm logic verify JWT token ở đây
      // const decodedToken = await verifyToken(token)
    }

    // Cho phép request đi tiếp
    const response = NextResponse.next();
    response.headers.set("x-middleware-cache", "no-cache");
    return response;
  } catch (error) {
    const response = NextResponse.redirect(new URL("/", request.url));
    console.error(error);
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}
