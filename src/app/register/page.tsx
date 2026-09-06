"use client";
import Link from "next/link";
import { useState } from "react";
export default function RegisterPage() {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setStatus(""); setPending(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: form.get("phone"), email: form.get("email"), password: form.get("password"), handle: form.get("handle") }) });
    const data = await res.json();
    setPending(false);
    if (!res.ok) { setError(data.error || "Could not create account"); return; }
    setStatus("Account created. Check your email and tap the verification link.");
  }
  return (
    <main className="mx-auto min-h-screen w-full max-w-[430px] bg-[#fbf9f6] px-5 py-8 text-[#231F20]">
      <p className="text-[34px] leading-none" style={{ fontFamily: "var(--font-newsreader), serif" }}>Catch</p>
      <p className="mt-1 text-[10px] tracking-[0.28em] opacity-70">THE DEAL</p>
      <h1 className="mt-8 text-2xl font-semibold">Create account</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input name="handle" required placeholder="Handle" className="w-full rounded-full border border-[#eae6df] bg-white px-4 py-3 text-sm outline-none" />
        <input name="phone" required placeholder="079xxxxxxx" className="w-full rounded-full border border-[#eae6df] bg-white px-4 py-3 text-sm outline-none" />
        <input name="email" type="email" required placeholder="Email" className="w-full rounded-full border border-[#eae6df] bg-white px-4 py-3 text-sm outline-none" />
        <input name="password" type="password" required minLength={6} placeholder="Password" className="w-full rounded-full border border-[#eae6df] bg-white px-4 py-3 text-sm outline-none" />
        <button disabled={pending} className="w-full rounded-full bg-[#231F20] py-3 text-sm font-semibold text-[#fbf9f6]">{pending ? "Creating…" : "Create account"}</button>
      </form>
      {error ? <p className="mt-4 text-sm text-[#d64545]">{error}</p> : null}
      {status ? <p className="mt-4 text-sm">{status}</p> : null}
      <p className="mt-6 text-sm opacity-70">Already have an account? <Link href="/login" className="font-semibold">Sign in</Link></p>
    </main>
  );
}
