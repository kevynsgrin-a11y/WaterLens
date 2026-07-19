import { Container, Section, Button } from "@/components/ui";

export default function NotFound() {
  return (
    <Section className="bg-hero bg-grid">
      <Container>
        <div className="mx-auto max-w-xl text-center animate-fade-up">
          <span
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-ink-100 bg-white shadow-card"
            aria-hidden="true"
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="14" cy="14" r="9.5" stroke="#2b76a6" strokeWidth="1.8" />
              <path
                d="M14 9c2.1 2.4 3.3 4.3 3.3 6a3.3 3.3 0 1 1-6.6 0c0-1.7 1.2-3.6 3.3-6Z"
                fill="#348465"
              />
              <path
                d="m21 21 4.5 4.5"
                stroke="#2b76a6"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </span>

          <p className="mt-8 font-mono text-sm font-semibold uppercase tracking-[0.14em] text-brand-600">
            404 — Page not found
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
            We couldn&rsquo;t resolve that page
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ink-600">
            The link may be outdated or the page may have moved. Your water data
            is still a single lookup away — start from your address, or head back
            to the homepage.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/#lookup" variant="primary">
              Check your address
            </Button>
            <Button href="/" variant="secondary">
              Back to homepage
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
