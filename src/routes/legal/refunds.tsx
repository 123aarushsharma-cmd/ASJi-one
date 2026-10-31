import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";

export const Route = createFileRoute("/legal/refunds")({
  head: () => ({
    meta: [
      { title: "Refund Policy — ASJi One Compliance & Licensing" },
      {
        name: "description",
        content:
          "Official Refund & Cancellation Policy for ASJi One enterprise licensing and autonomous remediation code patches under DPDP Act 2023.",
      },
    ],
  }),
  component: () => (
    <LegalPage
      title="Refund &amp; Cancellation Policy"
      intro="This policy outlines refund eligibility, payment processing, and request procedures for digital licensing and software remediation packages."
    >
      <LegalSection title="1. Digital Products & Instant License Release">
        <p>
          ASJi One provides instant digital access to executable code patches, statutory legal draft
          suites, and enterprise domain licenses upon payment confirmation. Due to the immediate
          release of unencrypted intellectual property, digital code downloads are generally
          non-refundable once unlocked.
        </p>
      </LegalSection>

      <LegalSection title="2. Duplicate or Erroneous Transactions">
        <p>
          If you experience a duplicate payment or submit an erroneous reference number, please
          notify us within 7 business days at <strong>{LEGAL.contactEmail}</strong> with your
          transaction reference (UTR) and invoice details.
        </p>
      </LegalSection>

      <LegalSection title="3. Processing & Disbursement SLA">
        <p>
          Eligible refunds will be credited back to the original source bank account / UPI VPA
          within 5 to 7 working days following administrative verification.
        </p>
      </LegalSection>

      <LegalSection title="4. Support & Grievance Contact">
        <p>
          For payment queries or licensing disputes, contact our financial support desk at{" "}
          <strong>{LEGAL.contactEmail}</strong> or call{" "}
          <strong>{LEGAL.phoneNumbers.join(" / ")}</strong>.
        </p>
      </LegalSection>
    </LegalPage>
  ),
});
