import { BUSINESS_CONTACT, getBusinessSupportMailto } from "@/config/business";

interface BusinessContactDetailsProps {
  subject?: string;
}

export function BusinessContactDetails({
  subject = "General enquiry",
}: BusinessContactDetailsProps) {
  return (
    <section aria-label="Business contact and support" className="space-y-3">
      <div>
        <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-200">
          Contact &amp; support
        </h2>
        <p className="mt-2 text-sm font-semibold text-white">{BUSINESS_CONTACT.contactPerson}</p>
        <p className="text-xs text-slate-400">Service area: {BUSINESS_CONTACT.serviceArea}</p>
      </div>
      <a
        data-testid="business-support-email"
        href={getBusinessSupportMailto(subject)}
        className="inline-flex rounded-sm text-sm font-semibold text-emerald-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
      >
        Email {BUSINESS_CONTACT.businessName}: {BUSINESS_CONTACT.supportEmail}
      </a>
      <div className="space-y-1 text-xs leading-5 text-slate-300">
        <p>{BUSINESS_CONTACT.phoneSupportLabel}</p>
        <p>{BUSINESS_CONTACT.whatsappSupportLabel}</p>
      </div>
    </section>
  );
}
