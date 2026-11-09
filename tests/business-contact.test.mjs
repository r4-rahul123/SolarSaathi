import { describe, test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BUSINESS_CONTACT, getBusinessSupportMailto } from "../src/config/business.ts";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("Central SolarSaathi business contact", () => {
  test("official support identity and unavailable channels are centralized", () => {
    assert.equal(BUSINESS_CONTACT.businessName, "SolarSaathi");
    assert.equal(BUSINESS_CONTACT.supportEmail, "solarsaathi9@gmail.com");
    assert.equal(BUSINESS_CONTACT.phoneNumber, null);
    assert.equal(BUSINESS_CONTACT.phoneDisplay, "Not Available - Demo");
    assert.equal(BUSINESS_CONTACT.phoneSupportLabel, "Phone support currently unavailable - Demo");
    assert.equal(BUSINESS_CONTACT.whatsappUrl, null);
    assert.equal(BUSINESS_CONTACT.whatsappDisplay, "Coming Soon");
    assert.equal(BUSINESS_CONTACT.whatsappSupportLabel, "WhatsApp support - Coming Soon");
    assert.equal(BUSINESS_CONTACT.contactPerson, "SolarSaathi Support Team");
    assert.equal(BUSINESS_CONTACT.serviceArea, "Nagpur & Vidarbha");
  });

  test("support mailto targets the official email with an optional subject", () => {
    assert.equal(getBusinessSupportMailto(), "mailto:solarsaathi9@gmail.com");
    assert.equal(
      getBusinessSupportMailto("General enquiry"),
      "mailto:solarsaathi9@gmail.com?subject=General%20enquiry",
    );
  });

  test("footer, error support and quotation consume the central contact settings", () => {
    const requiredFiles = [
      "src/components/BusinessContactDetails.tsx",
      "src/components/SiteFooter.tsx",
      "src/components/SolarIntakeForm.tsx",
      "src/components/SolarQuotationDocument.tsx",
      "src/lib/mailer.ts",
    ];
    for (const relativePath of requiredFiles) {
      const source = fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
      assert.match(source, /BUSINESS_CONTACT|getBusinessSupportMailto|config\/business/, `${relativePath} should use centralized contact settings`);
    }

    const quotation = fs.readFileSync(path.join(projectRoot, "src/components/SolarQuotationDocument.tsx"), "utf8");
    for (const label of ["supportEmail", "phoneDisplay", "whatsappDisplay", "serviceArea", "contactPerson"]) {
      assert.ok(quotation.includes(`BUSINESS_CONTACT.${label}`), `PDF must read ${label} from central config`);
    }
    assert.match(quotation, /getBusinessSupportMailto\("Solar quotation enquiry"\)/);
  });

  test("obsolete business emails, demo domain and fake official contact are absent", () => {
    const sourceFiles = [
      "src/components/SiteFooter.tsx",
      "src/components/BusinessContactDetails.tsx",
      "src/components/SolarQuotationDocument.tsx",
      "src/lib/mailer.ts",
    ];
    const source = sourceFiles
      .map((relativePath) => fs.readFileSync(path.join(projectRoot, relativePath), "utf8"))
      .join("\n");
    for (const obsoleteValue of ["demo@solarsaathi.app", "support@solarsaathi.com", "solarsaathi.in", "+91 712 298 0000", "wa.me/"]) {
      assert.equal(source.includes(obsoleteValue), false, `obsolete contact reference remains: ${obsoleteValue}`);
    }
  });
});
