"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language } from "@/types/solar";

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    brandName: "SolarSaathi",
    tagline: "AI-Powered Rooftop Solar Sales & Project Management",
    region: "Nagpur & Vidarbha Clean Energy",
    getQuote: "Get Solar Quote",
    trackProject: "Track Project",
    staffCrm: "Staff CRM",
    pmBanner: "Get up to ₹78,000 Direct Bank Subsidy on Vidarbha Rooftops.",
    heroTitle: "Switch to Solar in Nagpur.",
    heroSubtitle: "Save up to ₹78,000 with PM Surya Ghar Subsidy.",
    heroDescription:
      "Upload your MSEDCL electricity bill or enter monthly units. Our AI calculates your recommended system capacity, qualifies rooftop feasibility, and delivers an instant same-day quote.",
    owner: "House Owner",
    tenant: "Tenant / Rented",
    uploadBill: "Upload MSEDCL Bill Photo or PDF",
    subsidy: "Govt Subsidy (DBT)",
    netCost: "Net Cost To You",
    payback: "Payback Period",
    years: "Years",
    annualGen: "Annual Generation",
    lifetimeSavings: "25-Yr Net Profit",
    downloadPdf: "Download PDF Quote",
    trackStatus: "Live Project Milestone Tracker",
  },
  mr: {
    brandName: "सोलर साथी (SolarSaathi)",
    tagline: "एआय-सक्षम रूफटॉप सोलर आणि प्रकल्प व्यवस्थापन",
    region: "नागपूर आणि विदर्भ स्वच्छ ऊर्जा",
    getQuote: "सोलर कोट मिळवा",
    trackProject: "प्रकल्प ट्रॅक करा",
    staffCrm: "कर्मचारी सीआरएम",
    pmBanner: "विदर्भातील छतांवर ₹78,000 थेट बँक सबसिडी मिळवा.",
    heroTitle: "नागपुरात सोलरवर या.",
    heroSubtitle: "पीएम सूर्य घर सबसिडीसह ₹78,000 पर्यंत बचत करा.",
    heroDescription:
      "आपले महावितरण वीज बिल अपलोड करा. आमचे AI आपली शिफारस केलेली सोलर क्षमता मोजेल, छताची पात्रता तपासेल आणि तात्काळ कोटेशन देईल.",
    owner: "घराचे मालक",
    tenant: "भाडेकरू",
    uploadBill: "महावितरण वीज बिल अपलोड करा (फोटो/PDF)",
    subsidy: "शासकीय सबसिडी (DBT)",
    netCost: "आपली एकूण निव्वळ किंमत",
    payback: "परतावा कालावधी",
    years: "वर्षे",
    annualGen: "वार्षिक वीज निर्मिती",
    lifetimeSavings: "२५ वर्षांचा नफा",
    downloadPdf: "कोटेशन PDF डाउनलोड करा",
    trackStatus: "थेट प्रकल्प प्रगती ट्रॅकर",
  },
  hi: {
    brandName: "सोलर साथी (SolarSaathi)",
    tagline: "एआई-संचालित रूफटॉप सोलर एवं प्रोजेक्ट मैनेजमेंट",
    region: "नागपुर एवं विदर्भ क्लीन एनर्जी",
    getQuote: "सोलर कोट प्राप्त करें",
    trackProject: "प्रोजेक्ट ट्रैक करें",
    staffCrm: "स्टाफ सीआरएम",
    pmBanner: "विदर्भ की छतों पर ₹78,000 तक सीधी बैंक सब्सिडी प्राप्त करें।",
    heroTitle: "नागपुर में सोलर अपनाएं।",
    heroSubtitle: "पीएम सूर्य घर योजना से ₹78,000 तक की बचत करें।",
    heroDescription:
      "अपना एमएसईडीसीएल बिजली बिल अपलोड करें। हमारा एआई आपकी सौर क्षमता, छत की पात्रता की गणना करेगा और तत्काल कोटेशन प्रदान करेगा।",
    owner: "मकान मालिक",
    tenant: "किरायेदार",
    uploadBill: "एमएसईडीसीएल बिजली बिल अपलोड करें (फोटो/PDF)",
    subsidy: "सरकारी सब्सिडी (DBT)",
    netCost: "आपको देय शुद्ध लागत",
    payback: "पेबैक अवधि",
    years: "वर्ष",
    annualGen: "वार्षिक उत्पादन",
    lifetimeSavings: "25-वर्ष का कुल लाभ",
    downloadPdf: "कोटेशन PDF डाउनलोड करें",
    trackStatus: "लाइव प्रोजेक्ट माइलस्टोन ट्रैकर",
  },
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("solarsaathi-lang") as Language | null;
    if (saved && (saved === "en" || saved === "mr" || saved === "hi")) {
      setLang(saved);
    }
  }, []);

  const handleSetLang = (l: Language) => {
    setLang(l);
    localStorage.setItem("solarsaathi-lang", l);
  };

  const t = (key: string): string => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
