import { OAuth2Client } from "google-auth-library";

const SCOPES = ["openid", "email", "profile"];

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

export function googleOAuthClient(origin: string) {
  return new OAuth2Client(googleClientId(), googleClientSecret(), googleRedirectUri(origin));
}

export function googleAuthorizeUrl(origin: string, state: string) {
  return googleOAuthClient(origin).generateAuthUrl({
    access_type: "online",
    prompt: "select_account",
    scope: SCOPES,
    state,
  });
}

export async function googleUserFromCode(origin: string, code: string) {
  const client = googleOAuthClient(origin);
  const { tokens } = await client.getToken(code);
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
