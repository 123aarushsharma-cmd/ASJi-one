import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";

export const Route = createFileRoute("/legal/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — ASJi One Compliance Scanner" },
      {
        name: "description",
        content:
          "How ASJi One handles the URLs and text you submit: lawful bases, retention, transfers, subprocessors and your GDPR, DPDP, CCPA, LGPD and PIPL rights.",
      },
      { property: "og:title", content: "Privacy Policy — ASJi One" },
      {
        property: "og:description",
        content:
          "Lawful bases, retention, international transfers and your privacy rights worldwide.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <LegalPage
      title="Privacy Policy"
      intro="This policy explains what the ASJi One scanner processes, why, on what lawful basis, and the rights you can exercise under the world’s major data-protection regimes."
    >
      <LegalSection title="1. Who is responsible">
        <p>
          {LEGAL.legalEntity} is the controller for personal data processed through this site.
          Privacy contact: <strong>{LEGAL.privacyEmail}</strong>. India DPDP grievance contact:{" "}
          <strong>{LEGAL.grievanceOfficer}</strong>, {LEGAL.privacyEmail}.
        </p>
      </LegalSection>

      <LegalSection title="2. What we process">
        <ul className="space-y-1">
          <li>
            <strong>Scan input</strong> — the URL or infrastructure text you submit. Do not paste
            secrets, credentials, or personal data about other people.
          </li>
          <li>
            <strong>Scan output</strong> — the evidence dossier collected from the public target and
            the generated report.
          </li>
          <li>
            <strong>Technical data</strong> — request metadata such as IP address, user agent and
            timestamps, processed for security, abuse prevention and service reliability.
          </li>
        </ul>
        <p>
          We do not sell or share personal information for cross-context behavioural advertising,
          and we do not knowingly process data of children under 16 (under 18 where DPDP applies).
        </p>
      </LegalSection>

      <LegalSection title="3. Lawful bases">
        <ul className="space-y-1">
          <li>
            <strong>Contract</strong> (GDPR Art. 6(1)(b)) — running the scan you requested.
          </li>
          <li>
            <strong>Legitimate interests</strong> (Art. 6(1)(f)) — service security, abuse
            prevention and improvement, balanced against your rights.
          </li>
          <li>
            <strong>Consent</strong> (Art. 6(1)(a); DPDP s. 6) — for any optional cookie or
            analytics use, and withdrawable at any time.
          </li>
          <li>
            <strong>Legal obligation</strong> (Art. 6(1)(c)) — where retention or disclosure is
            required by law.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Retention">
        <p>
          Scan input and generated reports are processed transiently to produce your result and are
          not used to build a public database of scanned entities. Operational logs are kept only as
          long as needed for security and legal purposes, then deleted or anonymised.
        </p>
      </LegalSection>

      <LegalSection title="5. Processors and international transfers">
        <p>
          To deliver the service we use hosting/CDN infrastructure and an AI model provider, which
          may process data outside your country. Transfers rely on appropriate safeguards such as
          the EU Standard Contractual Clauses, the UK IDTA/Addendum, and equivalent contractual
          measures for other regimes. A current subprocessor list is available on request from{" "}
          <strong>{LEGAL.privacyEmail}</strong>.
        </p>
      </LegalSection>

      <LegalSection title="6. Your rights">
        <p>
          Depending on where you live, you may have rights to access, rectification, erasure,
          restriction, portability, objection, withdrawal of consent, non-discrimination for
          exercising rights, and to nominate another person (DPDP s. 14). These rights arise under
          the{" "}
          <strong>
            GDPR / UK GDPR, India DPDP Act 2023, CCPA/CPRA, PIPEDA, LGPD, PDPA (SG/TH), POPIA, PIPL
            and the Australian Privacy Act
          </strong>
          , among others.
        </p>
        <p>
          Contact <strong>{LEGAL.privacyEmail}</strong> to exercise a right; we respond within the
          statutory deadline applicable to you. You may also complain to your supervisory authority
          — for example your EU/EEA DPA, the UK ICO, or the Data Protection Board of India.
        </p>
      </LegalSection>

      <LegalSection title="7. Security and breach handling">
        <p>
          We apply technical and organisational measures appropriate to the risk (GDPR Art. 32; DPDP
          s. 8(5)), including encryption in transit and least-privilege access. Report a suspected
          vulnerability to <strong>{LEGAL.securityEmail}</strong>. Where a notifiable personal-data
          breach occurs, we notify the competent authority and affected people within the timeframes
          the applicable law requires.
        </p>
      </LegalSection>

      <LegalSection title="8. Automated processing">
        <p>
          Reports are produced with AI assistance. They are informational only and are not used to
          make legal or similarly significant automated decisions about you. You can always request
          human review by writing to <strong>{LEGAL.privacyEmail}</strong>.
        </p>
      </LegalSection>
    </LegalPage>
  ),
});
