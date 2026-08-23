/** Shared landing section copy (home + piloto). */
export type LandingWaCopy = {
  waOnline: string;
  waGreeting: string;
  waUserSend: string;
  waBotReply: string;
  waConfirm: string;
  waInputPlaceholder: string;
};

export type LandingQuotesCopy = {
  familiesTitle: string;
  quotes: readonly string[];
};

export type LandingSectionsCopy = LandingWaCopy &
  LandingQuotesCopy & {
    prideBadge: string;
    kicker: string;
    h1: string;
    story: string;
    ctaPrimary: string;
    ctaHow: string;
    ctaDemo: string;
    reassure: string;
    statPilotoValue: string;
    statPilotoLabel: string;
    statFeeValue: string;
    statFeeLabel: string;
    statProofValue: string;
    statProofLabel: string;
    familiesBody: string;
    stepsSectionTitle: string;
    stepsSectionSub: string;
    stepsAria: string;
    step1Title: string;
    step1Body: string;
    step2Title: string;
    step2Body: string;
    step3Title: string;
    step3Body: string;
    trustTitle: string;
    trustBody: string;
    trust1Title: string;
    trust1Body: string;
    trust2Title: string;
    trust2Body: string;
    testimonialQuote: string;
    testimonialName: string;
    testimonialPlace: string;
    testimonialNote: string;
    pricingTitle: string;
    pricingSub: string;
    pricingPlan: string;
    pricingRate: string;
    pricingCompare: string;
    pricingBullets: readonly string[];
    pricingNote: string;
    formSectionTitle: string;
    formSectionSub: string;
    heroImageAlt: string;
    familyImageAlt: string;
  };

export function hubToLandingCopy(t: {
  homePrideBadge: string;
  homeKicker: string;
  homeH1: string;
  homeStory: string;
  homeCtaQr: string;
  homeCtaHow: string;
  homeCtaDemo: string;
  homeReassure: string;
  homeStatPilotoValue: string;
  homeStatPilotoLabel: string;
  homeStatFeeValue: string;
  homeStatFeeLabel: string;
  homeStatProofValue: string;
  homeStatProofLabel: string;
  homeFamiliesTitle: string;
  homeFamiliesBody: string;
  homeQuotes: readonly string[];
  homeStepsSectionTitle: string;
  homeStepsSectionSub: string;
  homeStepsAria: string;
  homeStep1Title: string;
  homeStep1Body: string;
  homeStep2Title: string;
  homeStep2Body: string;
  homeStep3Title: string;
  homeStep3Body: string;
  homeTrustTitle: string;
  homeTrustBody: string;
  homeTrust1Title: string;
  homeTrust1Body: string;
  homeTrust2Title: string;
  homeTrust2Body: string;
  homeTestimonialQuote: string;
  homeTestimonialName: string;
  homeTestimonialPlace: string;
  homeTestimonialNote: string;
  homePricingTitle: string;
  homePricingSub: string;
  homePricingPlan: string;
  homePricingRate: string;
  homePricingCompare: string;
  homePricingBullets: readonly string[];
  homePricingNote: string;
  homeHeroImageAlt: string;
  homeFamilyImageAlt: string;
  homeWaOnline: string;
  homeWaGreeting: string;
  homeWaUserSend: string;
  homeWaBotReply: string;
  homeWaConfirm: string;
  homeWaInputPlaceholder: string;
}): LandingSectionsCopy {
  return {
    prideBadge: t.homePrideBadge,
    kicker: t.homeKicker,
    h1: t.homeH1,
    story: t.homeStory,
    ctaPrimary: t.homeCtaQr,
    ctaHow: t.homeCtaHow,
    ctaDemo: t.homeCtaDemo,
    reassure: t.homeReassure,
    statPilotoValue: t.homeStatPilotoValue,
    statPilotoLabel: t.homeStatPilotoLabel,
    statFeeValue: t.homeStatFeeValue,
    statFeeLabel: t.homeStatFeeLabel,
    statProofValue: t.homeStatProofValue,
    statProofLabel: t.homeStatProofLabel,
    familiesTitle: t.homeFamiliesTitle,
    familiesBody: t.homeFamiliesBody,
    quotes: t.homeQuotes,
    stepsSectionTitle: t.homeStepsSectionTitle,
    stepsSectionSub: t.homeStepsSectionSub,
    stepsAria: t.homeStepsAria,
    step1Title: t.homeStep1Title,
    step1Body: t.homeStep1Body,
    step2Title: t.homeStep2Title,
    step2Body: t.homeStep2Body,
    step3Title: t.homeStep3Title,
    step3Body: t.homeStep3Body,
    trustTitle: t.homeTrustTitle,
    trustBody: t.homeTrustBody,
    trust1Title: t.homeTrust1Title,
    trust1Body: t.homeTrust1Body,
    trust2Title: t.homeTrust2Title,
    trust2Body: t.homeTrust2Body,
    testimonialQuote: t.homeTestimonialQuote,
    testimonialName: t.homeTestimonialName,
    testimonialPlace: t.homeTestimonialPlace,
    testimonialNote: t.homeTestimonialNote,
    pricingTitle: t.homePricingTitle,
    pricingSub: t.homePricingSub,
    pricingPlan: t.homePricingPlan,
    pricingRate: t.homePricingRate,
    pricingCompare: t.homePricingCompare,
    pricingBullets: t.homePricingBullets,
    pricingNote: t.homePricingNote,
    formSectionTitle: "",
    formSectionSub: "",
    heroImageAlt: t.homeHeroImageAlt,
    familyImageAlt: t.homeFamilyImageAlt,
    waOnline: t.homeWaOnline,
    waGreeting: t.homeWaGreeting,
    waUserSend: t.homeWaUserSend,
    waBotReply: t.homeWaBotReply,
    waConfirm: t.homeWaConfirm,
    waInputPlaceholder: t.homeWaInputPlaceholder,
  };
}
