import Link from "next/link";

type ListingCardProps = {
  listing: {
    id?: string;
    title: string;
    subtitle: string;
    price: string;
    currency: string;
    neighborhood: string;
    image: string;
    featured?: boolean;
    phone?: string | null;
  };
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

export function ListingCard({ listing }: ListingCardProps) {
  const { id, title, subtitle, price, currency, neighborhood, image, featured, phone } = listing;
  const formatted = Number(price).toLocaleString("en-JO");
  const call = telHref(phone);
  const wa = waHref(phone);
  const body = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" className="h-full w-full object-cover" />
        {featured ? (
          <span className="absolute left-2 top-2 rounded-full bg-[#c4a574] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#231F20]">Featured</span>
        ) : null}
        <span className="absolute bottom-2 left-2 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-medium text-[#231F20]">{neighborhood}</span>
      </div>
      <div className="space-y-1.5 p-3">
        <p className="text-lg font-bold leading-none text-[#231F20]">{formatted} {currency}</p>
        <h3 className="truncate text-sm font-medium text-[#231F20]">{title}</h3>
        <p className="truncate text-xs text-[#231F20]/55">{subtitle}</p>
      </div>
    </>
  );

  return (
    <article className="overflow-hidden rounded-[20px] border border-[#eae6df] bg-white shadow-[0_8px_24px_rgba(35,31,32,0.06)]">
      {id ? <Link href={`/listings/${id}`}>{body}</Link> : body}
      <div className="flex gap-1.5 px-3 pb-3">
        {call ? (
          <a href={call} className="flex-1 rounded-full bg-[#231F20] py-2 text-center text-[11px] font-semibold text-[#fbf9f6]">📞 Call</a>
        ) : (
          <span className="flex-1 rounded-full bg-[#231F20]/40 py-2 text-center text-[11px] font-semibold text-[#fbf9f6]">📞 Call</span>
        )}
        {wa ? (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-full bg-[#25d366] py-2 text-center text-[11px] font-semibold text-white">💬 WA</a>
        ) : (
          <span className="flex-1 rounded-full bg-[#25d366]/40 py-2 text-center text-[11px] font-semibold text-white">💬 WA</span>
        )}
      </div>
    </article>
  );
}
