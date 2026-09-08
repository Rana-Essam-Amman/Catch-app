"use client";

import Link from "next/link";
import { useState } from "react";

const COUNTRY_OPTIONS = [
  { code: "JO", name: "Jordan" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "EG", name: "Egypt" },
  { code: "IQ", name: "Iraq" },
  { code: "PS", name: "Palestine" },
  { code: "LB", name: "Lebanon" },
  { code: "SY", name: "Syria" },
  { code: "KW", name: "Kuwait" },
  { code: "QA", name: "Qatar" },
  { code: "BH", name: "Bahrain" },
  { code: "OM", name: "Oman" },
  { code: "YE", name: "Yemen" },
  { code: "LY", name: "Libya" },
  { code: "TN", name: "Tunisia" },
  { code: "DZ", name: "Algeria" },
  { code: "MA", name: "Morocco" },
  { code: "SD", name: "Sudan" },
];

export default function RegisterPage() {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [email, setEmail] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setStatus("");
    setPending(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      phone: form.get("phone"),
      email: form.get("email"),
      password: form.get("password"),
      handle: form.get("handle"),
      countryCode: form.get("countryCode"),
    };
    setEmail(String(payload.email || ""));
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setPending(false);
    if (res.status === 202 || data.needsVerification) {
      setStatus(data.error || "Account created. Verification email could not be sent.");
      return;
    }
    if (!res.ok) {
      setError(data.error || "Could not create account");
      return;
    }
    setStatus("Account created. Check your email and tap the verification link.");
  }

  async function resend() {
    if (!email) return;
    setPending(true);
    const res = await fetch("/api/auth/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setPending(false);
    if (!res.ok) {
      setError(data.error || "Could not resend email");
      return;
    }
    setError("");
    setStatus("If that account needs verification, a new email was sent.");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[430px] bg-[#ffffff] px-5 py-8 text-[#3A2418]">
      <p className="text-[34px] leading-none" style={{ fontFamily: "var(--font-newsreader), serif" }}>Catch</p>
      <p className="mt-1 text-[12px] italic text-[#8B654D]">The Deal</p>
      <h1 className="mt-8 text-2xl font-semibold">Create account</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input name="handle" required placeholder="Handle" className="w-full rounded-full border border-[#EADFD7] bg-white px-4 py-3 text-sm outline-none" />
        <select name="countryCode" required defaultValue="JO" className="w-full rounded-full border border-[#EADFD7] bg-white px-4 py-3 text-sm outline-none">
          {COUNTRY_OPTIONS.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name}
            </option>
          ))}
        </select>
        <input name="phone" required placeholder="079xxxxxxx" className="w-full rounded-full border border-[#EADFD7] bg-white px-4 py-3 text-sm outline-none" />
        <input name="email" type="email" required placeholder="Email" className="w-full rounded-full border border-[#EADFD7] bg-white px-4 py-3 text-sm outline-none" />
        <input name="password" type="password" required minLength={6} placeholder="Password" className="w-full rounded-full border border-[#EADFD7] bg-white px-4 py-3 text-sm outline-none" />
        <button disabled={pending} className="w-full rounded-full bg-[#3A2418] py-3 text-sm font-semibold text-white">
          {pending ? "Creating…" : "Create account"}
        </button>
      </form>
      {error ? <p className="mt-4 text-sm text-[#d64545]">{error}</p> : null}
      {status ? <p className="mt-4 text-sm">{status}</p> : null}
      {email ? (
        <button type="button" onClick={resend} className="mt-3 text-sm font-semibold">
          Resend verification email
        </button>
      ) : null}
      <p className="mt-6 text-sm opacity-70">Already have an account? <Link href="/login" className="font-semibold">Sign in</Link></p>
    </main>
  );
}
