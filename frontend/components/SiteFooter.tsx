"use client";

import { useLocale } from "@/components/LocaleProvider";

const MAIL = "mailto:remesatia@gmail.com";
const LINKEDIN = "https://www.linkedin.com/company/remesa-tia";
const X_URL = "https://x.com/remesatia";

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M3.5 5.75A1.75 1.75 0 0 1 5.25 4h13.5c.97 0 1.75.78 1.75 1.75v12.5A1.75 1.75 0 0 1 18.75 20H5.25A1.75 1.75 0 0 1 3.5 18.25V5.75Zm1.75-.25a.25.25 0 0 0-.25.25v.38l6.62 4.41c.55.37 1.26.37 1.81 0l6.62-4.41V5.75a.25.25 0 0 0-.25-.25H5.25Zm13.5 2.2-5.97 3.98a3.25 3.25 0 0 1-3.56 0L3.25 7.7v10.55c0 .14.11.25.25.25h13.5a.25.25 0 0 0 .25-.25V7.7Z"
      />
    </svg>
  );
}

function IconLinkedIn() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.27V1.73C24 .77 23.2 0 22.22 0h.01Z"
      />
    </svg>
  );
}

function IconX() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M18.24 2.25h3.31l-7.22 8.26 8.5 11.24h-6.65l-4.72-6.23-5.4 6.23H2.75l7.73-8.84L1.25 2.25H8.08l4.25 5.62 5.91-5.62Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z"
      />
    </svg>
  );
}

type Props = {
  className?: string;
  tagline?: string;
};

export function SiteFooter({ className = "site-footer", tagline }: Props) {
  const { t } = useLocale();

  return (
    <footer className={className}>
      <p className="site-footer-copy">{tagline ?? t.footerTagline}</p>
      <nav className="site-footer-social" aria-label={t.footerContactAria}>
        <a className="site-footer-icon" href={MAIL} aria-label={t.footerMailAria}>
          <IconMail />
        </a>
        <a
          className="site-footer-icon"
          href={LINKEDIN}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.footerLinkedinAria}
        >
          <IconLinkedIn />
        </a>
        <a
          className="site-footer-icon"
          href={X_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.footerXAria}
        >
          <IconX />
        </a>
      </nav>
    </footer>
  );
}
