import Link from "next/link";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  let message = "Missing verification token.";
  let ok = false;
  if (token) {
    const user = await prisma.user.findFirst({ where: { emailVerifyToken: token } });
    if (!user) message = "This link is invalid.";
    else if (user.emailVerifyTokenExpiresAt && user.emailVerifyTokenExpiresAt < new Date()) message = "This link expired. Create the account again.";
    else {
      await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true, emailVerifyToken: null, emailVerifyTokenExpiresAt: null } });
      ok = true;
      message = "Email verified. You can sign in now.";
    }
  }
  return (
    <main className="mx-auto min-h-screen w-full max-w-[430px] bg-[#fbf9f6] px-5 py-8 text-[#231F20]">
      <p className="text-[34px] leading-none" style={{ fontFamily: "var(--font-newsreader), serif" }}>Catch</p>
      <p className="mt-1 text-[10px] tracking-[0.28em] opacity-70">THE DEAL</p>
      <h1 className="mt-8 text-2xl font-semibold">{ok ? "You're in" : "Verify email"}</h1>
      <p className="mt-3 text-sm">{message}</p>
      <Link href="/login" className="mt-6 inline-block rounded-full bg-[#231F20] px-5 py-3 text-sm font-semibold text-[#fbf9f6]">Sign in</Link>
    </main>
  );
}
