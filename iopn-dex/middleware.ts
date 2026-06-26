import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host");

    if (host === "iopn-dex-one.vercel.app") {
        const url = request.nextUrl.clone();
            url.protocol = "https:";
                url.hostname = "iopndex.xyz";

                    return NextResponse.redirect(url, 308);
                      }

                        return NextResponse.next();
                        }

                        export const config = {
                          matcher: "/:path*",
                          };