"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language } from "@/types/solar";

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    brandName: "SolarSaathi",
    tagline: "Residential rooftop solar estimates",
    region: "Rooftop solar • Nagpur & Vidarbha",
    getQuote: "Get Solar Quote",
    trackProject: "Track Project",
    staffCrm: "Staff CRM",
    pmBanner: "Explore a rooftop solar estimate for your home.",
    heroTitle: "Explore solar for your rooftop.",
    heroSubtitle: "A clear estimate, based on your home.",
    heroDescription:
      "Share a few details about your roof and electricity use. Review an indicative system size, cost and payback estimate before arranging a site visit.",
    estimateNote: "Figures are indicative. Final system design, price and any subsidy depend on a site survey and current eligibility rules.",
    photoCaption: "Solar panels on a residential rooftop",
    photoLocation: "Illustrative image",
    illustrativePhoto: "Illustrative",
    howItWorksEyebrow: "What to expect",
    howItWorksTitle: "Three steps to an initial estimate",
    processStepOneTitle: "Share your details",
    processStepOneText: "Tell us about the property, roof and electricity bill.",
    processStepTwoTitle: "Review bill details",
    processStepTwoText: "Check the values read from your bill and correct anything that looks wrong.",
    processStepThreeTitle: "Compare your options",
    processStepThreeText: "See indicative system sizes, estimated cost, subsidy and payback in one place.",
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
    trackStatus: "Project milestone tracker",
  },
  mr: {
    brandName: "सोलर साथी (SolarSaathi)",
    tagline: "घरांसाठी छतावरील सोलरचा अंदाज",
    region: "रूफटॉप सोलर • नागपूर आणि विदर्भ",
    getQuote: "सोलर कोट मिळवा",
    trackProject: "प्रकल्प ट्रॅक करा",
    staffCrm: "कर्मचारी सीआरएम",
    pmBanner: "आपल्या घरासाठी छतावरील सोलरचा अंदाज पाहा.",
    heroTitle: "तुमच्या छतासाठी सोलरचा विचार करा.",
    heroSubtitle: "तुमच्या घरावर आधारित स्पष्ट अंदाज.",
    heroDescription:
      "घर, छत आणि वीज वापराची थोडी माहिती द्या. साइट भेट ठरवण्यापूर्वी सिस्टम, खर्च आणि परतफेडीचा अंदाज पाहा.",
    estimateNote: "हे अंदाज आहेत. अंतिम सिस्टम, किंमत आणि सबसिडी साइट सर्वेक्षण व सध्याच्या पात्रता नियमांवर अवलंबून आहेत.",
    photoCaption: "घराच्या छतावरील सोलर पॅनेल",
    photoLocation: "दर्शक छायाचित्र",
    illustrativePhoto: "दर्शक",
    howItWorksEyebrow: "पुढे काय",
    howItWorksTitle: "प्राथमिक अंदाजासाठी तीन टप्पे",
    processStepOneTitle: "माहिती द्या",
    processStepOneText: "घर, छत आणि वीजबिलाची माहिती द्या.",
    processStepTwoTitle: "बिल तपासा",
    processStepTwoText: "बिलातून वाचलेले तपशील तपासा आणि गरज असल्यास दुरुस्त करा.",
    processStepThreeTitle: "पर्याय पाहा",
    processStepThreeText: "सिस्टमचा आकार, अंदाजित खर्च, सबसिडी आणि परतफेड एकत्र पाहा.",
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
    tagline: "घरों के लिए रूफटॉप सोलर का अनुमान",
    region: "नागपुर एवं विदर्भ क्लीन एनर्जी",
    getQuote: "सोलर कोट प्राप्त करें",
    trackProject: "प्रोजेक्ट ट्रैक करें",
    staffCrm: "स्टाफ सीआरएम",
    pmBanner: "विदर्भ में अपने घर के लिए सोलर अनुमान देखें।",
    heroTitle: "अपनी छत के लिए सोलर समझें।",
    heroSubtitle: "आपके घर पर आधारित एक स्पष्ट अनुमान।",
    heroDescription:
      "घर, छत और बिजली के उपयोग की कुछ जानकारी दें। साइट विज़िट तय करने से पहले सिस्टम, लागत और पेबैक का अनुमान देखें।",
    estimateNote: "ये अनुमानित आंकड़े हैं। अंतिम सिस्टम, कीमत और सब्सिडी साइट सर्वे और मौजूदा पात्रता नियमों पर निर्भर हैं।",
    photoCaption: "घर की छत पर सोलर पैनल",
    photoLocation: "उदाहरण के लिए तस्वीर",
    illustrativePhoto: "उदाहरण",
    howItWorksEyebrow: "आगे क्या होगा",
    howItWorksTitle: "शुरुआती अनुमान के तीन चरण",
    processStepOneTitle: "जानकारी साझा करें",
    processStepOneText: "घर, छत और बिजली बिल की जानकारी दें।",
    processStepTwoTitle: "बिल की जानकारी जांचें",
    processStepTwoText: "बिल से पढ़े गए आंकड़े देखें और गलत होने पर सुधारें।",
    processStepThreeTitle: "विकल्पों की तुलना करें",
    processStepThreeText: "सिस्टम क्षमता, अनुमानित लागत, सब्सिडी और पेबैक साथ में देखें।",
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
