export function SearchBar({
  action = "/",
  placeholder = "Ask Catch what you're looking for…",
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
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
