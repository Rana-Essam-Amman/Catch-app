const JO_PHONE = /^(?:\+962|00962|0)?7[789]\d{7}$/;

export function normalizeJordanPhone(input: string): string | null {
  const raw = input.replace(/[\s-]/g, "");
  if (!JO_PHONE.test(raw)) return null;
  const digits = raw.replace(/^\+/, "").replace(/^00/, "");
  const local = digits.startsWith("962") ? digits.slice(3) : digits;
  const national = local.startsWith("0") ? local.slice(1) : local;
  if (!/^7[789]\d{7}$/.test(national)) return null;
  return `+962${national}`;
}
