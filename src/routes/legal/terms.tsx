import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/LegalPage";
import { AUTHORISATION_NOTICE, LEGAL, NOT_LEGAL_ADVICE } from "@/lib/legal";

export const Route = createFileRoute("/legal/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — ASJi One Compliance Scanner" },
      {
        name: "description",
        content:
          "The contract governing use of the ASJi One compliance scanner: licence, authorised scanning, AI output limits, liability caps and termination.",
      },
      { property: "og:title", content: "Terms of Service — ASJi One" },
      {
        property: "og:description",
        content:
          "Licence, authorised scanning rules, liability limits and termination for ASJi One.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <LegalPage
      title="Terms of Service"
      intro="These Terms form a binding agreement between you and the Operator and govern every use of the ASJi One scanner and any report it produces."
    >
      <LegalSection title="1. Acceptance">
        <p>
          By submitting a URL or infrastructure description, you accept these Terms, the Acceptable
          Use Policy, the Privacy Policy and the Legal Disclaimer. If you use the service for an
          organisation, you confirm you are authorised to bind it. If you do not accept, do not use
          the service.
        </p>
      </LegalSection>

      <LegalSection title="2. Licence and permitted use">
        <p>
          The Operator grants you a limited, revocable, non-exclusive, non-transferable licence to
          use the service and to use reports internally for your own compliance work. You may not
          resell, white-label, scrape, reverse-engineer, benchmark for a competing product, or
          present a report as an independent certification.
        </p>
      </LegalSection>

      <LegalSection title="3. Authorised targets only">
        <p>{AUTHORISATION_NOTICE}</p>
        <p>
          You warrant that each submission is a system you own or are authorised to assess, and you
          indemnify the Operator against any claim arising from an unauthorised submission.
        </p>
      </LegalSection>

      <LegalSection title="4. Nature of the output">
        <p>{NOT_LEGAL_ADVICE}</p>
        <p>
          Scores, framework grades, “critical leaks” and fine estimates are heuristic modelling of
          publicly observable signals and statutory maxima. They may be incomplete, out of date or
          wrong. You are solely responsible for verifying findings before you act on them.
        </p>
      </LegalSection>

      <LegalSection title="5. No warranty">
        <p>
          The service is provided <strong>“as is” and “as available”</strong>, without warranty of
          any kind, express or implied, including merchantability, fitness for a particular purpose,
          accuracy, non-infringement and uninterrupted availability, to the maximum extent permitted
          by applicable law.
        </p>
      </LegalSection>

      <LegalSection title="6. Limitation of liability">
        <p>
          To the maximum extent permitted by law, the Operator is not liable for indirect,
          incidental, special, consequential or punitive damages, nor for lost profits, lost data,
          regulatory fines, enforcement action or reputational harm arising from use of, or reliance
          on, the service.
        </p>
        <p>
          The Operator’s total aggregate liability for all claims is limited to the greater of (a)
          the fees you paid for the service in the three months before the claim, or (b) USD 100.
          Nothing in these Terms excludes liability that cannot lawfully be excluded, including for
          fraud, death or personal injury caused by negligence, or rights that consumers hold under
          mandatory local law.
        </p>
      </LegalSection>

      <LegalSection title="7. Third-party services and AI processing">
        <p>
          Reports are generated with the help of third-party AI infrastructure and live HTTP
          requests to the target you supply. The Operator does not control third-party model
          behaviour and is not responsible for third-party outages, errors or changes.
        </p>
      </LegalSection>

      <LegalSection title="8. Suspension and termination">
        <p>
          The Operator may suspend or terminate access at any time, without notice, for suspected
          abuse, unauthorised scanning, excessive load or unlawful use. Sections 3–6, 9 and 10
          survive termination.
        </p>
      </LegalSection>

      <LegalSection title="9. Governing law and disputes">
        <p>
          These Terms are governed by the laws of {LEGAL.governingLaw}, without regard to conflict
          of law rules, and the courts of that jurisdiction have exclusive jurisdiction — except
          where mandatory consumer-protection law in your country of residence gives you the right
          to bring proceedings locally.
        </p>
      </LegalSection>

      <LegalSection title="10. Changes and contact">
        <p>
          The Operator may update these Terms; material changes will be reflected in the “last
          updated” date. Questions: <strong>{LEGAL.contactEmail}</strong>.
        </p>
      </LegalSection>
    </LegalPage>
  ),
});
