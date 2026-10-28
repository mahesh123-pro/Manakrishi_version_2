import type { Metadata } from "next";
import { LegalShell, LegalSection } from "@/components/layout/LegalShell";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Manakrishi collects, uses and protects the information you share when booking drone spraying services.",
};

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="July 2026">
      <p>
        This Privacy Policy explains how {SITE.legalName} (&ldquo;Manakrishi&rdquo;, &ldquo;we&rdquo;,
        &ldquo;us&rdquo;) collects, uses and safeguards your information when you use our website and
        book drone spraying services.
      </p>

      <LegalSection heading="Information we collect">
        <p>
          When you book a service or contact us, we collect the details you provide: your name, mobile
          number, village/location, preferred date, crop type and field size (acres). We do not collect
          payment card details on this website.
        </p>
      </LegalSection>

      <LegalSection heading="How we use your information">
        <p>
          We use your details solely to schedule and deliver your drone spraying service, to assign a
          certified operator, and to contact you (typically over WhatsApp or phone) to confirm and
          coordinate the booking. We may use aggregated, non-identifying data to improve our services.
        </p>
      </LegalSection>

      <LegalSection heading="How we store it">
        <p>
          Booking details are stored securely in our operations systems and are accessible only to
          authorised Manakrishi staff and assigned operators. We retain booking records for as long as
          needed to provide the service and meet legal obligations.
        </p>
      </LegalSection>

      <LegalSection heading="Sharing">
        <p>
          We do not sell your personal information. We share your booking details only with the certified
          drone operator assigned to your field, and with service providers that help us operate (for
          example, messaging and record-keeping tools), strictly to fulfil your booking.
        </p>
      </LegalSection>

      <LegalSection heading="Marketplace and FPO access">
        <p>
          Marketplace account details are used to support crop listings and buyer-seller connections.
          Accounts that an administrator enables for an FPO may view active farmer and buyer names,
          sign-in email addresses, locations, published crop listings and business phone numbers that
          members chose to share publicly. FPO access does not include passwords, private order details,
          or account-management controls.
        </p>
        <p>
          Mobile sign-in uses your name and verified phone number. Google/Firebase sends a verification
          SMS and processes the number for authentication and abuse prevention. Your sign-in phone
          number is private unless you separately choose to publish it as a business contact.
        </p>
      </LegalSection>

      <LegalSection heading="Your choices">
        <p>
          You may request access to, correction of, or deletion of your personal information at any time
          by contacting us at{" "}
          <a href={`mailto:${SITE.email}`} className="text-emerald hover:underline">
            {SITE.email}
          </a>{" "}
          or on WhatsApp at {SITE.phone}.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          {SITE.legalName}, {SITE.address}. Email:{" "}
          <a href={`mailto:${SITE.email}`} className="text-emerald hover:underline">
            {SITE.email}
          </a>
          .
        </p>
      </LegalSection>
    </LegalShell>
  );
}
