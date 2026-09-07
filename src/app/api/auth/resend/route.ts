import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mail";
import { createVerifyToken, hashToken } from "@/lib/tokens";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    if (!email.includes("@")) {
      return NextResponse.json({ error: "Check your email." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.emailVerified) {
      return NextResponse.json({ ok: true });
    }

    const token = createVerifyToken();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifyToken: hashToken(token),
        emailVerifyTokenExpiresAt: new Date(Date.now() + 86400000),
      },
    });

    const origin = process.env.APP_URL || "https://catch-app-rana-essam-amman.vercel.app";
    try {
      await sendVerificationEmail(email, `${origin}/verify?token=${token}`);
    } catch {
      return NextResponse.json({ error: "Could not send verification email." }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not resend email." }, { status: 500 });
  }
}
