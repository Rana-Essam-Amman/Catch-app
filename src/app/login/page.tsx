"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setNotice("");
    setPending(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    const data = await res.json();
    setPending(false);
    if (!res.ok) {
      setError(data.error || "Could not sign in");
      return;
    }
    router.push("/");
  }

  function comingSoon(label: string) {
    setError("");
    setNotice(`${label}: Coming soon`);
  }

  return (
    <>
      <style>{`
        .login-shell {
          min-height: 100vh;
          background: #121212;
          display: flex;
          justify-content: center;
          color: #231F20;
          font-family: var(--font-inter), var(--font-tajawal), sans-serif;
        }
        .login-app {
          width: 100%;
          max-width: 430px;
          background: #fbf9f6;
          min-height: 100vh;
          position: relative;
          padding-bottom: 40px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
          display: flex;
          flex-direction: column;
        }
        .login-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: #fbf9f6;
          border-bottom: 1px solid #eae6df;
        }
        .login-back {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: white;
          border: 1px solid #eae6df;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          text-decoration: none;
          color: #231F20;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        .login-title {
          font-family: var(--font-newsreader), serif;
          font-size: 18px;
          font-weight: 700;
          color: #231F20;
          text-align: center;
        }
        .login-content {
          padding: 30px 20px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          flex: 1;
        }
        .login-welcome {
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .login-logo {
          font-family: var(--font-newsreader), serif;
          font-size: 32px;
          font-weight: 800;
          color: #231F20;
          letter-spacing: -0.5px;
        }
        .login-sub {
          font-size: 13px;
          color: #666;
          font-weight: 600;
          line-height: 1.4;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .login-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .login-label {
          font-size: 12px;
          font-weight: 800;
          color: #444;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .login-input {
          width: 100%;
          height: 52px;
          background: white;
          border: 1px solid #eae6df;
          border-radius: 16px;
          padding: 0 16px;
          font-family: var(--font-inter), var(--font-tajawal), sans-serif;
          font-size: 14px;
          color: #231F20;
          outline: none;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        .login-input:focus { border-color: #231F20; }
        .login-forgot {
          font-size: 12px;
          font-weight: 700;
          color: #555;
          text-align: right;
          background: none;
          border: none;
          cursor: pointer;
          margin-top: -4px;
          align-self: flex-end;
        }
        .login-submit {
          width: 100%;
          height: 52px;
          background: #231F20;
          color: white;
          border: none;
          border-radius: 26px;
          font-family: var(--font-inter), var(--font-tajawal), sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 6px 16px rgba(0,0,0,0.2);
          margin-top: 8px;
        }
        .login-submit:active { transform: scale(0.98); }
        .login-submit:disabled { opacity: 0.7; }
        .login-divider {
          display: flex;
          align-items: center;
          text-align: center;
          color: #888;
          font-size: 11px;
          font-weight: 700;
          margin: 4px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .login-divider::before, .login-divider::after {
          content: "";
          flex: 1;
          border-bottom: 1px solid #eae6df;
        }
        .login-divider::before { margin-right: 10px; }
        .login-divider::after { margin-left: 10px; }
        .login-social { display: flex; gap: 12px; }
        .login-social-btn {
          flex: 1;
          height: 48px;
          background: white;
          border: 1px solid #eae6df;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          color: #231F20;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        .login-prompt {
          text-align: center;
          font-size: 13px;
          color: #666;
          font-weight: 600;
          margin-top: 10px;
        }
        .login-signup {
          color: #231F20;
          font-weight: 800;
          text-decoration: none;
          border-bottom: 1px solid #231F20;
          padding-bottom: 1px;
        }
      `}</style>
      <div className="login-shell">
        <div className="login-app">
          <header className="login-header">
            <Link href="/" className="login-back" aria-label="Back">
              ←
            </Link>
            <h1 className="login-title">Sign In / تسجيل الدخول</h1>
            <div style={{ width: 40 }} />
          </header>
          <div className="login-content">
            <div className="login-welcome">
              <div className="login-logo">CATCH.</div>
              <div className="login-sub">
                Welcome back! Sign in to manage your listings & messages.
                <br />
                مرحباً بك مجدداً! سجل الدخول لإدارة إعلاناتك.
              </div>
            </div>
            <form className="login-form" onSubmit={onSubmit}>
              <div className="login-field">
                <label className="login-label" htmlFor="email">
                  Email or Phone / البريد الإلكتروني أو الهاتف
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@example.com / رقم الهاتف"
                  className="login-input"
                />
              </div>
              <div className="login-field">
                <label className="login-label" htmlFor="password">
                  Password / كلمة المرور
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="login-input"
                />
              </div>
              <button type="button" className="login-forgot" onClick={() => comingSoon("Forgot password")}>Forgot password? / نسيت كلمة المرور؟</button>
              <button type="submit" disabled={pending} className="login-submit">
                {pending ? "Signing in…" : "Sign In / تسجيل الدخول"}
              </button>
            </form>
            {error ? <p style={{ color: "#d64545", fontSize: 13, fontWeight: 600 }}>{error}</p> : null}
            {notice ? <p style={{ color: "#231F20", fontSize: 13, fontWeight: 600 }}>{notice}</p> : null}
            <div className="login-divider">Or continue with / أو عبر</div>
            <div className="login-social">
              <button type="button" className="login-social-btn" onClick={() => comingSoon("Google")}>
                <span>🌐</span> Google
              </button>
              <button type="button" className="login-social-btn" onClick={() => comingSoon("OTP Phone")}>
                <span>📱</span> OTP Phone
              </button>
            </div>
            <div className="login-prompt">
              Don&apos;t have an account? / ليس لديك حساب؟{" "}
              <Link href="/register" className="login-signup">Sign Up / أنشئ حساباً</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
