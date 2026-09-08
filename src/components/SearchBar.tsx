export function SearchBar({
  action = "/",
  placeholder = "Ask Catch what you're looking for\u2026",
  defaultValue = "",
}: {
  action?: string;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <form action={action} method="get" className="w-full">
      <label className="relative block">
        <span className="pointer-events-none absolute inset-y-0 start-4 flex items-center text-[var(--color-muted)]">
          {⌕}
        </span>
        <input
          name="q"
          type="search"
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="h-12 w-full rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] ps-11 pe-4 text-sm text-[var(--color-espresso)] shadow-[var(--shadow-soft)] outline-none placeholder:text-[var(--color-muted)]"
        />
      </label>
    </form>
  );
}
