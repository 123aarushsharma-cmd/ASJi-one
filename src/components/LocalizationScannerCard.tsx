import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  FileText,
  Languages,
  Search,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import type { AuditReport } from "@/lib/audit.functions";
import {
  analyzeTargetLocalization,
  LANGUAGE_CLUSTERS,
  type LanguageDefinition,
} from "@/lib/localization-scanner";

interface LocalizationScannerCardProps {
  report: AuditReport;
  onOpenRemediationModal?: () => void;
}

type FilterCategory = "all" | "indian" | "global";

const STATUTORY_NOTICE_TEMPLATES: Record<string, { title: string; body: string; actName: string }> =
  {
    hi: {
      actName: "DPDP Act 2023 (धारा 5(3))",
      title: "डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP) वैधानिक नोटिस",
      body: `डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 (धारा 5(3)) के अनुसार वैधानिक सूचना:

1. डेटा संग्रह का उद्देश्य: आपके द्वारा प्रदान किया गया व्यक्तिगत डेटा केवल स्पष्ट रूप से बताई गई सेवाओं को प्रदान करने, वैधानिक अनुपालन सुनिश्चित करने और सुरक्षा बनाए रखने के लिए संसाधित किया जाता है।
2. डेटा प्रिंसिपल के अधिकार: धारा 11-14 के तहत, आपके पास अपने डेटा की समीक्षा करने, सुधार करने, सहमति वापस लेने (Withdraw Consent) और मिटाने (Erase) का पूर्ण वैधानिक अधिकार है।
3. शिकायत निवारण प्रक्रिया: किसी भी डेटा सुरक्षा प्रश्न या शिकायत के लिए, हमारे डेटा संरक्षण अधिकारी (DPO) से dpo@\${domain} पर संपर्क करें।
4. तृतीय-पक्ष साझाकरण: आपका डेटा आपकी स्पष्ट सहमति के बिना किसी भी अनधिकृत तृतीय-पक्ष विज्ञापनदाता के साथ साझा नहीं किया जाता है।`,
    },
    ta: {
      actName: "DPDP Act 2023 (பிரிவு 5(3))",
      title: "டிஜிட்டல் தனிப்பட்ட தரவு பாதுகாப்பு சட்டபூர்வமான அறிவிப்பு",
      body: `டிஜிட்டல் தனிப்பட்ட தரவு பாதுகாப்புச் சட்டம், 2023 (பிரிவு 5(3)) இன் கீழ் சட்டப்பூர்வ அறிவிப்பு:

1. தரவு சேகரிப்பின் நோக்கம்: நீங்கள் வழங்கும் தனிப்பட்ட தரவு வெளிப்படையாகக் கூறப்பட்ட சேவைகளை வழங்கவும், சட்டப்பூர்வ இணக்கத்தை உறுதிப்படுத்தவும் மட்டுமே செயலாக்கப்படுகிறது.
2. தரவு முதன்மை உரிமைகள்: பிரிவு 11-14 இன் கீழ், உங்கள் தரவை மதிப்பாய்வு செய்யவும், திருத்தவும், ஒப்புதலைத் திரும்பப் பெறவும் மற்றும் அழிக்கவும் உங்களுக்கு முழு உரிமை உண்டு.
3. குறைகளை நிவர்த்தி செய்யும் முறை: தரவு பாதுகாப்பு தொடர்பான கேள்விகளுக்கு, dpo@\${domain} என்ற மின்னஞ்சலில் எங்களது தரவு பாதுகாப்பு அதிகாரியைத் தொடர்பு கொள்ளவும்.`,
    },
    te: {
      actName: "DPDP Act 2023 (సెక్షన్ 5(3))",
      title: "డిజిటల్ వ్యక్తిగత డేటా రక్షణ చట్టబద్ధమైన నోటీసు",
      body: `డిజిటల్ వ్యక్తిగత డేటా రక్షణ చట్టం, 2023 (సెక్షన్ 5(3)) ప్రకారం చట్టబద్ధమైన నోటీసు:

1. డేటా సేకరణ ఉద్దేశ్యం: మీరు అందించే వ్యక్తిగత డేటా స్పష్టంగా పేర్కొన్న సేవలను అందించడానికి మరియు చట్టబద్ధమైన నిబంధనలను పాటించడానికి మాత్రమే ఉపయోగించబడుతుంది.
2. డేటా ప్రిన్సిపల్ హక్కులు: సెక్షన్ 11-14 ప్రకారం, మీ డేటాను సమీక్షించడానికి, సవరించడానికి, సమ్మతిని ఉపసంహరించుకోవడానికి మరియు తొలగించడానికి మీకు పూర్తి హక్కు ఉంది.
3. ఫిర్యాదుల పరిష్కార వ్యవస్థ: సహాయం కోసం మా డేటా ప్రొటెక్షన్ ఆఫీసర్ (DPO) dpo@\${domain} ని సంప్రదించండి.`,
    },
    bn: {
      actName: "DPDP Act 2023 (ধারা ৫(৩))",
      title: "ডিজিটাল ব্যক্তিগত ডেটা সুরক্ষা সংবিধিবদ্ধ বিজ্ঞপ্তি",
      body: `ডিজিটাল ব্যক্তিগত ডেটা সুরক্ষা আইন, ২০২৩ (ধারা ৫(৩)) অনুযায়ী সংবিধিবদ্ধ বিজ্ঞপ্তি:

১. ডেটা সংগ্রহের উদ্দেশ্য: আপনার সরবরাহ করা ব্যক্তিগত ডেটা কেবল নির্দিষ্ট পরিষেবা প্রদান এবং আইনি সম্মতি নিশ্চিত করার জন্য প্রক্রিয়া করা হয়।
২. ডেটা প্রিন্সিপালের অধিকার: ধারা ১১-১৪ এর অধীনে, আপনার ডেটা পর্যালোচনা, সংশোধন, সম্মতি প্রত্যাহার এবং মুছে ফেলার পূর্ণ অধিকার রয়েছে।
৩. অভিযোগ প্রতিকার ব্যবস্থা: ডেটা সুরক্ষা সংক্রান্ত প্রশ্নের জন্য dpo@\${domain}-এ যোগাযোগ করুন।`,
    },
    mr: {
      actName: "DPDP Act 2023 (कलम ५(३))",
      title: "डिजिटल वैयक्तिक डेटा संरक्षण वैधानिक सूचना",
      body: `डिजिटल वैयक्तिक डेटा संरक्षण कायदा, २०२३ (कलम ५(३)) अन्वये वैधानिक सूचना:

१. डेटा संकलनाचे उद्दिष्ट: तुमच्याद्वारे प्रदान केलेला वैयक्तिक डेटा केवळ नमूद केलेल्या सेवा प्रदान करण्यासाठी आणि कायदेशीर पालनासाठी वापरला जातो.
२. डेटा प्रिंसिपलचे अधिकार: कलम ११-१४ अंतर्गत, तुम्हाला तुमच्या डेटाचे पुनरावलोकन करण्याचे, संमती मागे घेण्याचे आणि डेटा हटवण्याचे पूर्ण अधिकार आहेत.
३. तक्रार निवारण यंत्रणा: आमच्या डेटा संरक्षण अधिकाऱ्याशी dpo@\${domain} वर संपर्क साध.`,
    },
    ar: {
      actName: "UAE Federal Decree-Law No. 45/2021",
      title: "إشعار الخصوصية وحماية البيانات الشخصية",
      body: `إشعار قانوني بموجب قانون حماية البيانات الشخصية رقم 45 لسنة 2021:

1. الغرض من معالجة البيانات: تتم معالجة بياناتك الشخصية حصرياً لتقديم الخدمات المطلوبة والامتثال للأنظمة القانونية.
2. حقوق صاحب البيانات: يحق لك الوصول إلى بياناتك، تصحيحها، سحب الموافقة، وطلب محوها وفقاً للأنظمة.
3. آلية الشكاوى والمظالم: للاتصال بمسؤول حماية البيانات (DPO)، يرجى المراسلة عبر dpo@\${domain}.`,
    },
    es: {
      actName: "GDPR Art. 13 / Ley Orgánica 3/2018",
      title: "Aviso Legal de Privacidad y Protección de Datos",
      body: `Aviso Legal conforme al Reglamento General de Protección de Datos (GDPR Art. 13):

1. Finalidad del tratamiento: Sus datos personales son tratados con la exclusiva finalidad de prestar los servicios contratados y cumplir obligaciones legales.
2. Derechos ARCO / GDPR: Puede ejercitar sus derechos de acceso, rectificación, supresión, limitación y retirada del consentimiento en cualquier momento.
3. Delegado de Protección de Datos: Contacte con nuestro DPO en dpo@\${domain}.`,
    },
    fr: {
      actName: "RGPD Article 13 / Loi Informatique et Libertés",
      title: "Notice Légale de Confidentialité et Protection des Données",
      body: `Information Légale conformément au Règlement Général sur la Protection des Données (RGPD Art. 13) :

1. Finalité du traitement : Vos données personnelles sont traitées exclusivement pour la fourniture de nos services et le respect des obligations légales.
2. Droits des personnes : Vous disposez d'un droit d'accès, de rectification, d'effacement et de retrait de votre consentement.
3. Contact DPO : Pour exercer vos droits, contactez notre Délégué à la Protection des Données sur dpo@\${domain}.`,
    },
    de: {
      actName: "DSGVO Art. 13 / BDSG",
      title: "Gesetzliche Datenschutzerklärung & Information",
      body: `Gesetzliche Information gemäß Art. 13 Datenschutz-Grundverordnung (DSGVO):

1. Zweck der Datenverarbeitung: Ihre personenbezogenen Daten werden ausschließlich zur Bereitstellung unserer Dienste und Erfüllung gesetzlicher Pflichten verarbeitet.
2. Rechte der betroffenen Person: Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Widerruf Ihrer Einwilligung.
3. Datenschutzbeauftragter: Kontaktieren Sie unseren Datenschutzbeauftragten unter dpo@\${domain}.`,
    },
    zh: {
      actName: "中华人民共和国个人信息保护法 (PIPL)",
      title: "法定个人信息保护与隐私合规声明",
      body: `根据《中华人民共和国个人信息保护法》相关规定之法定声明：

1. 个人信息处理目的：我们收集的个人信息仅用于提供特定服务及履行法定合规义务。
2. 数据主体权利：您享有查阅、复制、更正、撤回同意及删除个人信息的权利。
3. 个人信息保护负责人：如有隐私问题，请联系我们的隐私官：dpo@\${domain}。`,
    },
    en: {
      actName: "DPDP Act 2023 Sec. 5(3) & GDPR Art. 13",
      title: "Statutory Privacy & Data Protection Notice",
      body: `Statutory Notice under Digital Personal Data Protection Act 2023 & International Regulations:

1. Purpose of Processing: Personal data collected is processed strictly to fulfill requested services, maintain security, and adhere to statutory compliance mandates.
2. Data Principal Rights: Under applicable privacy law, you maintain statutory rights to review, correct, withdraw consent, and request data erasure.
3. Grievance Redressal: For any privacy inquiries or statutory complaints, contact our designated Data Protection Officer at dpo@\${domain}.`,
    },
  };

