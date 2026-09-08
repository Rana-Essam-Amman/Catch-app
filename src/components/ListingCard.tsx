import Link from "next/link";

import { FavoriteButton } from "@/components/FavoriteButton";

type ListingCardProps = {
  listing: {
    id?: string;
    title: string;
    subtitle: string;
    price: string;
    currency: string;
    neighborhood: string;
    image?: string | null;
    featured?: boolean;
    phone?: string | null;
    saved?: boolean;
  };
  signedIn?: boolean;
};

function telHref(phone?: string | null) {
  if (!phone) return null;
  const compact = phone.replace(/\s+/g, "");
  if (!/^\+?[0-9]{8,15}$/.test(compact)) return null;
  return `tel:${compact}`;
}

function waHref(phone?: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return null;
  return `https://wa.me/${digits}`;
}

export function ListingCard({ listing, signedIn = false }: ListingCardProps) {
  const { id, title, subtitle, price, currency, neighborhood, image, featured, phone, saved } = listing;
  const formatted = Number(price).toLocaleString("en-JO");
  const call = telHref(phone);
  const wa = waHref(phone);
  const body = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-light-cappuccino)]">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-[var(--color-dark-cappuccino)]">
            No photo
          </div>
        )}
        {featured ? (
          <span className="absolute left-2 top-2 rounded-full bg-[var(--color-cappuccino)] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[var(--color-deep-espresso)]">
            Featured
          </span>
        ) : null}
        <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-[var(--color-espresso)]">
          {neighborhood}
        </span>
        {id ? <FavoriteButton listingId={id} saved={Boolean(saved)} signedIn={signedIn} /> : null}
      </div>
      <div className="space-y-1.5 p-3">
        <p className="font-display text-lg font-bold leading-none text-[var(--color-espresso)]">
          {formatted} {currency}
        </p>
        <h3 className="truncate text-sm font-medium text-[var(--color-espresso)]">{title}</h3>
        <p className="truncate text-xs text-[var(--color-muted)]">{subtitle}</p>
      </div>
    </>
  );

  return (
    <article className="overflow-hidden rounded-[20px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-soft)]">
      {id ? <Link href={`/listings/${id}`}>{body}</Link> : body}
      <div className="flex gap-1.5 px-3 pb-3">
        {call ? (
          <a href={call} className="flex-1 rounded-full bg-[var(--color-deep-espresso)] py-2 text-center text-[11px] font-semibold text-white">
            Call
          </a>
        ) : (
          <span className="flex-1 rounded-full bg-[var(--color-cappuccino)] py-2 text-center text-[11px] font-semibold text-white">
            Call
          </span>
        )}
        {wa ? (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-full border border-[var(--color-border)] bg-[var(--color-light-cappuccino)] py-2 text-center text-[11px] font-semibold text-[var(--color-espresso)]">
            WhatsApp
          </a>
        ) : (
          <span className="flex-1 rounded-full border border-[var(--color-border)] py-2 text-center text-[11px] font-semibold text-[var(--color-muted)]">
            WhatsApp
          </span>
        )}
      </div>
    </article>
  );
}
