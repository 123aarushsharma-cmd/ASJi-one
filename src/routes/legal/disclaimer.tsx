import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/LegalPage";
import { LEGAL, NOT_LEGAL_ADVICE } from "@/lib/legal";

export const Route = createFileRoute("/legal/disclaimer")({
  head: () => ({
    meta: [
      { title: "Legal & Assessment Disclaimer — ASJi One" },
      {
        name: "description",
        content:
          "Overview of technical audit scope, analytical methodology, and operational guidance for ASJi One compliance reports.",
      },
      { property: "og:title", content: "Legal & Assessment Disclaimer — ASJi One" },
      {
        property: "og:description",
        content:
          "Operational scope, technical methodology, and compliance guidance for ASJi One reports.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <LegalPage
      title="Legal & Assessment Disclaimer"
      intro="Overview of technical audit scope, analytical methodology, and operational guidance for ASJi One compliance reports."
    >
      <LegalSection title="1. Purpose & Analytical Scope">
        <p>
          ASJi One provides automated, non-invasive technical assessments of public domain web
          properties and technical metadata. Findings offer high-density insights into privacy
          parameters, header security, cookie configurations, and regulatory alignment under
          frameworks such as GDPR and India’s DPDP Act 2023.
        </p>
      </LegalSection>

      <LegalSection title="2. Complementary Compliance Process">
        <p>
          Automated findings serve as diagnostic technical intelligence for engineering and data
          protection teams. To achieve complete organizational compliance, automated reports should
          be evaluated alongside your internal governance policies, architectural safeguards, and
          legal counsel reviews.
        </p>
      </LegalSection>

      <LegalSection title="3. Non-Intrusive Technical Inspection">
        <ul className="space-y-1.5 text-muted-foreground">
          <li>
            Assessment is conducted via passive, public HTTP requests to target domain endpoints.
          </li>
          <li>
            Scans observe publicly served headers, security parameters, and landing metadata without
            accessing internal infrastructure or authenticated user sessions.
          </li>
          <li>Findings capture real-time technical states at the timestamp of assessment.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Statutory Exposure & Risk Modeling">
        <p>
          Financial risk indicators and score ratings represent benchmark modeling calculated from
          published statutory thresholds (such as GDPR Article 83 or DPDP Act 2023 Schedule
          provisions). These figures illustrate potential regulatory exposure to assist
          organizations in prioritizing remediation tasks.
        </p>
      </LegalSection>

      <LegalSection title="5. Vendor & Asset References">
        <p>
          Trademarks, domain names, and technical vendor signatures identified during scans are
          referenced purely for technical classification and transparency.
        </p>
      </LegalSection>

      <LegalSection title="6. Support & Inquiries">
        <p>
          For questions regarding audit methodology or legal documentation, reach out directly to
          our compliance team at <strong>{LEGAL.contactEmail}</strong>.
        </p>
      </LegalSection>
    </LegalPage>
  ),
});
