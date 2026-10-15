import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getConfig } from "@/lib/config";
import { STAFF_COOKIE, STAFF_TOKEN_VALUE } from "@/lib/staff";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const config = getConfig();

    if (!password || password !== config.staffPassword) {
      return NextResponse.json({ error: "Invalid staff passkey" }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set(STAFF_COOKIE, STAFF_TOKEN_VALUE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 12, // 12 hours
      path: "/",
    });

    return NextResponse.json({ success: true, message: "Staff authenticated" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(STAFF_COOKIE);
  return NextResponse.json({ success: true, message: "Logged out" });
}
