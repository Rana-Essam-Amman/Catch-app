export function SearchBar({
  action = "/listings",
  placeholder = "Search luxury watches, phones, decor...",
}: {
  action?: string;
  placeholder?: string;
}) {
  return (
    <form action={action} method="get" className="w-full">
      <label className="relative block">
        <span className="pointer-events-none absolute inset-y-0 start-4 flex items-center text-[var(--color-muted-secondary)]">
          ⌕
        </span>
        <input
          name="q"
          type="search"
          placeholder={placeholder}
          className="h-12 w-full rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] ps-11 pe-4 text-sm text-[var(--color-primary)] shadow-[0_1px_3px_rgba(0,0,0,0.04)] outline-none placeholder:text-[var(--color-muted-secondary)]"
        />
      </label>
    </form>
  );
}
