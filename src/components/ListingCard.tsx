type ListingCardProps = {
  title: string;
  subtitle: string;
  price: string;
  currency: string;
  neighborhood: string;
  image: string;
  featured?: boolean;
};

export function ListingCard({ title, subtitle, price, currency, neighborhood, image, featured }: ListingCardProps) {
  const formatted = Number(price).toLocaleString("en-JO");
  return (
    <article className="overflow-hidden rounded-[20px] border border-[#eae6df] bg-white shadow-[0_8px_24px_rgba(35,31,32,0.06)]">
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" className="h-full w-full object-cover" />
        {featured ? (
          <span className="absolute left-2 top-2 rounded-full bg-[#c4a574] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#231F20]">Featured</span>
        ) : null}
        <button type="button" aria-label="Favorite" className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-sm">♡</button>
        <span className="absolute bottom-2 left-2 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-medium text-[#231F20]">{neighborhood}</span>
      </div>
      <div className="space-y-1.5 p-3">
        <p className="text-lg font-bold leading-none text-[#231F20]">{formatted} {currency}</p>
        <h3 className="truncate text-sm font-medium text-[#231F20]">{title}</h3>
        <p className="truncate text-xs text-[#231F20]/55">{subtitle}</p>
        <div className="flex gap-1.5 pt-1">
          <button type="button" className="flex-1 rounded-full bg-[#231F20] py-2 text-center text-[11px] font-semibold text-[#fbf9f6]">📞 Call</button>
          <button type="button" className="flex-1 rounded-full bg-[#25d366] py-2 text-center text-[11px] font-semibold text-white">💬 WA</button>
        </div>
      </div>
    </article>
  );
}
