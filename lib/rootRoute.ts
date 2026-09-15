const DEFAULT_ROOT_ROUTE = "/manage";

export function getConfiguredRootRoute(): string {
  const configured = process.env.OPENLIBRY_ROOT_ROUTE?.trim();
  if (
    !configured ||
    configured === "/" ||
    !configured.startsWith("/") ||
    configured.startsWith("//") ||
    configured.includes("\\")
  ) {
    return DEFAULT_ROOT_ROUTE;
  }

  return configured;
}

export function isPublicRoutePath(pathname: string): boolean {
  return (
    pathname === "/catalog" ||
    pathname.startsWith("/catalog/") ||
    pathname === "/api/version" ||
    pathname.startsWith("/api/public/") ||
    pathname.startsWith("/api/images")
  );
}
