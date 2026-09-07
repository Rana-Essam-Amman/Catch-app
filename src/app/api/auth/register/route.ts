import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mail";
import { normalizeJordanPhone } from "@/lib/phone";
import { createVerifyToken, hashToken } from "@/lib/tokens";

function appOrigin() {
  return process.env.APP_URL || "https://catch-app-rana-essam-amman.vercel.app";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const phone = normalizeJordanPhone(String(body.phone || ""));
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const handle = String(body.handle || "").trim().replace(/^@/, "");

    if (!phone) {
      return NextResponse.json({ error: "Use a valid Jordanian mobile number." }, { status: 400 });
    }
    if (!email.includes("@") || password.length < 6 || handle.length < 2) {
      return NextResponse.json({ error: "Check email, handle, and password (6+ chars)." }, { status: 400 });
    }

    const exists = await prisma.user.findFirst({
      where: { OR: [{ email }, { handle }, { phoneNumber: phone }] },
    });
    if (exists) {
      return NextResponse.json({ error: "Email, handle, or phone already registered." }, { status: 409 });
    }

    const token = createVerifyToken();
    await prisma.user.create({
      data: {
        email,
        name: handle,
        handle,
        phoneNumber: phone,
        passwordHash: await bcrypt.hash(password, 10),
        emailVerified: false,
        emailVerifyToken: hashToken(token),
        emailVerifyTokenExpiresAt: new Date(Date.now() + 86400000),
      },
    });

    try {
      await sendVerificationEmail(email, `${appOrigin()}/verify?token=${token}`);
    } catch {
      return NextResponse.json({
        ok: false,
        needsVerification: true,
        error: "Account created, but the verification email could not be sent. Use resend.",
      }, { status: 202 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not create account." }, { status: 500 });
  }
}
