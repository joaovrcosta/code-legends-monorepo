"use server";

import { getAuthToken } from "./get-auth-token";

function isJwtLike(token?: string | null) {
  return Boolean(token && token.split(".").length === 3);
}

export async function buildApiHeaders(
  extraHeaders?: HeadersInit,
  providedToken?: string
): Promise<HeadersInit> {
  const headers = new Headers(extraHeaders);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = isJwtLike(providedToken) ? providedToken : await getAuthToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}
