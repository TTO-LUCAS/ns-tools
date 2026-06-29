/* ────────────────────────────────────────────────────────────────────
   Password gate — Vercel Edge Middleware (HTTP Basic Auth)
   Free on the Hobby plan. Runs on the server before any page loads.

   To TURN IT ON:  set an AUTH_PASSWORD environment variable in Vercel
   (Settings → Environment Variables). Optionally set AUTH_USER too
   (defaults to "navaal"). Redeploy. Visitors then get a username/password
   prompt before they can see anything.

   If AUTH_PASSWORD is not set, the gate is OFF and the site is open
   (it stays non-indexed regardless).
   ──────────────────────────────────────────────────────────────────── */

export const config = {
  matcher: "/:path*",   // protect everything
};

export default function middleware(request) {
  const PASSWORD = process.env.AUTH_PASSWORD;

  // No password configured → gate disabled, let the request through.
  if (!PASSWORD) return;

  const USER = process.env.AUTH_USER || "navaal";
  const header = request.headers.get("authorization") || "";
  const [scheme, encoded] = header.split(" ");

  if (scheme === "Basic" && encoded) {
    let decoded = "";
    try { decoded = atob(encoded); } catch (e) { decoded = ""; }
    const i = decoded.indexOf(":");
    const user = decoded.slice(0, i);
    const pass = decoded.slice(i + 1);
    if (user === USER && pass === PASSWORD) return; // ✓ correct → allow
  }

  // Missing/incorrect credentials → trigger the browser login prompt.
  return new Response("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="NS Invoice Maker"' },
  });
}
