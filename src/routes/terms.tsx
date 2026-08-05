import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — ASJi One Compliance Scanner" },
      {
        name: "description",
        content: "Terms and conditions for using the ASJi One compliance scanning platform.",
      },
    ],
  }),
  component: () => (
    <LegalPage
      title="Terms of Service"
      intro="Terms governing the access and usage of the ASJi One scanning platform."
    >
      <LegalSection title="1. Permitted Usage">
        <p>
          You agree to submit only public web endpoints or infrastructure text you own or are
          authorized to evaluate. Do not submit sensitive personal credentials or unauthorized
          system endpoints.
        </p>
      </LegalSection>

      <LegalSection title="2. Disclaimer & Legal Advice">
        <p>
          ASJi One provides automated evidence scoring and technical assessment reports for
          informational and gap analysis purposes. It does not constitute formal legal counsel.
          Contact <strong>{LEGAL.contactEmail}</strong> for formal compliance inquiries.
        </p>
      </LegalSection>
    </LegalPage>
  ),
});
