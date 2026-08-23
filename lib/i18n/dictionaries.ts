export type Locale = "en" | "te";

/** A localized string. Telugu is optional; UI falls back to English. */
export type Localized = { en: string; te?: string };

/** Resolve a Localized value for the active locale (English fallback). */
export function tl(value: Localized, locale: Locale): string {
  return (locale === "te" && value.te) || value.en;
}

/**
 * UI microcopy dictionary. English is complete; Telugu covers the
 * high-visibility strings (nav, hero, section titles, CTAs, stat labels).
 */
export const dict: Record<string, Localized> = {
  // Brand
  "brand.name": { en: "Manakrishi", te: "మనకృషి" },
  "brand.tagline": { en: "The Future of Farming", te: "వ్యవసాయ భవిష్యత్తు" },

  // Nav
  "nav.home": { en: "Home", te: "హోమ్" },
  "nav.tech": { en: "Technology", te: "సాంకేతికత" },
  "nav.how": { en: "How It Works", te: "ఎలా పనిచేస్తుంది" },
  "nav.services": { en: "Services", te: "సేవలు" },
  "nav.machinery": { en: "Machinery", te: "యంత్రాలు" },
  "nav.impact": { en: "Impact", te: "ప్రభావం" },
  "nav.contact": { en: "Contact", te: "సంప్రదించండి" },
  "nav.book": { en: "Book a Drone", te: "డ్రోన్ బుక్ చేయండి" },

  // Hero
  "hero.badge": { en: "India's Drone Agriculture Platform", te: "భారత డ్రోన్ వ్యవసాయ వేదిక" },
  "hero.title.1": { en: "Revolutionizing Agriculture", te: "వ్యవసాయంలో విప్లవం" },
  "hero.title.2": { en: "with Intelligent Drone Technology", te: "తెలివైన డ్రోన్ సాంకేతికతతో" },
  "hero.sub": {
    en: "Precision Spraying. Healthier Crops. Smarter Farming.",
    te: "కచ్చితమైన స్ప్రేయింగ్. ఆరోగ్యకరమైన పంటలు. తెలివైన వ్యవసాయం.",
  },
  "hero.cta.book": { en: "Book a Drone", te: "డ్రోన్ బుక్ చేయండి" },
  "hero.cta.demo": { en: "Watch Demo", te: "డెమో చూడండి" },
  "hero.cta.tech": { en: "Explore Technology", te: "సాంకేతికతను చూడండి" },
  "hero.scroll": { en: "Scroll to explore", te: "చూడటానికి స్క్రోల్ చేయండి" },

  // Common CTAs
  "cta.book": { en: "Book Drone Spraying", te: "డ్రోన్ స్ప్రేయింగ్ బుక్ చేయండి" },
  "cta.whatsapp": { en: "Chat on WhatsApp", te: "వాట్సాప్‌లో మాట్లాడండి" },
  "cta.explore": { en: "Explore", te: "చూడండి" },
  "cta.learnMore": { en: "Learn more", te: "మరింత తెలుసుకోండి" },

  // Section eyebrows / titles
  "stats.title": { en: "Real Impact for Real Farmers", te: "నిజమైన రైతులకు నిజమైన ప్రభావం" },
  "stats.note": {
    en: "Verified field results today — with a vision that scales across India.",
    te: "నేటి క్షేత్ర ఫలితాలు — భారతదేశమంతటా విస్తరించే దృష్టితో.",
  },

  "about.eyebrow": { en: "About Manakrishi", te: "మనకృషి గురించి" },
  "about.title": { en: "Farmer-first. Technology-led.", te: "రైతు మొదట. సాంకేతికత ముందు." },

  "why.eyebrow": { en: "Why Drone Spraying", te: "డ్రోన్ స్ప్రేయింగ్ ఎందుకు" },
  "why.title": { en: "The end of manual spraying", te: "చేతి స్ప్రేయింగ్‌కు ముగింపు" },

  "compare.eyebrow": { en: "Manual vs Drone", te: "చేతి vs డ్రోన్" },
  "compare.title": { en: "The difference is measurable", te: "తేడా స్పష్టంగా కనిపిస్తుంది" },
  "compare.manual": { en: "Manual", te: "చేతితో" },
  "compare.drone": { en: "Manakrishi Drone", te: "మనకృషి డ్రోన్" },

  "how.eyebrow": { en: "How It Works", te: "ఎలా పనిచేస్తుంది" },
  "how.title": { en: "From booking to bountiful harvest", te: "బుకింగ్ నుండి సమృద్ధ పంట వరకు" },

  "tech.eyebrow": { en: "Drone Technology", te: "డ్రోన్ సాంకేతికత" },
  "tech.title": { en: "Engineered for the Indian field", te: "భారత క్షేత్రం కోసం రూపొందించబడింది" },
  "tech.hint": { en: "Drag to rotate", te: "తిప్పడానికి లాగండి" },

  "precision.eyebrow": { en: "Precision Farming", te: "కచ్చిత వ్యవసాయం" },
  "precision.title": { en: "Intelligence in every drop", te: "ప్రతి చుక్కలో తెలివి" },

  "services.eyebrow": { en: "Services", te: "సేవలు" },
  "services.title": { en: "One platform, every acre", te: "ఒక వేదిక, ప్రతి ఎకరం" },

  "machinery.eyebrow": { en: "Tractors & Machinery", te: "ట్రాక్టర్లు & యంత్రాలు" },
  "machinery.title": { en: "Heavy Machinery & Field Preparation", te: "భారీ యంత్రాలు & భూమి తయారీ సేవలు" },

  "benefits.eyebrow": { en: "Benefits", te: "ప్రయోజనాలు" },
  "benefits.title": { en: "Better for farmers. Better for the land.", te: "రైతులకు మంచిది. భూమికి మంచిది." },

  "dashboard.eyebrow": { en: "Platform Preview", te: "ప్లాట్‌ఫారమ్ ప్రివ్యూ" },
  "dashboard.title": { en: "Every field, on one dashboard", te: "ప్రతి క్షేత్రం, ఒకే డాష్‌బోర్డ్‌లో" },
  "dashboard.disclaimer": {
    en: "Illustrative preview of the operations dashboard.",
    te: "ఆపరేషన్స్ డాష్‌బోర్డ్ ఉదాహరణ ప్రివ్యూ.",
  },

  "booking.eyebrow": { en: "Booking Experience", te: "బుకింగ్ అనుభవం" },
  "booking.title": { en: "Book a drone in minutes", te: "నిమిషాల్లో డ్రోన్ బుక్ చేయండి" },

  "map.eyebrow": { en: "Where We Operate", te: "మేము పనిచేసే ప్రాంతాలు" },
  "map.title": { en: "Rooted in Telangana. Growing across India.", te: "తెలంగాణలో మొదలు. భారతదేశమంతటా విస్తరణ." },
  "map.current": { en: "Operating now", te: "ప్రస్తుతం పనిచేస్తోంది" },
  "map.future": { en: "Expanding soon", te: "త్వరలో విస్తరణ" },

  "schemes.eyebrow": { en: "Support & Schemes", te: "మద్దతు & పథకాలు" },
  "schemes.title": { en: "Security & support for every farmer", te: "ప్రతి రైతుకు భద్రత & మద్దతు" },

  "testimonials.eyebrow": { en: "Trusted by Farmers", te: "రైతుల నమ్మకం" },
  "testimonials.title": { en: "Voices from the field", te: "క్షేత్రం నుండి మాటలు" },

  "roadmap.eyebrow": { en: "Future Roadmap", te: "భవిష్యత్ ప్రణాళిక" },
  "roadmap.title": { en: "The road to autonomous farming", te: "స్వయంచాలక వ్యవసాయం వైపు" },

  "faq.eyebrow": { en: "FAQ", te: "తరచుగా అడిగే ప్రశ్నలు" },
  "faq.title": { en: "Questions, answered", te: "ప్రశ్నలకు సమాధానాలు" },

  "contact.eyebrow": { en: "Contact", te: "సంప్రదించండి" },
  "contact.title": { en: "Let's transform your farm", te: "మీ వ్యవసాయాన్ని మారుద్దాం" },

  // Footer
  "footer.tagline": {
    en: "Connecting intelligent drones with farmers to build a sustainable, high-yield agricultural ecosystem.",
    te: "సుస్థిర, అధిక దిగుబడి వ్యవసాయ వ్యవస్థ కోసం తెలివైన డ్రోన్‌లను రైతులతో కలుపుతోంది.",
  },
  "footer.quick": { en: "Quick Links", te: "త్వరిత లింక్‌లు" },
  "footer.company": { en: "Company", te: "కంపెనీ" },
  "footer.contact": { en: "Contact", te: "సంప్రదింపు" },
  "footer.newsletter": { en: "Get farming insights", te: "వ్యవసాయ సమాచారం పొందండి" },
  "footer.subscribe": { en: "Subscribe", te: "సబ్‌స్క్రైబ్" },
  "footer.rights": { en: "All rights reserved.", te: "అన్ని హక్కులు రిజర్వ్ చేయబడ్డాయి." },
  "footer.privacy": { en: "Privacy Policy", te: "గోప్యతా విధానం" },
  "footer.terms": { en: "Terms", te: "నిబంధనలు" },
  "footer.support": { en: "Support", te: "మద్దతు" },

  // Booking form
  "form.title": { en: "Book Drone Spraying", te: "డ్రోన్ స్ప్రేయింగ్ బుక్ చేయండి" },
  "form.subtitle": {
    en: "Fill in a few details and our team will confirm your slot on WhatsApp.",
    te: "కొన్ని వివరాలు ఇవ్వండి, మా బృందం వాట్సాప్‌లో మీ స్లాట్‌ను నిర్ధారిస్తుంది.",
  },
  "form.name": { en: "Full Name", te: "పూర్తి పేరు" },
  "form.mobile": { en: "Mobile Number", te: "మొబైల్ నంబర్" },
  "form.village": { en: "Village / Location", te: "గ్రామం / ప్రాంతం" },
  "form.date": { en: "Preferred Date", te: "ఇష్టమైన తేదీ" },
  "form.crop": { en: "Crop Type", te: "పంట రకం" },
  "form.acres": { en: "Total Acres", te: "మొత్తం ఎకరాలు" },
  "form.submit": { en: "Confirm Booking", te: "బుకింగ్ నిర్ధారించండి" },
  "form.processing": { en: "Processing…", te: "ప్రాసెస్ అవుతోంది…" },
  "form.err.name": { en: "Please enter your name", te: "దయచేసి మీ పేరు నమోదు చేయండి" },
  "form.err.mobile": { en: "Enter a valid 10-digit mobile number", te: "సరైన 10-అంకెల మొబైల్ నంబర్ నమోదు చేయండి" },
  "form.err.village": { en: "Please enter your village or location", te: "దయచేసి మీ గ్రామం నమోదు చేయండి" },
  "form.err.date": { en: "Please choose a date", te: "దయచేసి తేదీని ఎంచుకోండి" },
  "form.err.crop": { en: "Please enter your crop", te: "దయచేసి మీ పంటను నమోదు చేయండి" },
  "form.err.acres": { en: "Enter acres (minimum 0.5)", te: "ఎకరాలు నమోదు చేయండి (కనీసం 0.5)" },
  "form.success.title": { en: "Booking Confirmed!", te: "బుకింగ్ నిర్ధారించబడింది!" },
  "form.success.body": {
    en: "Thank you. Our team will reach out on WhatsApp to schedule your drone.",
    te: "ధన్యవాదాలు. మీ డ్రోన్‌ను షెడ్యూల్ చేయడానికి మా బృందం వాట్సాప్‌లో సంప్రదిస్తుంది.",
  },
  "form.success.again": { en: "Book Another Service", te: "మరో సేవను బుక్ చేయండి" },
};
