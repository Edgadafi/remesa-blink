"use client";

import { useEffect, useState } from "react";
import type { LandingQuotesCopy } from "@/components/landing/copy";

type Props = {
  copy: LandingQuotesCopy;
};

export function LandingQuotes({ copy }: Props) {
  const quotes = copy.quotes;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % quotes.length);
    }, 4500);
    return () => clearInterval(id);
  }, [quotes.length]);

  return (
    <div className="landing-quotes" role="region" aria-live="polite" aria-label={copy.familiesTitle}>
      <blockquote className="landing-quote-active">“{quotes[index]}”</blockquote>
      <div className="landing-quote-dots" aria-hidden="true">
        {quotes.map((_, i) => (
          <button
            key={i}
            type="button"
            className={i === index ? "is-active" : undefined}
            aria-label={`Quote ${i + 1}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
