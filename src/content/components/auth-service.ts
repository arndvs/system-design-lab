import type { Component } from "../types";

export const authService: Component = {
  id: "auth-service",
  name: "Authentication & Authorization",
  layer: "entry",
  oneLiner: "Confirms who a user is, then decides what they're allowed to do.",
  howItWorks:
    "Users sign in once, with a password, a passkey or another identity provider, and receive a short-lived token. Every request carries that token; services verify it and check the user's permissions before acting. Using a standard protocol such as OAuth 2.0 with OpenID Connect avoids inventing your own scheme.",
  addWhen: [
    "Users have accounts, or data belongs to specific users.",
    "You handle payments or personal data and must control and record who sees it.",
    "Several apps or services need to share one sign-in.",
  ],
  skipWhen: [
    "A fully public, read-only site with no accounts.",
  ],
  tradeoffs: [
    {
      cost: "Home-grown login code is a common source of serious security holes.",
      mitigation: "Use a proven identity provider or library and follow current authentication guidance.",
    },
    {
      cost: "Long-lived tokens remain usable after they leak.",
      mitigation: "Keep access tokens short-lived, rotate refresh tokens, and support revoking sessions.",
    },
    {
      cost: "If sign-in is down, nobody can use the product.",
      mitigation: "Run it redundantly, and let services verify tokens locally with published keys.",
    },
  ],
  interviewAngle:
    "Explain the difference between authentication and authorization, sessions versus tokens, and how you'd revoke access quickly.",
  tools: [
    { name: "Auth0", kind: "managed" },
    { name: "Amazon Cognito", kind: "managed" },
    { name: "Keycloak", kind: "self-hosted" },
    { name: "Ory", kind: "self-hosted" },
  ],
  related: ["api-gateway", "rate-limiter"],
  glossary: ["oauth", "least-privilege"],
  sources: [
    { title: "IETF RFC 6749: The OAuth 2.0 Authorization Framework", url: "https://datatracker.ietf.org/doc/html/rfc6749" },
    {
      title: "OWASP Cheat Sheet Series: Authentication",
      url: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html",
    },
  ],
};
