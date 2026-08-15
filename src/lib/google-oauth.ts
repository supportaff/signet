import { OAuth2Client } from "google-auth-library";
import { site } from "@/lib/site";

const SCOPES = ["openid", "email", "profile"];

export function authOrigin(request: Request) {
  if (process.env.VERCEL_ENV === "production") return site.url;
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;
  const host = (request.headers.get("x-forwarded-host") || request.headers.get("host") || "")
    .split(",")[0]
    .trim();
  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    (host.includes("localhost") || host.startsWith("127.") ? "http" : "https");
  if (host) return `${proto}://${host}`;
  return new URL(request.url).origin;
}

export function googleClientId() {
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || "";
}

export function googleClientSecret() {
  return process.env.GOOGLE_CLIENT_SECRET || "";
}

export function isGoogleAuthConfigured() {
  return Boolean(googleClientId() && googleClientSecret() && process.env.AUTH_SECRET);
}

export function googleRedirectUri(origin: string) {
  return `${origin}/api/auth/google/callback`;
}

export function googleOAuthClient(redirectUri: string) {
  return new OAuth2Client(googleClientId(), googleClientSecret(), redirectUri);
}

export function googleAuthorizeUrl(redirectUri: string, state: string) {
  return googleOAuthClient(redirectUri).generateAuthUrl({
    access_type: "online",
    prompt: "select_account",
    scope: SCOPES,
    state,
    include_granted_scopes: false,
  });
}

export async function googleUserFromCode(redirectUri: string, code: string) {
  const client = googleOAuthClient(redirectUri);
  const { tokens } = await client.getToken({
    code,
    redirect_uri: redirectUri,
  });
  if (!tokens.id_token) {
    throw new Error("Google did not return an ID token.");
  }

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: googleClientId(),
  });
  const payload = ticket.getPayload();
  if (!payload?.sub) {
    throw new Error("Google ID token was missing a subject.");
  }
  if (!payload.email) {
    throw new Error("That Google account has no email.");
  }

  return {
    id: `google:${payload.sub}`,
    email: payload.email,
    name: payload.name || payload.given_name || payload.email.split("@")[0] || "Signed in",
  };
}
