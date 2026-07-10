/**
 * Resolve the configured login background image (LOGIN_IMAGE env) to the URL the
 * login page renders:
 *   - a bare filename ("schule_login.jpg") is served from /public → "/schule_login.jpg"
 *   - an already-rooted path ("/img/x.jpg") is returned as-is
 *   - unset → null, and the login page falls back to the bundled splash
 *
 * Same-origin only by design: the CSP is `img-src 'self'`, so the image must be
 * served from this app (i.e. /public). Shared by the login page (to render it)
 * and proxy.ts (to let it through the auth gate) so the allowlisted path always
 * matches the requested one.
 */
export function resolveLoginImage(): string | null {
  const raw = process.env.LOGIN_IMAGE?.trim();
  if (!raw) return null;
  const rooted = raw.startsWith("/") ? raw : `/${raw}`;
  // Percent-encode each path segment: browsers request the encoded form
  // ("/schule login.jpg" arrives as "/schule%20login.jpg" in
  // req.nextUrl.pathname), and CSS url(...) can't contain raw spaces either.
  // Decode first so an already-encoded value isn't double-encoded.
  return rooted
    .split("/")
    .map((segment) => {
      try {
        return encodeURIComponent(decodeURIComponent(segment));
      } catch {
        // Malformed escape sequence in the segment (e.g. a literal "%")
        return encodeURIComponent(segment);
      }
    })
    .join("/");
}
