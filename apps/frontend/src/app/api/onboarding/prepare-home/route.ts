import { auth } from "@/auth/authSetup";
import { CL_ONBOARDING_HOME_COOKIE } from "@/lib/onboarding-home-cookie";
import { NextResponse } from "next/server";

interface SessionWithToken {
  user?: unknown;
  accessToken?: string;
}

export async function POST() {
  const session = (await auth()) as SessionWithToken | null;
  if (!session?.user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const token = session.accessToken;
  if (!token) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
  const statusRes = await fetch(`${apiUrl}/users/onboarding/status`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!statusRes.ok) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const data = (await statusRes.json()) as { onboardingCompleted?: boolean };
  if (!data.onboardingCompleted) {
    return NextResponse.json(
      { ok: false, reason: "not_complete" },
      { status: 403 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(CL_ONBOARDING_HOME_COOKIE, "1", {
    path: "/",
    maxAge: 5 * 60,
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
