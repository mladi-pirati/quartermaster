import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import { z } from "zod";
import { getHelm } from "@/lib/helm";
import {
  keycloakProfileHasClientRole,
  keycloakAccessTokenHasClientRole,
  getKeycloakUsernameFromProfile,
  getKeycloakFullNameFromProfile,
} from "@/lib/auth/keycloak-access";

const keycloakProfileSchema = z
  .object({ sub: z.string().min(1) })
  .passthrough();

async function refreshAccessToken(refreshToken: string) {
  const response = await fetch(
    `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: process.env.KEYCLOAK_CLIENT_ID!,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
        refresh_token: refreshToken,
      }),
    },
  );
  if (!response.ok) return null;
  const data = (await response.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    accessTokenExpiresAt: Math.floor(Date.now() / 1000) + data.expires_in,
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Keycloak({
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      issuer: process.env.KEYCLOAK_ISSUER,
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "keycloak") return false;

      const hasRole =
        keycloakProfileHasClientRole(profile, process.env.KEYCLOAK_CLIENT_ID ?? "") ||
        keycloakAccessTokenHasClientRole(
          account.access_token,
          process.env.KEYCLOAK_CLIENT_ID ?? "",
        );
      if (!hasRole) return false;

      try {
        const helm = await getHelm(account.access_token);
        const user = await helm.user.me();
        return user.applications.some(
          (a) => a.keycloakClientId === process.env.KEYCLOAK_CLIENT_ID,
        );
      } catch {
        return false;
      }
    },
    async jwt({ token, account, profile }) {
      // Initial sign-in: store tokens and profile data from Keycloak
      if (account?.provider === "keycloak" && account.access_token) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpiresAt =
          account.expires_at ??
          Math.floor(Date.now() / 1000) + (account.expires_in ?? 300);
        const parsed = keycloakProfileSchema.safeParse(profile);
        if (parsed.success) token.keycloakUserId = parsed.data.sub;
        token.username = getKeycloakUsernameFromProfile(profile) ?? "";
        token.fullName = getKeycloakFullNameFromProfile(profile) ?? "";
        return token;
      }

      // Token still valid with 30s buffer
      if (Date.now() / 1000 < (token.accessTokenExpiresAt ?? 0) - 30) {
        return token;
      }

      // Refresh expired token
      if (!token.refreshToken) return null;
      const refreshed = await refreshAccessToken(token.refreshToken);
      if (!refreshed) return null;

      return {
        ...token,
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken,
        accessTokenExpiresAt: refreshed.accessTokenExpiresAt,
      };
    },
    async session({ session, token }) {
      if (token.accessToken) session.accessToken = token.accessToken;
      if (session.user) {
        session.user.keycloakUserId = token.keycloakUserId ?? "";
        session.user.username = token.username ?? "";
        session.user.fullName = token.fullName ?? "";
      }
      return session;
    },
  },
});
