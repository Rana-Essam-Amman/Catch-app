"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function FavoriteButton({
  listingId,
  saved,
  signedIn,
}: {
  listingId: string;
  saved: boolean;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [on, setOn] = useState(saved);
  const [note, setNote] = useState("");

  async function toggle() {
    if (!signedIn) {
      router.push("/login");
      return;
    }
    if (busy) return;
    setBusy(true);
    setNote("");
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNote(typeof data.error === "string" ? data.error : "Could not update saved ads.");
        return;
      }
      setOn(Boolean(data.saved));
      router.refresh();
    } catch {
      setNote("Could not update saved ads.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="absolute right-2 top-2 z-10">
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        aria-label={on ? "Remove from saved ads" : "Save ad"}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-sm shadow-[var(--shadow-soft)]"
      >
        {on ? "\u2665" : "\u2661"}
      </button>
      {note ? <p className="mt-1 max-w-[120px] text-[10px] text-[var(--color-muted)]">{note}</p> : null}
    </div>
  );
}
