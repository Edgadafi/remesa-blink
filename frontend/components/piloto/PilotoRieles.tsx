/** Rieles orgánicos — send dollars, recibe pesos más cerca de tu familia (marca v1.1) */
export function PilotoRieles({ className = "" }: { className?: string }) {
  return (
    <div className={`piloto-rieles ${className}`.trim()} aria-hidden="true">
      <span className="piloto-rieles-track" />
      <svg className="piloto-rieles-eagle" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M16 2c-3 2-5 5-5 8 0 1 .5 2 1 2.5l4-2.5 4 2.5c.5-.5 1-1.5 1-2.5 0-3-2-6-5-8z"
          fill="var(--color-dorado-tia)"
        />
        <path d="M10 12c2 3 4 5 6 6 2-1 4-3 6-6-2 1-4 2-6 2s-4-1-6-2z" fill="var(--color-verde-nopal)" />
      </svg>
      <span className="piloto-rieles-track" />
    </div>
  );
}
