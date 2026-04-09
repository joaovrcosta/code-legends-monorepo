import { NextResponse } from "next/server";
import { getAuthToken } from "@/actions/auth/session";

export async function GET() {
  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

  const resp = await fetch(`${baseUrl}/me/streak`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!resp.ok) {
    return NextResponse.json(
      { message: "Failed to fetch streak" },
      { status: resp.status },
    );
  }

  const data = await resp.json();
  return NextResponse.json(data, { status: 200 });
}

