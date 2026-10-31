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
          "Lawful bases, data minimization, 12-month retention policy, Google/Firebase & Vercel processors, and DPDP Act 2023 / GDPR rights.",
      },
    ],
  }),
  component: () => (
    <LegalPage
      title="Privacy Policy"
      intro="This policy explains what personal data ASJi One collects, the purpose, retention, third-party processors, and your statutory rights under the India DPDP Act 2023 (and DPDP Rules, 2025) and EU GDPR."
    >
      <LegalSection title="1. Who is Responsible">
        <p>
          {LEGAL.legalEntity} (operating {LEGAL.operator}) is the Data Fiduciary / Controller for
          personal data processed through this platform. Privacy &amp; Data Protection Contact:{" "}
          <strong>{LEGAL.contactEmail}</strong>. Direct Phone:{" "}
          <strong>{LEGAL.phoneNumbers.join(" / ")}</strong>.
        </p>
      </LegalSection>

      <LegalSection title="2. Data Minimization — What We Collect & Why">
        <p>
          In strict compliance with data minimization principles, we collect only necessary
          attributes required to conduct requested website audits and maintain secure accounts:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>
            <strong>Account Credentials:</strong> Name and Email address (when signing up or logging
            in).
          </li>
          <li>
            <strong>Target Website URL:</strong> The domain submitted for compliance scanning.
          </li>
          <li>
            <strong>Consent Records:</strong> Affirmative consent timestamp, policy version, and
            user ID.
          </li>
        </ul>
        <p className="mt-2">
          We do NOT collect unnecessary personal attributes, financial passwords, or sensitive
          personal data.
        </p>
      </LegalSection>

      <LegalSection title="3. Third-Party Data Processors">
        <p>
          To operate secure infrastructure, personal data is processed by trusted infrastructure
          sub-processors under strict confidentiality and security terms:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          {LEGAL.dataProcessors.map((proc, idx) => (
            <li key={idx}>
              <strong>{proc.name}:</strong> {proc.purpose}
            </li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title="4. Retention Policy & Auto-Deletion">
        <p>
          {LEGAL.retentionPolicy} Users may also execute immediate on-demand account and data
          deletion at any time directly through their Private Sovereign Vault dashboard.
        </p>
      </LegalSection>

      <LegalSection title="5. Your Statutory Rights (DPDP Act 2023 & GDPR)">
        <p>
          Under the Digital Personal Data Protection Act, 2023 and EU GDPR, you have guaranteed
          statutory rights:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>
            <strong>Right to Access & Summary:</strong> Request a full copy of processed personal
            data via the 'Download My Data (JSON)' button.
          </li>
          <li>
            <strong>Right to Correction & Erasure:</strong> Request correction or complete deletion
            of your account and audit history.
          </li>
          <li>
            <strong>Right to Withdraw Consent:</strong> Revoke processing consent at any time
            without affecting prior lawful processing.
          </li>
          <li>
            <strong>Right to Grievance Redressal:</strong> Submit grievances to our designated
            Grievance Officer.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Designated Grievance Officer Section">
        <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-2 font-mono text-xs text-foreground">
          <p className="font-bold text-sm text-gold-gradient">
            Statutory Grievance Redressal Officer
          </p>
          <p>
            <strong>Officer Name:</strong> {LEGAL.grievanceOfficer.name}
          </p>
          <p>
            <strong>Entity:</strong> {LEGAL.grievanceOfficer.entity}
          </p>
          <p>
            <strong>Email Endpoint:</strong>{" "}
            <a href={`mailto:${LEGAL.grievanceOfficer.email}`} className="text-primary underline">
              {LEGAL.grievanceOfficer.email}
            </a>
          </p>
          <p>
            <strong>Statutory SLA:</strong> {LEGAL.grievanceOfficer.sla}
          </p>
        </div>
      </LegalSection>
    </LegalPage>
  ),
});
