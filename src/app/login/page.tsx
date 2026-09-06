"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setPending(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) });
    const data = await res.json();
    setPending(false);
    if (!res.ok) { setError(data.error || "Could not sign in"); return; }
    router.push("/");
  }
  return (
    <main className="mx-auto min-h-screen w-full max-w-[430px] bg-[#fbf9f6] px-5 py-8 text-[#231F20]">
      <p className="text-[34px] leading-none" style={{ fontFamily: "var(--font-newsreader), serif" }}>Catch</p>
      <p className="mt-1 text-[10px] tracking-[0.28em] opacity-70">THE DEAL</p>
      <h1 className="mt-8 text-2xl font-semibold">Sign in</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input name="email" type="email" required placeholder="Email" className="w-full rounded-full border border-[#eae6df] bg-white px-4 py-3 text-sm outline-none" />
        <input name="password" type="password" required placeholder="Password" className="w-full rounded-full border border-[#eae6df] bg-white px-4 py-3 text-sm outline-none" />
        <button disabled={pending} className="w-full rounded-full bg-[#231F20] py-3 text-sm font-semibold text-[#fbf9f6]">{pending ? "Signing in…" : "Sign in"}</button>
      </form>
      {error ? <p className="mt-4 text-sm text-[#d64545]">{error}</p> : null}
      <p className="mt-6 text-sm opacity-70">New here? <Link href="/register" className="font-semibold">Create account</Link></p>
    </main>
  );
}
