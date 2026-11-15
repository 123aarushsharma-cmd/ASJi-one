import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Scale,
  Shield,
  Copy,
  Check,
  Globe,
  Lock,
  ArrowRight,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { SpecularCard } from "@/components/SpecularCard";

interface PoliTechPageProps {
  onOpenUnlockModal: (tier?: string) => void;
  isUnlocked?: boolean;
}

export function PoliTechPage({ onOpenUnlockModal, isUnlocked = false }: PoliTechPageProps) {
  const [selectedLang, setSelectedLang] = useState<"en" | "hi" | "ta" | "bn" | "mr" | "es">("en");
  const [candidateName, setCandidateName] = useState("Democratic Action Alliance 2026");
  const [campaignDomain, setCampaignDomain] = useState("campaign.org");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const notices: Record<string, { title: string; body: string }> = {
    en: {
      title: "Statutory Political Campaign Voter Notice & Ad-Disclosure",
      body: `PAID POLITICAL ADVERTISEMENT & VOTER DATA CONSENT NOTICE\nCampaign Committee: ${candidateName}\nAuthorized URL: https://${campaignDomain}\n\n1. PURPOSE OF COLLECTION: Voter registration verification, electoral polling analytics, volunteer mobilization, and campaign outreach under statutory election commission directives.\n2. MANDATORY AD DISCLOSURE: Paid for and authorized by ${candidateName} Treasurer. Compliance ID: POL-2026-ASJI-994.\n3. GRIEVANCE REDRESSAL: Designated Campaign Grievance Officer reachable at hello@asjione.com with a 7-business-day statutory SLA.`,
    },
    hi: {
      title: "वैधानिक राजनीतिक अभियान मतदाता सूचना और विज्ञापन प्रकटीकरण",
      body: `भुगतान किया गया राजनीतिक विज्ञापन और मतदाता डेटा सहमति सूचना\nअभियान समिति: ${candidateName}\nप्राधिकृत यूआरएल: https://${campaignDomain}\n\n1. संग्रह का उद्देश्य: मतदाता पंजीकरण सत्यापन, चुनावी मतदान विश्लेषण, और वैधानिक चुनाव आयोग के दिशानिर्देशों के तहत स्वयंसेवक जुटाना।\n2. अनिवार्य विज्ञापन प्रकटीकरण: ${candidateName} कोषाध्यक्ष द्वारा भुगतान और अधिकृत। अनुपालन आईडी: POL-2026-ASJI-994.\n3. शिकायत निवारण: मुख्य अभियान डेटा गोपनीयता अधिकारी hello@asjione.com पर उपलब्ध।`,
    },
    ta: {
      title: "சட்டபூர்வமான அரசியல் பிரச்சார வாக்காளர் அறிவிப்பு",
      body: `پرداணம் செய்யப்பட்ட அரசியல் விளம்பரம் மற்றும் வாக்காளர் தரவு ஒப்புதல் அறிவிப்பு\nபிரச்சார குழு: ${candidateName}\nஅதிகாரப்பூர்வ முகவரி: https://${campaignDomain}\n\n1. சேகரிப்பின் நோக்கம்: வாக்காளர் பதிவு சரிபார்ப்பு, தேர்தல் கருத்துக் கணிப்பு பகுப்பாய்வு மற்றும் தன்னார்வலர்களைத் திரட்டுதல்.\n2. விளம்பர வெளிப்பாடு: ${candidateName} பொருளாளரால் நிதியளிக்கப்பட்டு அங்கீகரிக்கப்பட்டது.\n3. குறைகளை நிவர்த்தி செய்தல்: hello@asjione.com.`,
    },
    bn: {
      title: "আইনি রাজনৈতিক প্রচারণা ভোটার বিজ্ঞপ্তি এবং বিজ্ঞাপন প্রকাশ",
      body: `পেমেন্টকৃত রাজনৈতিক বিজ্ঞাপন এবং ভোটার ডেটা সম্মতি বিজ্ঞপ্তি\nপ্রচারণা কমিটি: ${candidateName}\nঅনুমোদিত ইউআরএল: https://${campaignDomain}\n\n1. সংগ্রহের উদ্দেশ্য: ভোটার নিবন্ধন যাচাইকরণ, নির্বাচনী পোলিং বিশ্লেষণ এবং স্বেচ্ছাসেবক সংগ্রহ।\n2. বিজ্ঞাপন প্রকাশ: ${candidateName} কোষাধ্যক্ষ দ্বারা অনুমোদিত। কমপ্লায়েন্স আইডি: POL-2026-ASJI-994.\n3. অভিযোগ নিবারণ: hello@asjione.com।`,
    },
    mr: {
      title: "वैधानिक राजकीय मोहीम मतदार सूचना आणि जाहिरात घोषणा",
      body: `पेड राजकीय जाहिरात आणि मतदार डेटा संमती सूचना\nमोहीम समिती: ${candidateName}\nअधिकृत संकेतस्थळ: https://${campaignDomain}\n\n1. गोळा करण्याचा उद्देश: मतदार नोंदणी पडताळणी, निवडणूक मतदान विश्लेषण आणि स्वयंसेवक मोर्चेबांधणी.\n2. जाहिरात घोषणा: ${candidateName} कोषाध्यक्षाद्वारे अधिकृत. अनुपालन आयडी: POL-2026-ASJI-994.\n3. तक्रार निवारण: hello@asjione.com.`,
    },
    es: {
      title: "Aviso Electoral Político Estatutario y Divulgación de Anuncios",
      body: `AVISO DE CONSENTIMIENTO DE DATOS DE VOTANTES Y PUBLICIDAD POLÍTICA PAGADA\nComité de Campaña: ${candidateName}\nURL Autorizada: https://${campaignDomain}\n\n1. PROPÓSITO DE RECOPILACIÓN: Verificación de registro de votantes, análisis de encuestas electorales y movilización de voluntarios bajo directrices electorales.\n2. DIVULGACIÓN OBLIGATORIA: Pagado y autorizado por el Tesorero de ${candidateName}. ID de Cumplimiento: POL-2026-ASJI-994.\n3. OFICIAL DE CUMPLIMIENTO: hello@asjione.com.`,
    },
  };

  const currentNotice = notices[selectedLang] || notices.en;

  const handleCopy = async (text: string, key: string) => {
    if (!isUnlocked) {
      toast.error("PoliTech Suite Locked", {
        description: "Please unlock the PoliTech campaign compliance pack to copy full drafts.",
      });
      onOpenUnlockModal("full-bundle");
      return;
    }
    await navigator.clipboard.writeText(text);
    setCopiedSection(key);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-12 space-y-12">
      {/* Header */}
      <div className="border-b border-[#262932] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded border border-[#C9A227]/40 bg-[#C9A227]/10 px-3 py-1 text-xs font-mono font-bold text-[#C9A227] mb-3">
            <Scale className="h-4 w-4" /> POLITECH ELECTION COMPLIANCE SUITE
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#FAF8F5]">
            Political Campaigns &amp; Electoral Data Defense
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground font-sans max-w-2xl leading-relaxed">
            Statutory voter data protection, mandatory "Paid For By" digital ad-disclosure
            forensics, and multilingual consent charters designed for high-stakes political
            campaigns and ballot committees.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenUnlockModal("full-bundle")}
          className="btn-gold rounded-lg px-6 py-3 text-xs font-mono font-bold uppercase tracking-wider cursor-pointer flex items-center gap-2 shrink-0 shadow-xl"
        >
          <Lock className="h-4 w-4" />
          <span>Unlock PoliTech Campaign Pack</span>
        </button>
      </div>

      {/* Campaign Config Bar */}
      <div className="rounded-xl border border-[#262932] bg-[#15171C] p-6 grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-xs font-mono text-muted-foreground mb-1.5">
            Campaign Committee / Candidate Name
          </label>
          <input
            type="text"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            className="w-full rounded-lg border border-[#262932] bg-[#0D0E11] px-4 py-2.5 text-xs font-mono text-[#FAF8F5] focus:border-[#C9A227] outline-none"
            placeholder="e.g. Committee to Elect Reform 2026"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-muted-foreground mb-1.5">
            Campaign Target Domain
          </label>
          <input
            type="text"
            value={campaignDomain}
            onChange={(e) => setCampaignDomain(e.target.value)}
            className="w-full rounded-lg border border-[#262932] bg-[#0D0E11] px-4 py-2.5 text-xs font-mono text-[#FAF8F5] focus:border-[#C9A227] outline-none"
            placeholder="e.g. reform2026.org"
          />
        </div>
      </div>

      {/* Multilingual Notice Generator */}
      <div className="surface-panel rounded-xl border border-[#262932] bg-[#15171C] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262932] pb-4">
          <div>
            <h3 className="font-display text-xl font-bold text-[#FAF8F5] flex items-center gap-2">
              <Globe className="h-5 w-5 text-[#C9A227]" /> Multilingual Voter Notice &amp; Ad
              Disclosure Generator
            </h3>
            <p className="text-xs font-mono text-muted-foreground">
              Generate statutory electoral disclosures in English, Hindi, Tamil, Bengali, Marathi,
              and Spanish.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-[#0D0E11] p-1.5 rounded-lg border border-[#262932]">
            {[
              { id: "en", label: "English" },
              { id: "hi", label: "Hindi [HI]" },
              { id: "ta", label: "Tamil [TA]" },
              { id: "bn", label: "Bengali [BN]" },
              { id: "mr", label: "Marathi [MR]" },
              { id: "es", label: "Spanish [ES]" },
            ].map((lang) => {
              const isSelected = selectedLang === lang.id;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() =>
                    setSelectedLang(lang.id as "en" | "hi" | "ta" | "bn" | "mr" | "es")
                  }
                  className={`relative rounded px-3 py-1.5 text-xs font-mono font-semibold transition-colors cursor-pointer ${
                    isSelected
                      ? "text-[#0D0E11] font-bold"
                      : "text-muted-foreground hover:text-[#FAF8F5]"
                  }`}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="politechLangTab"
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0 rounded bg-[#C9A227]"
                    />
                  )}
                  <span className="relative z-10">{lang.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative rounded-lg border border-[#E5DEC9] bg-[#FAF8F5] text-[#18181B] p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5DEC9] pb-3 mb-4">
            <h4 className="font-display font-bold text-base text-[#18181B]">
              {currentNotice.title}
            </h4>
            <button
              type="button"
              onClick={() => handleCopy(currentNotice.body, "multilingual-notice")}
              className="flex items-center gap-1.5 rounded bg-[#18181B] px-3 py-1.5 text-xs font-mono font-bold text-[#FAF8F5] hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              {copiedSection === "multilingual-notice" ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#10B981]" /> Copied
                </>
              ) : (
                <>
                  {isUnlocked ? <Copy className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                  <span>{isUnlocked ? "Copy Notice" : "Unlock Notice"}</span>
                </>
              )}
            </button>
          </div>

          <div className="relative font-mono text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-[#18181B] overflow-hidden">
            {isUnlocked ? (
              currentNotice.body
            ) : (
              <>
                <div>{currentNotice.body.split("\n").slice(0, 2).join("\n")}</div>
                <div
                  style={{ filter: "blur(6px)", userSelect: "none", pointerEvents: "none" }}
                  aria-hidden="true"
                  className="mt-2"
                >
                  {currentNotice.body.split("\n").slice(2).join("\n")}
                </div>
              </>
            )}

            {!isUnlocked && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0D0E11]/92 p-6 text-center border border-[#C9A227]/50 backdrop-blur-md z-10">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-[#C9A227] bg-[#15171C] text-[#C9A227] mb-3 shadow-2xl">
                  <Lock className="h-6 w-6" />
                </div>
                <h4 className="font-display text-lg sm:text-xl font-bold text-[#FAF8F5]">
                  PoliTech Campaign Disclosure Pack Locked
                </h4>
                <p className="mt-1.5 mx-auto max-w-md text-xs font-sans text-muted-foreground leading-relaxed">
                  Unlock complete unredacted multilingual voter notices, digital ad tracker audit
                  checklists, and campaign vendor NDAs.
                </p>
                <button
                  type="button"
                  onClick={() => onOpenUnlockModal("full-bundle")}
                  className="btn-gold mt-4 rounded-lg px-6 py-3 text-xs font-mono font-bold uppercase tracking-wider cursor-pointer flex items-center gap-2 shadow-2xl"
                >
                  <span>Unlock Campaign Suite</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bento Grid Features */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <SpecularCard className="rounded-xl border border-[#262932] bg-[#15171C] p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C9A227]/10 border border-[#C9A227]/30 text-[#C9A227]">
            <Shield className="h-5 w-5" />
          </div>
          <h3 className="font-display text-lg font-bold text-[#FAF8F5]">
            Voter Ad-Tracker Forensics
          </h3>
          <p className="text-xs font-sans text-muted-foreground leading-relaxed">
            Inspect Meta, Google, and TikTok election pixels embedded on candidate websites to
            prevent unauthorized voter profiling and FEC/Electoral commission violations.
          </p>
        </SpecularCard>

        <SpecularCard className="rounded-xl border border-[#262932] bg-[#15171C] p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C9A227]/10 border border-[#C9A227]/30 text-[#C9A227]">
            <Building2 className="h-5 w-5" />
          </div>
          <h3 className="font-display text-lg font-bold text-[#FAF8F5]">
            "Paid For By" Disclosures
          </h3>
          <p className="text-xs font-sans text-muted-foreground leading-relaxed">
            Mandatory footer HTML code snippets that automatically verify candidate committee
            registration numbers and treasurer authorization strings.
          </p>
        </SpecularCard>

        <SpecularCard className="rounded-xl border border-[#262932] bg-[#15171C] p-6 space-y-3 md:col-span-2 lg:col-span-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C9A227]/10 border border-[#C9A227]/30 text-[#C9A227]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="font-display text-lg font-bold text-[#FAF8F5]">
            Campaign Vendor NDA Pack
          </h3>
          <p className="text-xs font-sans text-muted-foreground leading-relaxed">
            Airtight confidentiality agreements for external canvassing software vendors, SMS
            broadcast gateways, and telemarketing contractors.
          </p>
        </SpecularCard>
      </div>
    </div>
  );
}
