import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import logo from "@/assets/remesablink-logo-transparent.png";

const FooterSection = () => {
  const ref = useScrollReveal();

  return (
    <footer className="py-24 lg:py-32 relative" ref={ref}>
      <div className="container mx-auto px-6">
        <div className="text-center">
          {/* Logo */}
          <div className="reveal mb-6">
            <img src={logo} alt="RemesaBlink Logo" className="w-32 h-32 sm:w-40 sm:h-40 object-contain mx-auto mb-4 rounded-2xl" />
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              <span className="text-gradient-brand">REMESA</span>
              <span className="text-accent">BLINK</span>
            </h2>
          </div>

          <p className="reveal text-muted-foreground text-sm sm:text-base max-w-lg mx-auto mb-12" style={{ transitionDelay: "80ms" }}>
            Remesas sin fronteras, sin fricción, sin comisiones abusivas.
          </p>

          {/* Stats row */}
          <div className="reveal grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto mb-12" style={{ transitionDelay: "160ms" }}>
            {[
              { value: "10x", label: "Más barato" },
              { value: "<60s", label: "Liquidación" },
              { value: "0", label: "Apps nuevas" },
              { value: "100%", label: "On-chain" },
            ].map((s) => (
              <div key={s.label} className="liquid-glass rounded-2xl p-4 text-center">
                <p className="text-xl font-bold text-foreground tabular-nums">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <p className="reveal text-xs text-muted-foreground/60 tracking-wider mb-8" style={{ transitionDelay: "240ms" }}>
            Construido con Solana &nbsp;|&nbsp; Claude AI &nbsp;|&nbsp; WhatsApp
          </p>

          <div className="reveal" style={{ transitionDelay: "300ms" }}>
            <button className="liquid-glass-strong rounded-full px-10 py-4 text-base font-medium text-primary-foreground bg-primary hover:scale-105 active:scale-95 transition-transform animate-pulse-glow">
              Enviar Remesa
            </button>
          </div>

          <p className="text-xs text-muted-foreground/40 mt-16">
            © 2025 RemesaBlink. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
