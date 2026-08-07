import type { Metadata } from "next";
import { LegalShell, LegalSection } from "@/components/layout/LegalShell";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of Manakrishi's website and drone spraying booking services.",
};

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" updated="July 2026">
      <p>
        These Terms govern your use of the Manakrishi website and your booking of drone spraying
        services provided by {SITE.legalName}. By booking a service, you agree to these Terms.
      </p>

      <LegalSection heading="Services">
        <p>
          Manakrishi connects farmers with certified drone operators for precision spraying of pesticides
          and fertilizers. Bookings are requests; a service is confirmed once our team contacts you to
          schedule it. Final pricing depends on crop, chemical and acreage and is shared at confirmation.
        </p>
      </LegalSection>

      <LegalSection heading="Your responsibilities">
        <p>
          You agree to provide accurate booking details and safe, lawful access to the field. You are
          responsible for ensuring the chemicals used are legal for your crop and for complying with local
          agricultural regulations. Please disclose any hazards, obstacles or restricted zones near the field.
        </p>
      </LegalSection>

      <LegalSection heading="Scheduling & weather">
        <p>
          Drone spraying depends on suitable weather and field conditions. Services may be rescheduled for
          safety (for example, high wind or rain). We will coordinate any changes with you directly.
        </p>
      </LegalSection>

      <LegalSection heading="Limitation of liability">
        <p>
          Services are provided with professional care. To the extent permitted by law, Manakrishi is not
          liable for indirect or consequential losses. Nothing in these Terms limits liability that cannot
          be excluded under applicable law.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Questions about these Terms? Email{" "}
          <a href={`mailto:${SITE.email}`} className="text-emerald hover:underline">
            {SITE.email}
          </a>{" "}
          or WhatsApp {SITE.phone}.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
