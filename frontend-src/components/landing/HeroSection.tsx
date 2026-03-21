import { MessageSquare, Zap, DollarSign, ArrowDown } from "lucide-react";
import logo from "@/assets/remesablink-logo-transparent.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4"
      />
      {/* Light overlay */}
      <div className="absolute inset-0 bg-background/85 z-[1]" />

      <div className="relative z-10 container mx-auto px-6 py-24 lg:py-32">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="liquid-glass rounded-full px-4 py-1.5 mb-8 text-xs text-foreground/60 tracking-wide">
            Solana Hackathon 2026 &nbsp;|&nbsp; AI + DeFi LATAM
          </div>

          {/* Logo */}
          <img src={logo} alt="RemesaBlink Logo" className="w-44 h-44 sm:w-56 sm:h-56 lg:w-64 lg:h-64 object-contain mb-6 rounded-2xl" />

          {/* Logo/Name */}
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-[-0.04em] leading-[0.95] mb-4">
            <span className="text-gradient-brand">REMESA</span>
            <span className="text-accent">BLINK</span>
          </h1>

          {/* Subtitle */}
          <p className="text-foreground/50 text-sm sm:text-base tracking-widest uppercase mb-3 font-medium">
            AI Agent + Stablecoins + WhatsApp
          </p>

          {/* Tagline */}
          <p className="text-foreground/70 text-lg sm:text-xl lg:text-2xl mb-12 max-w-2xl font-light leading-relaxed">
            Remesas de USA a México, <em className="font-serif text-foreground/90 italic">sin fricción.</em>
          </p>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-12">
            {[
              { value: "$64.7B", label: "Remesas MX 2024", icon: DollarSign },
              { value: "5-7%", label: "Comisión tradicional", icon: Zap },
              { value: "<0.5%", label: "Comisión RemesaBlink", icon: MessageSquare },
            ].map((stat) => (
              <div key={stat.label} className="liquid-glass rounded-2xl p-5 text-center hover:scale-[1.03] transition-transform duration-300">
                <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">{stat.value}</p>
                <p className="text-xs text-foreground/50 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button className="liquid-glass-strong rounded-full px-8 py-4 text-base font-medium text-primary-foreground bg-primary hover:scale-105 active:scale-95 transition-transform animate-pulse-glow">
              Enviar Remesa
            </button>
            <button className="liquid-glass rounded-full px-8 py-4 text-base font-medium text-foreground/70 hover:text-foreground hover:scale-105 active:scale-95 transition-transform">
              Ver cómo funciona
            </button>
          </div>

          {/* Scroll indicator */}
          <ArrowDown className="w-5 h-5 text-foreground/30 animate-float mt-8" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
