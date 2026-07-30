export interface LanguageDefinition {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  category: "indian" | "global" | "baseline";
  anchorKeywords: string[];
  pathPatterns: RegExp[];
  hreflangCodes: string[];
}

export const LANGUAGE_CLUSTERS: LanguageDefinition[] = [
  // Baseline
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇬🇧",
    category: "baseline",
    anchorKeywords: [
      "privacy policy",
      "privacy notice",
      "data protection",
      "terms of service",
      "cookie policy",
    ],
    pathPatterns: [/\/en\//i, /\/en-us\//i, /\/en-gb\//i, /\/privacy/i],
    hreflangCodes: ["en", "en-us", "en-gb", "en-in"],
  },
  // Indian Regional Core
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिंदी",
    flag: "🇮🇳",
    category: "indian",
    anchorKeywords: [
      "गोपनीयता नीति",
      "प्राइवेसी पॉलिसी",
      "नियम और शर्तें",
      "प्राइवेसी नोटीस",
      "डेटा सुरक्षा",
    ],
    pathPatterns: [/\/hi\//i, /\/hi-in\//i, /\/hindi\//i, /privacy-hi/i, /policy-hi/i],
    hreflangCodes: ["hi", "hi-in"],
  },
  {
    code: "ta",
    name: "Tamil",
    nativeName: "தமிழ்",
    flag: "🇮🇳",
    category: "indian",
    anchorKeywords: ["தனியுரிமைக் கொள்கை", "பிரைவசி பாலிசி", "தனியுரிமை அறிவிப்பு", "விதிகள்"],
    pathPatterns: [/\/ta\//i, /\/ta-in\//i, /\/tamil\//i, /privacy-ta/i],
    hreflangCodes: ["ta", "ta-in"],
  },
  {
    code: "te",
    name: "Telugu",
    nativeName: "తెలుగు",
    flag: "🇮🇳",
    category: "indian",
    anchorKeywords: ["గోప్యతా విధానం", "ప్రైవసీ పాలసీ", "గోప్యతా నోటీసు", "నిబంధనలు"],
    pathPatterns: [/\/te\//i, /\/te-in\//i, /\/telugu\//i, /privacy-te/i],
    hreflangCodes: ["te", "te-in"],
  },
  {
    code: "bn",
    name: "Bengali",
    nativeName: "বাংলা",
    flag: "🇮🇳",
    category: "indian",
    anchorKeywords: ["গোপনীয়তা নীতি", "প্রাইভেসি পলিসি", "গোপনীয়তার নোটিশ", "শর্তাবলী"],
    pathPatterns: [/\/bn\//i, /\/bn-in\//i, /\/bengali\//i, /privacy-bn/i],
    hreflangCodes: ["bn", "bn-in"],
  },
  {
    code: "mr",
    name: "Marathi",
    nativeName: "मराठी",
    flag: "🇮🇳",
    category: "indian",
    anchorKeywords: ["गोपनीयता धोरण", "प्रायव्हसी पॉलिसी", "गोपनीयता सूचना", "अटी व शर्ती"],
    pathPatterns: [/\/mr\//i, /\/mr-in\//i, /\/marathi\//i, /privacy-mr/i],
    hreflangCodes: ["mr", "mr-in"],
  },
  // Global Enterprise Core
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    flag: "🇦🇪",
    category: "global",
    anchorKeywords: [
      "سياسة الخصوصية",
      "الشروط والأحكام",
      "إشعار الخصوصية",
      "حماية البيانات",
      "خصوصية",
    ],
    pathPatterns: [/\/ar\//i, /\/ar-ae\//i, /\/ar-sa\//i, /\/arabic\//i, /privacy-ar/i],
    hreflangCodes: ["ar", "ar-ae", "ar-sa", "ar-kw", "ar-eg"],
  },
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    category: "global",
    anchorKeywords: [
      "política de privacidad",
      "aviso de privacidad",
      "términos y condiciones",
      "protección de datos",
    ],
    pathPatterns: [/\/es\//i, /\/es-es\//i, /\/es-mx\//i, /\/spanish\//i, /privacidad/i],
    hreflangCodes: ["es", "es-es", "es-mx", "es-us"],
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
    category: "global",
    anchorKeywords: [
      "politique de confidentialité",
      "mentions légales",
      "données personnelles",
      "protection des données",
    ],
    pathPatterns: [/\/fr\//i, /\/fr-fr\//i, /\/fr-ca\//i, /\/french\//i, /confidentialite/i],
    hreflangCodes: ["fr", "fr-fr", "fr-ca", "fr-be"],
  },
  {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    flag: "🇩🇪",
    category: "global",
    anchorKeywords: [
      "datenschutzerklärung",
      "datenschutz",
      "impressum",
      "nutzungsbedingungen",
      "privatsphäre",
    ],
    pathPatterns: [/\/de\//i, /\/de-de\//i, /\/de-at\//i, /\/german\//i, /datenschutz/i],
    hreflangCodes: ["de", "de-de", "de-at", "de-ch"],
  },
  {
    code: "zh",
    name: "Mandarin Chinese",
    nativeName: "中文",
    flag: "🇨🇳",
    category: "global",
    anchorKeywords: ["隐私政策", "隱私政策", "服务条款", "数据保护", "個人資料說明"],
    pathPatterns: [/\/zh\//i, /\/zh-cn\//i, /\/zh-tw\//i, /\/chinese\//i, /yinsi/i],
    hreflangCodes: ["zh", "zh-cn", "zh-tw", "zh-hk"],
  },
];

export interface LanguageDetectionResult {
  lang: LanguageDefinition;
  detected: boolean;
  confidence: "high" | "medium" | "low" | "none";
  matchedSignals: string[];
}

export interface LocalizationScanSummary {
  target: string;
  isIndiaTarget: boolean;
  isDubaiMiddleEastTarget: boolean;
  detectedCount: number;
  totalChecked: number;
  results: LanguageDetectionResult[];
  isHighRiskIndiaGap: boolean;
  isHighRiskDubaiGap: boolean;
  localizationScore: number;
  legalRiskMessages: string[];
}

export function analyzeTargetLocalization(
  target: string,
  evidenceText: string = "",
  policyLinks: string[] = [],
  originCountry: string = "",
): LocalizationScanSummary {
  const cleanTarget = (target || "").toLowerCase().trim();
  const fullContent = (evidenceText + " " + policyLinks.join(" ")).toLowerCase();

  const isIndiaTarget =
    /\.(in|co\.in|gov\.in|edu\.in|org\.in|net\.in|res\.in|ac\.in)($|\/|\?|:)/i.test(cleanTarget) ||
    cleanTarget.endsWith(".in") ||
    cleanTarget.endsWith(".co.in") ||
    /india|\bin\b/i.test(originCountry);

  const isDubaiMiddleEastTarget =
    /\.(ae|sa|qa|kw|om|bh|me)($|\/|\?|:)/i.test(cleanTarget) ||
    /dubai|uae|emirates|saudi|riyadh|qatar|doha|gcc|middle east/i.test(
      cleanTarget + " " + fullContent,
    );

  const results: LanguageDetectionResult[] = LANGUAGE_CLUSTERS.map((lang) => {
    const matchedSignals: string[] = [];

    for (const kw of lang.anchorKeywords) {
      if (fullContent.includes(kw.toLowerCase())) {
        matchedSignals.push(`Anchor text keyword matched: "${kw}"`);
      }
    }

    for (const pattern of lang.pathPatterns) {
      if (pattern.test(fullContent) || pattern.test(cleanTarget)) {
        matchedSignals.push(`URL path structure matched: ${pattern.source}`);
      }
    }

    for (const code of lang.hreflangCodes) {
      const regex = new RegExp(`(hreflang|lang)=["']?${code}["']?`, "i");
      if (regex.test(fullContent)) {
        matchedSignals.push(`HTML lang/hreflang tag found: "${code}"`);
      }
    }

    if (lang.code === "en") {
      if (/privacy|terms|cookie|gdpr/i.test(fullContent) || !isIndiaTarget) {
        if (!matchedSignals.length) matchedSignals.push("Default English web baseline active");
      }
    }

    const detected = matchedSignals.length > 0;
    let confidence: "high" | "medium" | "low" | "none" = "none";
    if (matchedSignals.length >= 2) confidence = "high";
    else if (matchedSignals.length === 1) confidence = "medium";

    return {
      lang,
      detected,
      confidence,
      matchedSignals,
    };
  });

  const detectedCount = results.filter((r) => r.detected).length;
  const indianDetected = results.filter((r) => r.lang.category === "indian" && r.detected).length;
  const hasArabic = results.find((r) => r.lang.code === "ar")?.detected || false;

  const isHighRiskIndiaGap = isIndiaTarget && indianDetected < 2;
  const isHighRiskDubaiGap = isDubaiMiddleEastTarget && !hasArabic;

  const legalRiskMessages: string[] = [];
  if (isHighRiskIndiaGap) {
    legalRiskMessages.push(
      "High-Risk Localization Gap: Under DPDP Act 2023 Section 5(3), Data Fiduciaries must make Privacy Notices available in English AND all 22 8th Schedule Indian languages specified by the Data Principal.",
    );
  }
  if (isHighRiskDubaiGap) {
    legalRiskMessages.push(
      "High-Risk Middle East Gap: UAE Federal Decree-Law No. 45/2021 (PDPL) & Dubai DIFC Data Protection Law Article 29 require Arabic legal notices for regional data subjects.",
    );
  }
  if (!isHighRiskIndiaGap && !isHighRiskDubaiGap && detectedCount <= 2) {
    legalRiskMessages.push(
      "Global Expansion Gap: Notice is available in single language only. Missing localized disclosures for cross-border traffic under GDPR / CCPA / DPDP.",
    );
  }

  let localizationScore = 40;
  if (results.find((r) => r.lang.code === "en")?.detected) localizationScore += 20;
  localizationScore += Math.min(40, indianDetected * 10);
  const globalDetected = results.filter((r) => r.lang.category === "global" && r.detected).length;
  localizationScore += Math.min(30, globalDetected * 8);

  if (isHighRiskIndiaGap || isHighRiskDubaiGap) {
    localizationScore = Math.min(55, localizationScore);
  }

  return {
    target,
    isIndiaTarget,
    isDubaiMiddleEastTarget,
    detectedCount,
    totalChecked: LANGUAGE_CLUSTERS.length,
    results,
    isHighRiskIndiaGap,
    isHighRiskDubaiGap,
    localizationScore,
    legalRiskMessages,
  };
}
