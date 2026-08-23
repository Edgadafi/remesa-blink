"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";

type ActionMeta = {
  title?: string;
  icon?: string;
  description?: string;
  label?: string;
};

type Props = {
  actionUrl: string;
  localUrl: string;
  inspectorUrl: string;
  variant?: "hero" | "compact";
};

export function BlinkPreview({
  actionUrl,
  localUrl,
  inspectorUrl,
  variant = "hero",
}: Props) {
  const { t } = useLocale();
  const [meta, setMeta] = useState<ActionMeta | null>(null);
  const [iconOk, setIconOk] = useState(true);
  const [phantomUrl, setPhantomUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(actionUrl, { headers: { Accept: "application/json" } });
        if (!res.ok) return;
        const json = (await res.json()) as ActionMeta;
        if (!cancelled) setMeta(json);
      } catch {
        /* preview still shows static copy */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [actionUrl]);

  useEffect(() => {
    setPhantomUrl(
      `https://phantom.app/ul/browse/${encodeURIComponent(
        `${window.location.origin}${localUrl}`
      )}?ref=${encodeURIComponent(window.location.origin)}`
    );
  }, [localUrl]);

  const title = meta?.title || t.blinkPreviewTitle;
  const description = meta?.description || t.blinkPreviewBody;

  return (
    <aside
      className={`blink-preview blink-preview--${variant}`}
      aria-label={t.blinkPreviewKicker}
    >
      <p className="blink-preview-kicker">{t.blinkPreviewKicker}</p>
      <div className="blink-preview-row">
        {meta?.icon && iconOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="blink-preview-icon"
            src={meta.icon}
            alt=""
            width={48}
            height={48}
            onError={() => setIconOk(false)}
          />
        ) : (
          <span className="blink-preview-icon blink-preview-icon--fallback" aria-hidden />
        )}
        <div>
          <h2 className="blink-preview-title">{title}</h2>
          <p className="blink-preview-body">{description}</p>
        </div>
      </div>
      <div className="blink-preview-actions">
        <a className="blink-preview-cta" href={localUrl}>
          {t.blinkPreviewOpen}
        </a>
        <a
          className="blink-preview-link"
          href={inspectorUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t.blinkPreviewInspector}
        </a>
        {phantomUrl ? (
          <a
            className="blink-preview-link"
            href={phantomUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.blinkPreviewPhantom}
          </a>
        ) : null}
      </div>
    </aside>
  );
}
