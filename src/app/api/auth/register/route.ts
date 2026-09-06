import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mail";

const JO_PHONE = /^(?:\+962|00962|0)?7[789]\d{7}$/;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const phone = String(body.phone || "").replace(/\s+/g, "");
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const handle = String(body.handle || "").trim().replace(/^@/, "");
    if (!JO_PHONE.test(phone)) return NextResponse.json({ error: "Use a valid Jordanian mobile number." }, { status: 400 });
    if (!email.includes("@") || password.length < 6 || handle.length < 2) return NextResponse.json({ error: "Check email, handle, and password (6+ chars)." }, { status: 400 });
    const exists = await prisma.user.findFirst({ where: { OR: [{ email }, { handle }, { phoneNumber: phone }] } });
    if (exists) return NextResponse.json({ error: "Email, handle, or phone already registered." }, { status: 409 });
    const token = randomBytes(24).toString("hex");
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { email, name: handle, handle, phoneNumber: phone, passwordHash, emailVerified: false, emailVerifyToken: token, emailVerifyTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24) } });
    const origin = process.env.APP_URL || "https://catch-app-rana-essam-amman.vercel.app";
    await sendVerificationEmail(email, `${origin}/verify?token=${token}`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Register failed" }, { status: 500 });
  }
}
