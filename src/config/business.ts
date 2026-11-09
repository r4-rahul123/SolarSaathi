export const BUSINESS_CONTACT = {
  businessName: "SolarSaathi",
  supportHeading: "SolarSaathi Demo Support",
  supportEmail: "solarsaathi9@gmail.com",
  phoneNumber: null,
  phoneDisplay: "Not Available - Demo",
  phoneSupportLabel: "Phone support currently unavailable - Demo",
  whatsappUrl: null,
  whatsappDisplay: "Coming Soon",
  whatsappSupportLabel: "WhatsApp support - Coming Soon",
  contactPerson: "SolarSaathi Support Team",
  serviceArea: "Nagpur & Vidarbha",
} as const;

export function getBusinessSupportMailto(subject?: string): string {
  const href = `mailto:${BUSINESS_CONTACT.supportEmail}`;
  return subject ? `${href}?subject=${encodeURIComponent(subject)}` : href;
}
