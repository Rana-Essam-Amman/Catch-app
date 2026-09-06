import { Resend } from "resend";

export async function sendVerificationEmail(to: string, verifyUrl: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  const resend = new Resend(key);
  const { data, error } = await resend.emails.send({
    from: "Catch <onboarding@resend.dev>",
    to,
    subject: "Verify your Catch account",
    html: `<div style="font-family:sans-serif;background:#fbf9f6;padding:24px;color:#231F20"><h1>Catch</h1><p>Confirm your email to finish creating your account.</p><p><a href="${verifyUrl}" style="display:inline-block;background:#231F20;color:#fbf9f6;padding:12px 20px;border-radius:999px;text-decoration:none">Verify email</a></p></div>`,
  });
  if (error) throw new Error(error.message);
  return data;
}