export function LocalizationScannerCard({
  report,
  onOpenRemediationModal,
}: LocalizationScannerCardProps) {
  const [activeTab, setActiveTab] = useState<FilterCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNoticeLang, setSelectedNoticeLang] = useState<LanguageDefinition | null>(null);
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Calculate evidence text & policy links from report
  const evidenceText = useMemo(() => {
    const ev = (report.evidence || []).join(" ");
    const sum = report.summary || "";
    return `${ev} ${sum}`;
  }, [report.evidence, report.summary]);

  const policyLinks = useMemo(() => {
    const links: string[] = [];
    if (report.provenance?.sources) {
      links.push(...report.provenance.sources);
    }
    return links;
  }, [report.provenance]);

  const localizationData = useMemo(() => {
    return analyzeTargetLocalization(
      report.target,
      evidenceText,
      policyLinks,
      report.originCountry,
    );
  }, [report.target, evidenceText, policyLinks, report.originCountry]);

  const filteredResults = useMemo(() => {
    return localizationData.results.filter((res) => {
      if (activeTab === "indian" && res.lang.category !== "indian") return false;
      if (activeTab === "global" && res.lang.category !== "global") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          res.lang.name.toLowerCase().includes(q) ||
          res.lang.nativeName.toLowerCase().includes(q) ||
          res.lang.code.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [localizationData.results, activeTab, searchQuery]);

  const indianDetected = localizationData.results.filter(
    (r) => r.lang.category === "indian" && r.detected,
  ).length;

  const globalDetected = localizationData.results.filter(
    (r) => r.lang.category === "global" && r.detected,
  ).length;

  // Active statutory template for modal
  const activeNoticeTemplate = useMemo(() => {
    if (!selectedNoticeLang) return null;
    const rawDomain = report.target
      ? report.target.replace(/^https?:\/\//, "").split("/")[0]
      : "company.com";
    const template =
      STATUTORY_NOTICE_TEMPLATES[selectedNoticeLang.code] || STATUTORY_NOTICE_TEMPLATES.en;
    return {
      actName: template.actName,
      title: template.title,
      text: template.body.replace(/\$\{domain\}/g, rawDomain),
    };
  }, [selectedNoticeLang, report.target]);

  const handleCopyNotice = () => {
    if (!activeNoticeTemplate) return;
    navigator.clipboard.writeText(`${activeNoticeTemplate.title}\n\n${activeNoticeTemplate.text}`);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
  };

  return (
    <div className="surface-panel relative overflow-hidden rounded-2xl p-6 sm:p-8">
      {/* Background Decorative Gradient */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />

      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/40 bg-primary/15 text-primary shadow-sm">
            <Languages className="h-6 w-6" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-xl text-gold-gradient">
                Global &amp; Regional Language Notice Scanner
              </h3>
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                Multi-Lingual Compliance Engine
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Verifies privacy policies &amp; statutory disclosures across 10+ Indian regional &amp;
              global enterprise languages
            </p>
          </div>
        </div>

        {/* Score & Summary Badge */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-right">
            <div className="text-xs font-semibold text-muted-foreground">Localization Index</div>
            <div className="font-display text-2xl font-bold text-foreground">
              {localizationData.detectedCount}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                / {localizationData.totalChecked} Languages
              </span>
            </div>
          </div>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl border font-sans text-sm font-bold shadow-sm ${
              localizationData.localizationScore >= 70
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border-amber-500/40 bg-amber-500/10 text-amber-400"
            }`}
          >
            {localizationData.localizationScore}%
          </div>
        </div>
      </div>

      <div className="gold-rule my-5" />

      {/* HIGH-RISK STATUTORY WARNING BANNERS (Refined Amber Styling) */}
      {localizationData.isHighRiskIndiaGap && (
        <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-950/20 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-500/50 bg-amber-500/15 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-display text-base font-bold text-amber-300">
                  Regional Notice Coverage Needed — DPDP Act 2023 Section 5(3)
                </h4>
                <span className="rounded border border-amber-500/40 bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  STATUTORY NOTICE MANDATE
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Target domain operates in India (
                <span className="font-sans font-bold text-foreground">{report.target}</span>), but
                lacks privacy policy disclosures in key Indian regional languages (Hindi, Tamil,
                Telugu, Bengali, Marathi). Under Section 5(3) of the Digital Personal Data
                Protection Act 2023, Data Fiduciaries must make privacy notices available in English
                and 8th Schedule languages.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={onOpenRemediationModal}
                  className="inline-flex items-center gap-2 rounded-xl border border-primary/50 bg-primary/20 px-4 py-2 text-xs font-bold text-primary transition-all hover:bg-primary/30"
                >
                  <Zap className="h-4 w-4" />
                  Generate Multilingual Notices with Remediation Token
                </button>
                <span className="text-[11px] text-muted-foreground">
                  Includes full 22-language statutory DPDP notice bundle
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs & Search Controls */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 rounded-xl border border-border bg-black/60 p-1">
          <button
            onClick={() => setActiveTab("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Clusters ({LANGUAGE_CLUSTERS.length})
          </button>
          <button
            onClick={() => setActiveTab("indian")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "indian"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>🇮🇳 Indian Regional Core</span>
            <span className="rounded-full bg-black/30 px-1.5 py-0.5 text-[10px]">
              {indianDetected}/5
            </span>
          </button>
          <button
            onClick={() => setActiveTab("global")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "global"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>🌐 Global Enterprise</span>
            <span className="rounded-full bg-black/30 px-1.5 py-0.5 text-[10px]">
              {globalDetected}/5
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search language or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-black/80 py-1.5 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* DYNAMIC LOCALIZATION MATRIX GRID */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredResults.map((item) => {
          const isBaseline = item.lang.category === "baseline";
          return (
            <div
              key={item.lang.code}
              className={`relative flex flex-col justify-between rounded-xl border p-4 transition-all ${
                item.detected
                  ? "border-emerald-500/40 bg-emerald-950/20 shadow-[0_0_12px_rgba(16,185,129,0.08)]"
                  : isBaseline
                    ? "border-border bg-secondary/30"
                    : "border-amber-500/30 bg-amber-950/10"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl" role="img" aria-label={item.lang.name}>
                      {item.lang.flag}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-display text-sm font-bold text-foreground">
                          {item.lang.nativeName}
                        </span>
                        <span className="text-xs text-muted-foreground">({item.lang.name})</span>
                      </div>
                      <span className="font-sans font-medium text-[10px] uppercase text-muted-foreground">
                        Code: {item.lang.code}
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator Badge */}
                  {item.detected ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                      <Check className="h-3 w-3 text-emerald-400" />
                      Detected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                      <AlertTriangle className="h-3 w-3 text-amber-400" />
                      Missing
                    </span>
                  )}
                </div>

                {/* Signals / Evidence Detail */}
                <div className="mt-3 border-t border-border/50 pt-2.5 text-[11px]">
                  {item.detected ? (
                    <div className="space-y-1 text-emerald-300/90">
                      <p className="flex items-center gap-1 font-semibold text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> Compliance Signals Verified:
                      </p>
                      <ul className="list-disc space-y-0.5 pl-4 font-sans font-medium text-[10px] text-muted-foreground">
                        {item.matchedSignals.slice(0, 2).map((sig, idx) => (
                          <li key={idx}>{sig}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="space-y-1 text-muted-foreground">
                      <p className="font-medium text-amber-400/90">Statutory disclosure missing</p>
                      <p className="text-[10px]">
                        Target path:{" "}
                        <code className="text-foreground font-sans font-semibold">
                          /{item.lang.code}/privacy
                        </code>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Card Footer with Interactive Notice Generator Action */}
              <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-2 text-[10px] text-muted-foreground">
                <span className="capitalize">
                  {item.lang.category === "indian"
                    ? "🇮🇳 Indian Core"
                    : item.lang.category === "global"
                      ? "🌐 Global Core"
                      : "Baseline"}
                </span>

                <button
                  onClick={() => setSelectedNoticeLang(item.lang)}
                  className="flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
                >
                  <FileText className="h-3 w-3" />
                  {item.detected ? "View Notice" : "Generate Notice"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* STATUTORY NOTICE GENERATOR MODAL */}
      {selectedNoticeLang && activeNoticeTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-primary/40 bg-card p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl" role="img" aria-label={selectedNoticeLang.name}>
                  {selectedNoticeLang.flag}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-bold text-foreground">
                      {selectedNoticeLang.nativeName} ({selectedNoticeLang.name})
                    </h3>
                    <span className="rounded bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                      {activeNoticeTemplate.actName}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Auto-generated statutory privacy policy notice for{" "}
                    {report.target || "your domain"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedNoticeLang(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="my-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span>Statutory Draft Text:</span>
                <span className="font-sans font-semibold text-[10px] text-emerald-400">
                  ✓ Formatted for Web &amp; Mobile Integration
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto rounded-xl border border-border bg-black/80 p-4 font-sans text-xs leading-relaxed text-foreground">
                <p className="mb-2 font-bold text-primary">{activeNoticeTemplate.title}</p>
                <pre className="whitespace-pre-wrap font-sans text-xs text-muted-foreground">
                  {activeNoticeTemplate.text}
                </pre>
              </div>
            </div>

            {/* Footer / Revenue Generation CTAs */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border/60 pt-4">
              <button
                onClick={handleCopyNotice}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary/80 px-4 py-2 text-xs font-semibold text-foreground transition-all hover:bg-secondary"
              >
                {copiedNotice ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copiedNotice ? "Copied to Clipboard!" : "Copy Draft Text"}
              </button>

              <button
                onClick={() => {
                  setSelectedNoticeLang(null);
                  if (onOpenRemediationModal) onOpenRemediationModal();
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90"
              >
                <Sparkles className="h-4 w-4" />
                Export Certified 22-Language Bundle (1 Token)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
