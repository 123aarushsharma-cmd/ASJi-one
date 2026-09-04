/**
 * Detects origin registered country from TLD, domain string, or report metadata.
 */
export function detectDomainOriginCountry(
  domain: string,
  reportOrigin?: string,
): {
  countryName: string;
  flag: string;
  jurisdictionCode: string;
} {
  const clean = domain
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "");

  if (reportOrigin && reportOrigin.trim().length > 1 && !/unknown|global/i.test(reportOrigin)) {
    const ro = reportOrigin.toLowerCase();
    if (ro.includes("india") || ro.includes("bharat"))
      return { countryName: "India", flag: "🇮🇳", jurisdictionCode: "IN" };
    if (ro.includes("emirates") || ro.includes("uae") || ro.includes("dubai"))
      return { countryName: "United Arab Emirates", flag: "🇦🇪", jurisdictionCode: "AE" };
    if (ro.includes("saudi") || ro.includes("ksa"))
      return { countryName: "Saudi Arabia", flag: "🇸🇦", jurisdictionCode: "SA" };
    if (ro.includes("singapore"))
      return { countryName: "Singapore", flag: "🇸🇬", jurisdictionCode: "SG" };
    if (ro.includes("united kingdom") || ro.includes("uk") || ro.includes("britain"))
      return { countryName: "United Kingdom", flag: "🇬🇧", jurisdictionCode: "GB" };
    if (ro.includes("europe") || ro.includes("germany") || ro.includes("france"))
      return { countryName: "European Union", flag: "🇪🇺", jurisdictionCode: "EU" };
    if (ro.includes("united states") || ro.includes("usa") || ro.includes("us"))
      return { countryName: "United States", flag: "🇺🇸", jurisdictionCode: "US" };
  }

  // TLD and domain patterns
  if (
    clean.endsWith(".in") ||
    clean.includes(".co.in") ||
    clean.includes(".gov.in") ||
    clean.includes(".ac.in") ||
    clean.includes(".org.in") ||
    clean.includes(".net.in") ||
    /india|delhi|mumbai|jaipur|bangalore|pune|bharat/i.test(clean)
  ) {
    return { countryName: "India", flag: "🇮🇳", jurisdictionCode: "IN" };
  }
  if (
    clean.endsWith(".ae") ||
    clean.includes(".co.ae") ||
    clean.includes(".gov.ae") ||
    clean.endsWith(".dubai") ||
    clean.endsWith(".abudhabi") ||
    /dubai|emirates|abudhabi|uae/i.test(clean)
  ) {
    return { countryName: "United Arab Emirates", flag: "🇦🇪", jurisdictionCode: "AE" };
  }
  if (
    clean.endsWith(".sa") ||
    clean.includes(".com.sa") ||
    clean.includes(".gov.sa") ||
    clean.includes(".med.sa") ||
    /saudi|riyadh|jeddah|aramco/i.test(clean)
  ) {
    return { countryName: "Saudi Arabia", flag: "🇸🇦", jurisdictionCode: "SA" };
  }
  if (
    clean.endsWith(".sg") ||
    clean.includes(".com.sg") ||
    clean.includes(".edu.sg") ||
    clean.includes(".gov.sg") ||
    /singapore/i.test(clean)
  ) {
    return { countryName: "Singapore", flag: "🇸🇬", jurisdictionCode: "SG" };
  }
  if (
    clean.endsWith(".uk") ||
    clean.includes(".co.uk") ||
    clean.includes(".gov.uk") ||
    clean.includes(".org.uk") ||
    /london|britain/i.test(clean)
  ) {
    return { countryName: "United Kingdom", flag: "🇬🇧", jurisdictionCode: "GB" };
  }
  if (
    clean.endsWith(".eu") ||
    clean.endsWith(".de") ||
    clean.endsWith(".fr") ||
    clean.endsWith(".it") ||
    clean.endsWith(".es") ||
    clean.endsWith(".nl") ||
    clean.endsWith(".be") ||
    clean.endsWith(".se") ||
    clean.endsWith(".pl") ||
    clean.endsWith(".at") ||
    clean.endsWith(".ie")
  ) {
    return { countryName: "European Union", flag: "🇪🇺", jurisdictionCode: "EU" };
  }
  if (clean.endsWith(".us") || clean.endsWith(".gov") || clean.endsWith(".mil")) {
    return { countryName: "United States", flag: "🇺🇸", jurisdictionCode: "US" };
  }

  // Generic fallback: Global / Multi-Region Registry
  return { countryName: "Global / Multi-Region", flag: "🌐", jurisdictionCode: "GLOBAL" };
}
