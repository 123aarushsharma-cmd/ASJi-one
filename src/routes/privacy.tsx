import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — ASJi One Compliance Scanner" },
      {
        name: "description",
        content:
          "How ASJi One handles data: lawful bases, retention, transfers, subprocessors and your GDPR, DPDP, CCPA, LGPD and PIPL rights.",
      },
    ],
  }),
  component: () => (
    <LegalPage
      title="Privacy Policy"
      intro="This policy explains what the ASJi One scanner processes, why, on what lawful basis, and the rights you can exercise under the world's major data-protection regimes."
    >
      <LegalSection title="1. Data Controller & Contact">
        <p>
          {LEGAL.legalEntity} (operating {LEGAL.operator}) is the controller for personal data
          processed through this site. Privacy &amp; Data Protection Contact:{" "}
          <strong>{LEGAL.contactEmail}</strong>. Direct Phone:{" "}
          <strong>{LEGAL.phoneNumbers.join(" / ")}</strong>. India DPDP Grievance Officer:{" "}
          <strong>{LEGAL.grievanceOfficer}</strong>, {LEGAL.contactEmail}.
        </p>
      </LegalSection>

      <LegalSection title="2. What We Process & Retention">
        <p>
          Scan input and generated reports are processed transiently to produce your result and are
          not used to build a public database. Operational logs are kept only as long as needed for
          security and legal compliance, then securely purged.
        </p>
      </LegalSection>

      <LegalSection title="3. User Rights & Contact">
        <p>
          To exercise your rights under GDPR, India DPDP Act 2023, UAE PDPL or other regimes,
          contact <strong>{LEGAL.privacyEmail}</strong>.
        </p>
      </LegalSection>
    </LegalPage>
  ),
});
