/**
 * Type predicate that validates redirect URLs to prevent open redirect vulnerabilities.
 * Only allows same-origin redirects or whitelisted safe paths.
 */
export function isValidRedirect(
  redirectUrl: string | null,
): redirectUrl is string {
  if (!redirectUrl || typeof redirectUrl !== "string") return false;

  try {
    // Try parsing as absolute URL
    const url = new URL(
      redirectUrl,
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost",
    );

    // Only allow same-origin (no protocol/host change) or relative paths
    // Check if it's a relative path or same origin
    if (redirectUrl.startsWith("/")) {
      // Relative path - safe
      // Ensure it doesn't start with // (protocol-relative URL)
      return !redirectUrl.startsWith("//");
    }

    // Absolute URL - check if same origin
    if (typeof window !== "undefined") {
      const currentOrigin = new URL(window.location.href).origin;
      return url.origin === currentOrigin;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Returns a safe redirect URL or the fallback if invalid.
 */
export function getSafeRedirectUrl(
  redirectUrl: string | null,
  fallback: string = "/dashboard",
): string {
  return isValidRedirect(redirectUrl) ? redirectUrl : fallback;
}
