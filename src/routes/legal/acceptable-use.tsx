import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/LegalPage";
import { AUTHORISATION_NOTICE, LEGAL } from "@/lib/legal";

export const Route = createFileRoute("/legal/acceptable-use")({
  head: () => ({
    meta: [
      { title: "Acceptable Use Policy — ASJi One Scanner" },
      {
        name: "description",
        content:
          "Rules for lawful scanning with ASJi One: authorised targets only, no intrusive testing, no unlawful or abusive use, and enforcement.",
      },
      { property: "og:title", content: "Acceptable Use Policy — ASJi One" },
      {
        property: "og:description",
        content:
          "Authorised targets only, passive requests, and zero tolerance for abusive scanning.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <LegalPage
      title="Acceptable Use Policy"
      intro="Scanning tools can be misused. These rules keep ASJi One lawful for you and for the sites it touches, and they are part of the Terms of Service."
    >
      <LegalSection title="1. Authorisation">
        <p>{AUTHORISATION_NOTICE}</p>
      </LegalSection>

      <LegalSection title="2. What the scanner does">
        <p>
          A scan makes a small number of <strong>unauthenticated GET requests</strong> to the public
          landing page and well-known endpoints (<code>/robots.txt</code>,{" "}
          <code>/.well-known/security.txt</code>). It does not log in, submit forms, brute-force,
          fuzz, exploit, alter data, or attempt to bypass any access control.
        </p>
      </LegalSection>

      <LegalSection title="3. Prohibited conduct">
        <ul className="space-y-1">
          <li>Scanning systems you do not own or are not authorised to assess.</li>
          <li>Using output to attack, extort, defame or publicly shame a third party.</li>
          <li>Automated bulk scanning, load generation or denial-of-service style abuse.</li>
          <li>
            Submitting credentials, secrets, health, financial or other sensitive personal data.
          </li>
          <li>Presenting a report as a certification, audit opinion or legal advice.</li>
          <li>Any use that breaches computer-misuse, sanctions, export-control or privacy law.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Rate limits and fair use">
        <p>
          Access may be rate-limited or suspended to protect the service and scanned third parties.
          Repeated or automated abuse results in permanent termination without refund.
        </p>
      </LegalSection>

      <LegalSection title="5. Reporting abuse">
        <p>
          If you believe your systems were scanned without authorisation, contact{" "}
          <strong>{LEGAL.securityEmail}</strong> with the timestamp and hostname and we will
          investigate and, where appropriate, block the source.
        </p>
      </LegalSection>
    </LegalPage>
  ),
});
