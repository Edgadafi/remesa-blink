"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { getWaBotStartUrl } from "@/lib/config";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`site-nav-menu-chevron${open ? " is-open" : ""}`}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M2.25 4.25 L6 8 L9.75 4.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function NavEnviarMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const inmediatoHref = getWaBotStartUrl("enviar") ?? "/empezar";
  const inmediatoExternal = inmediatoHref.startsWith("http");
  const programarHref = "/nueva-remesa";
  const programarCurrent = pathname === programarHref;
  const inmediatoCurrent = !inmediatoExternal && pathname === inmediatoHref;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        rootRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="site-nav-menu" ref={rootRef}>
      <button
        type="button"
        className={`site-nav-link site-nav-menu-trigger${
          programarCurrent || inmediatoCurrent ? " is-current" : ""
        }`}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        Enviar dinero
        <Chevron open={open} />
      </button>
      {open && (
        <ul id={menuId} className="site-nav-menu-panel" aria-label="Opciones para enviar dinero">
          <li>
            {inmediatoExternal ? (
              <a
                href={inmediatoHref}
                className="site-nav-menu-item"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
              >
                <span className="site-nav-menu-item-label">Enviar de inmediato</span>
                <span className="site-nav-menu-item-desc">Ahora, por WhatsApp con TIA</span>
              </a>
            ) : (
              <Link
                href={inmediatoHref}
                className="site-nav-menu-item"
                aria-current={inmediatoCurrent ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                <span className="site-nav-menu-item-label">Enviar de inmediato</span>
                <span className="site-nav-menu-item-desc">Ahora, con el código QR</span>
              </Link>
            )}
          </li>
          <li>
            <Link
              href={programarHref}
              className="site-nav-menu-item"
              aria-current={programarCurrent ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              <span className="site-nav-menu-item-label">Programar el envío de dinero</span>
              <span className="site-nav-menu-item-desc">Cada mes, semana o día</span>
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}
