import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { authMiddleware } from '@kinde-oss/kinde-auth-nextjs/server'

export const config = {
  matcher: ['/dashboard/:path*', '/auth-callback'],
}

// export default authMiddleware



export default function middleware(req: any) {
  return withAuth(req);
}
