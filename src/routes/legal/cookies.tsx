import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";

export const Route = createFileRoute("/legal/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Notice — ASJi One Compliance Scanner" },
      {
        name: "description",
        content:
          "Which cookies and local storage ASJi One uses, why they are strictly necessary, and how ePrivacy and DPDP consent rules apply.",
      },
      { property: "og:title", content: "Cookie Notice — ASJi One" },
      {
        property: "og:description",
        content: "Strictly necessary storage only — no advertising or cross-site tracking cookies.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <LegalPage
      title="Cookie Notice"
      intro="What this site stores on your device, and the consent rules that apply under ePrivacy Directive Art. 5(3), GDPR and comparable regimes."
    >
      <LegalSection title="1. What we store">
        <p>
          The scanner is designed to run with <strong>strictly necessary storage only</strong>: what
          the app needs to keep your session working and to protect against abuse. We do not set
          advertising, profiling or cross-site tracking cookies, and we do not embed third-party
          marketing pixels on this site.
        </p>
      </LegalSection>

      <LegalSection title="2. Consent">
        <p>
          Strictly necessary storage is exempt from prior consent under ePrivacy Art. 5(3). If we
          ever add analytics or any non-essential storage, it will be loaded only after you give
          affirmative, granular, freely given consent — and refusing will be as easy as accepting.
        </p>
      </LegalSection>

      <LegalSection title="3. Cookies on scanned websites">
        <p>
          During a scan we observe cookies that the <em>target website</em> sets in its own HTTP
          response. Those cookies belong to that website’s operator, are recorded only as audit
          evidence, and are never placed on your device by us.
        </p>
      </LegalSection>

      <LegalSection title="4. Controls and contact">
        <p>
          You can clear or block storage in your browser settings at any time; blocking essential
          storage may break parts of the scanner. Questions: <strong>{LEGAL.privacyEmail}</strong>.
        </p>
      </LegalSection>
    </LegalPage>
  ),
});
