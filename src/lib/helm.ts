import { z } from "zod";
import { auth } from "@/auth";

const helmUserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(),
  disabled: z.boolean(),
  profilePicture: z
    .object({
      version: z.string(),
      url: z.string().url(),
      blurhash: z.string().min(1),
    })
    .nullable(),
  contacts: z.array(
    z.object({
      type: z.enum([
        "phone",
        "email",
        "instagram",
        "tiktok",
        "twitter",
        "discord",
        "website",
      ]),
      value: z.string(),
      label: z.string().nullable(),
      isPrimary: z.boolean(),
      sortOrder: z.number(),
    }),
  ),
  memberships: z.array(
    z.object({
      extendedAt: z.string(),
      expiresAt: z.string().nullable(),
      endedAt: z.string().nullable(),
    }),
  ),
  access: z.object({
    roles: z.array(
      z.object({
        key: z.string(),
        name: z.string(),
      }),
    ),
    permissions: z.array(z.string()),
    applications: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        keycloakClientId: z.string(),
      }),
    ),
  }),
});

async function fetchCurrentUser(token: string) {
  const response = await fetch(
    new URL("/api/user/me", process.env.HELM_API_URL),
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Helm user request failed with status ${response.status}.`);
  }

  return helmUserSchema.parse(await response.json());
}

export async function getHelm(token?: string) {
  const accessToken = token ?? (await auth())?.accessToken;

  return {
    user: {
      me: async () => {
        if (!accessToken) {
          throw new Error("A Keycloak access token is required for Helm.");
        }

        return fetchCurrentUser(accessToken);
      },
    },
  };
}
