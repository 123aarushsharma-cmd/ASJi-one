export type LocationInfo = {
  countryName: string;
  flag: string;
  jurisdictionCode: string;
};

export function detectServerLocation(
  domain: string,
  techList?: string[],
  headers?: Record<string, string>,
): LocationInfo {
  return detectDomainOriginCountry(domain);
}

export function detectBusinessLocation(
  domain: string,
  reportOrigin?: string,
  html?: string,
): LocationInfo {
  return detectDomainOriginCountry(domain, reportOrigin);
}

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
    if (ro.includes("nigeria") || ro.includes("lagos") || ro.includes("abuja"))
      return { countryName: "Nigeria", flag: "🇳🇬", jurisdictionCode: "NG" };
    if (ro.includes("south africa") || ro.includes("pretoria") || ro.includes("johannesburg"))
      return { countryName: "South Africa", flag: "🇿🇦", jurisdictionCode: "ZA" };
    if (ro.includes("japan") || ro.includes("tokyo"))
      return { countryName: "Japan", flag: "🇯🇵", jurisdictionCode: "JP" };
    if (ro.includes("korea") || ro.includes("seoul"))
      return { countryName: "South Korea", flag: "🇰🇷", jurisdictionCode: "KR" };
    if (
      ro.includes("switzerland") ||
      ro.includes("swiss") ||
      ro.includes("geneva") ||
      ro.includes("zurich")
    )
      return { countryName: "Switzerland", flag: "🇨🇭", jurisdictionCode: "CH" };
    if (
      ro.includes("canada") ||
      ro.includes("toronto") ||
      ro.includes("vancouver") ||
      ro.includes("ottawa")
    )
      return { countryName: "Canada", flag: "🇨🇦", jurisdictionCode: "CA" };
    if (
      ro.includes("australia") ||
      ro.includes("sydney") ||
      ro.includes("melbourne") ||
      ro.includes("canberra")
    )
      return { countryName: "Australia", flag: "🇦🇺", jurisdictionCode: "AU" };
    if (
      ro.includes("brazil") ||
      ro.includes("brasil") ||
      ro.includes("sao paulo") ||
      ro.includes("rio")
    )
      return { countryName: "Brazil", flag: "🇧🇷", jurisdictionCode: "BR" };
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
  if (
    clean.endsWith(".ng") ||
    clean.includes(".com.ng") ||
    clean.includes(".gov.ng") ||
    clean.includes(".org.ng") ||
    clean.includes(".edu.ng") ||
    /nigeria|lagos|abuja/i.test(clean)
  ) {
    return { countryName: "Nigeria", flag: "🇳🇬", jurisdictionCode: "NG" };
  }
  if (
    clean.endsWith(".za") ||
    clean.includes(".co.za") ||
    clean.includes(".gov.za") ||
    /southafrica|pretoria|johannesburg|capetown/i.test(clean)
  ) {
    return { countryName: "South Africa", flag: "🇿🇦", jurisdictionCode: "ZA" };
  }
  if (clean.endsWith(".jp") || clean.includes(".co.jp") || /tokyo|japan/i.test(clean)) {
    return { countryName: "Japan", flag: "🇯🇵", jurisdictionCode: "JP" };
  }
  if (clean.endsWith(".kr") || clean.includes(".co.kr") || /seoul|korea/i.test(clean)) {
    return { countryName: "South Korea", flag: "🇰🇷", jurisdictionCode: "KR" };
  }
  if (clean.endsWith(".ch") || /switzerland|geneva|zurich/i.test(clean)) {
    return { countryName: "Switzerland", flag: "🇨🇭", jurisdictionCode: "CH" };
  }
  if (clean.endsWith(".ca") || clean.includes(".gc.ca") || /canada|toronto|ottawa/i.test(clean)) {
    return { countryName: "Canada", flag: "🇨🇦", jurisdictionCode: "CA" };
  }
  if (clean.endsWith(".au") || clean.includes(".com.au") || /australia|sydney/i.test(clean)) {
    return { countryName: "Australia", flag: "🇦🇺", jurisdictionCode: "AU" };
  }
  if (clean.endsWith(".br") || clean.includes(".com.br") || /brasil|brazil|saopaulo/i.test(clean)) {
    return { countryName: "Brazil", flag: "🇧🇷", jurisdictionCode: "BR" };
  }

  // Generic fallback: Global / Multi-Region Registry
  return { countryName: "Global / Multi-Region", flag: "🌐", jurisdictionCode: "GLOBAL" };
}
