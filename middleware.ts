import { NextRequest, NextResponse } from "next/server";

const DISCORD_SESSION_COOKIE_NAME = "kether_discord_session";

type DiscordSessionPayload = {
  sub: string;
    guildId: string;
      roleIds: string[];
        exp: number;
        };

        const PUBLIC_PATHS = [
          "/",
            "/login",
              "/unauthorized",
  "/api/discord",
                "/api/auth/discord/login",
                  "/api/auth/discord/callback",
                    "/api/auth/logout",
                      "/api/auth/session",
                        "/api/auth/permission",
                          "/api/billing/status",
                          ];

                          function normalizePathname(pathname: string) {
                            if (pathname.length > 1 && pathname.endsWith("/")) {
                                return pathname.slice(0, -1);
                                  }

                                    return pathname;
                                    }

                                    function isPublicPath(pathname: string) {
                                      const normalizedPathname = normalizePathname(pathname);

                                        return (
                                            PUBLIC_PATHS.includes(normalizedPathname) ||
                                                normalizedPathname.startsWith("/_next/") ||
                                                    normalizedPathname.startsWith("/favicon") ||
                                                        normalizedPathname.startsWith("/images/") ||
                                                            normalizedPathname.startsWith("/assets/")
                                                              );
                                                              }

                                                              function base64UrlToBytes(value: string) {
                                                                const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
                                                                  const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
                                                                    const binary = atob(paddedBase64);
                                                                      const bytes = new Uint8Array(binary.length);

                                                                        for (let index = 0; index < binary.length; index += 1) {
                                                                            bytes[index] = binary.charCodeAt(index);
                                                                              }

                                                                                return bytes;
                                                                                }

                                                                                function bytesToBase64Url(buffer: ArrayBuffer) {
                                                                                  const bytes = new Uint8Array(buffer);
                                                                                    let binary = "";

                                                                                      for (let index = 0; index < bytes.length; index += 1) {
                                                                                          binary += String.fromCharCode(bytes[index]);
                                                                                            }

                                                                                              return btoa(binary)
                                                                                                  .replace(/\+/g, "-")
                                                                                                      .replace(/\//g, "_")
                                                                                                          .replace(/=+$/g, "");
                                                                                                          }

                                                                                                          function timingSafeStringEqual(left: string, right: string) {
                                                                                                            if (left.length !== right.length) {
                                                                                                                return false;
                                                                                                                  }

                                                                                                                    let diff = 0;

                                                                                                                      for (let index = 0; index < left.length; index += 1) {
                                                                                                                          diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
                                                                                                                            }

                                                                                                                              return diff === 0;
                                                                                                                              }

                                                                                                                              async function signSessionPayload(unsignedPayload: string, secret: string) {
                                                                                                                                const encoder = new TextEncoder();

                                                                                                                                  const key = await crypto.subtle.importKey(
                                                                                                                                      "raw",
                                                                                                                                          encoder.encode(secret),
                                                                                                                                              {
                                                                                                                                                    name: "HMAC",
                                                                                                                                                          hash: "SHA-256",
                                                                                                                                                              },
                                                                                                                                                                  false,
                                                                                                                                                                      ["sign"],
                                                                                                                                                                        );

                                                                                                                                                                          const signature = await crypto.subtle.sign(
                                                                                                                                                                              "HMAC",
                                                                                                                                                                                  key,
                                                                                                                                                                                      encoder.encode(unsignedPayload),
                                                                                                                                                                                        );

                                                                                                                                                                                          return bytesToBase64Url(signature);
                                                                                                                                                                                          }

                                                                                                                                                                                          async function verifyDiscordSessionCookieValue(value: string, secret: string) {
                                                                                                                                                                                            const [unsignedPayload, signature] = value.split(".");

                                                                                                                                                                                              if (!unsignedPayload || !signature) {
                                                                                                                                                                                                  return null;
                                                                                                                                                                                                    }

                                                                                                                                                                                                      const expectedSignature = await signSessionPayload(unsignedPayload, secret);

                                                                                                                                                                                                        if (!timingSafeStringEqual(signature, expectedSignature)) {
                                                                                                                                                                                                            return null;
                                                                                                                                                                                                              }

                                                                                                                                                                                                                try {
                                                                                                                                                                                                                    const payload = JSON.parse(
                                                                                                                                                                                                                          new TextDecoder().decode(base64UrlToBytes(unsignedPayload)),
                                                                                                                                                                                                                              ) as DiscordSessionPayload;

                                                                                                                                                                                                                                  const now = Math.floor(Date.now() / 1000);

                                                                                                                                                                                                                                      if (
                                                                                                                                                                                                                                            !payload.sub ||
                                                                                                                                                                                                                                                  !payload.guildId ||
                                                                                                                                                                                                                                                        !Array.isArray(payload.roleIds) ||
                                                                                                                                                                                                                                                              payload.exp <= now
                                                                                                                                                                                                                                                                  ) {
                                                                                                                                                                                                                                                                        return null;
                                                                                                                                                                                                                                                                            }

                                                                                                                                                                                                                                                                                return payload;
                                                                                                                                                                                                                                                                                  } catch {
                                                                                                                                                                                                                                                                                      return null;
                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                        }

                                                                                                                                                                                                                                                                                        function redirectToLogin(request: NextRequest) {
                                                                                                                                                                                                                                                                                          const loginUrl = new URL("/login", request.url);
                                                                                                                                                                                                                                                                                            loginUrl.searchParams.set("next", request.nextUrl.pathname);
                                                                                                                                                                                                                                                                                              return NextResponse.redirect(loginUrl);
                                                                                                                                                                                                                                                                                              }

                                                                                                                                                                                                                                                                                              export async function middleware(request: NextRequest) {
                                                                                                                                                                                                                                                                                                const { pathname } = request.nextUrl;

                                                                                                                                                                                                                                                                                                  if (isPublicPath(pathname)) {
                                                                                                                                                                                                                                                                                                      return NextResponse.next();
                                                                                                                                                                                                                                                                                                        }

                                                                                                                                                                                                                                                                                                          const sessionSecret = process.env.SESSION_SECRET || "";
                                                                                                                                                                                                                                                                                                            const guildId = process.env.DISCORD_GUILD_ID || "";
                                                                                                                                                                                                                                                                                                              const allowedRoleIds = (process.env.DISCORD_ALLOWED_ROLE_IDS || "")
                                                                                                                                                                                                                                                                                                                  .split(",")
                                                                                                                                                                                                                                                                                                                      .map((roleId) => roleId.trim())
                                                                                                                                                                                                                                                                                                                          .filter(Boolean);

                                                                                                                                                                                                                                                                                                                            if (!sessionSecret || !guildId) {
                                                                                                                                                                                                                                                                                                                                return NextResponse.redirect(new URL("/unauthorized", request.url));
                                                                                                                                                                                                                                                                                                                                  }

                                                                                                                                                                                                                                                                                                                                    const sessionCookie = request.cookies.get(DISCORD_SESSION_COOKIE_NAME)?.value;

                                                                                                                                                                                                                                                                                                                                      if (!sessionCookie) {
                                                                                                                                                                                                                                                                                                                                          return redirectToLogin(request);
                                                                                                                                                                                                                                                                                                                                            }

                                                                                                                                                                                                                                                                                                                                              const session = await verifyDiscordSessionCookieValue(
                                                                                                                                                                                                                                                                                                                                                  sessionCookie,
                                                                                                                                                                                                                                                                                                                                                      sessionSecret,
                                                                                                                                                                                                                                                                                                                                                        );

                                                                                                                                                                                                                                                                                                                                                          if (!session) {
                                                                                                                                                                                                                                                                                                                                                              return redirectToLogin(request);
                                                                                                                                                                                                                                                                                                                                                                }

                                                                                                                                                                                                                                                                                                                                                                  const guildOk = session.guildId === guildId;
                                                                                                                                                                                                                                                                                                                                                                    const roleCheckEnabled = allowedRoleIds.length > 0;
                                                                                                                                                                                                                                                                                                                                                                      const roleOk =
                                                                                                                                                                                                                                                                                                                                                                          !roleCheckEnabled ||
                                                                                                                                                                                                                                                                                                                                                                              session.roleIds.some((roleId) => allowedRoleIds.includes(roleId));

                                                                                                                                                                                                                                                                                                                                                                                if (!guildOk || !roleOk) {
                                                                                                                                                                                                                                                                                                                                                                                    return NextResponse.redirect(new URL("/unauthorized", request.url));
                                                                                                                                                                                                                                                                                                                                                                                      }

                                                                                                                                                                                                                                                                                                                                                                                        return NextResponse.next();
                                                                                                                                                                                                                                                                                                                                                                                        }

                                                                                                                                                                                                                                                                                                                                                                                        export const config = {
                                                                                                                                                                                                                                                                                                                                                                                          matcher: [
                                                                                                                                                                                                                                                                                                                                                                                              "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|txt|xml)$).*)",
                                                                                                                                                                                                                                                                                                                                                                                                ],
                                                                                                                                                                                                                                                                                                                                                                                                };