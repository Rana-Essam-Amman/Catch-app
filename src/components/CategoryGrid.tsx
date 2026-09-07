import Link from "next/link";

import { CATEGORIES } from "@/lib/categories";

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {CATEGORIES.map((category) => (
        <Link
          key={category.slug}
          href={`/listings?category=${category.slug}`}
          className="flex min-h-[92px] flex-col items-center justify-center rounded-[14px] border border-[var(--color-border)] bg-[var(--color-surface)] px-1 py-2 text-center shadow-[0_2px_8px_rgba(35,31,32,0.04)]"
        >
          <span className="text-lg leading-none" aria-hidden>
            {category.icon}
          </span>
          <span className="mt-1 text-[10px] font-semibold leading-tight text-[var(--color-primary)]">
            {category.en}
          </span>
          <span className="font-arabic mt-0.5 text-[9px] leading-tight text-[var(--color-muted)]">
            {category.ar}
          </span>
        </Link>
      ))}
    </div>
  );
}
