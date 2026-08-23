"use client";

import { useEffect, useState } from "react";
import type { LandingWaCopy } from "@/components/landing/copy";

type Props = {
  copy: LandingWaCopy;
};

export function WhatsAppMock({ copy }: Props) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setStep(4);
      return;
    }

    let cancelled = false;
    const run = () => {
      if (cancelled) return [];
      setStep(0);
      const t1 = window.setTimeout(() => !cancelled && setStep(1), 700);
      const t2 = window.setTimeout(() => !cancelled && setStep(2), 2000);
      const t3 = window.setTimeout(() => !cancelled && setStep(3), 3400);
      const t4 = window.setTimeout(() => !cancelled && setStep(4), 4800);
      return [t1, t2, t3, t4];
    };

    let timers = run();
    const loop = window.setInterval(() => {
      timers.forEach(clearTimeout);
      timers = run();
    }, 9000);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      clearInterval(loop);
    };
  }, [copy.waGreeting]);

  return (
    <div className="landing-wa" aria-hidden="true">
      <div className="landing-wa-header">
        <span className="landing-wa-avatar">TIA</span>
        <div>
          <strong>holatia</strong>
          <span>{copy.waOnline}</span>
        </div>
      </div>
      <div className="landing-wa-thread">
        {step >= 1 ? (
          <div className="landing-wa-bubble landing-wa-bubble--in">{copy.waGreeting}</div>
        ) : null}
        {step >= 2 ? (
          <div className="landing-wa-bubble landing-wa-bubble--out">{copy.waUserSend}</div>
        ) : null}
        {step >= 3 ? (
          <div className="landing-wa-bubble landing-wa-bubble--in">{copy.waBotReply}</div>
        ) : null}
        {step >= 4 ? (
          <div className="landing-wa-bubble landing-wa-bubble--out landing-wa-bubble--accent">
            {copy.waConfirm}
          </div>
        ) : null}
      </div>
      <div className="landing-wa-input">
        <span>{copy.waInputPlaceholder}</span>
      </div>
    </div>
  );
}
