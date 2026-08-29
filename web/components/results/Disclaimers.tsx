export function Disclaimers({ disclaimers }: { disclaimers: string[] }) {
  if (disclaimers.length === 0) return null;

  return (
    <section
      aria-labelledby="disclaimers-heading"
      className="border-t border-hairline pt-8"
    >
      <h2
        id="disclaimers-heading"
        className="text-eyebrow uppercase text-ink-600 dark:text-ink-300"
      >
        Scope &amp; limitations
      </h2>
      {/* These are the scope limits on every number above them — set at text-sm
          on ink-600 so they are actually read, not skimmed past. */}
      <ul className="mt-4 space-y-3">
        {disclaimers.map((text, i) => (
          <li
            key={i}
            className="flex gap-3 text-sm leading-relaxed text-ink-600 dark:text-ink-300"
          >
            <span
              aria-hidden="true"
              className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-400 dark:bg-white/30"
            />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
