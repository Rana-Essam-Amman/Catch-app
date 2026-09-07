import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie, signSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    if (!user.emailVerified) {
      return NextResponse.json({ error: "Verify your email before signing in." }, { status: 403 });
    }
    await setSessionCookie(await signSession(user.id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not sign in." }, { status: 500 });
  }
}
