export function Disclaimers({ disclaimers }: { disclaimers: string[] }) {
  if (disclaimers.length === 0) return null;

  return (
    <section
      aria-labelledby="disclaimers-heading"
      className="border-t border-ink-200 pt-8"
    >
      <h2
        id="disclaimers-heading"
        className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500"
      >
        Scope &amp; limitations
      </h2>
      <ul className="mt-4 space-y-3">
        {disclaimers.map((text, i) => (
          <li key={i} className="flex gap-3 text-xs leading-relaxed text-ink-500">
            <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-300" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
