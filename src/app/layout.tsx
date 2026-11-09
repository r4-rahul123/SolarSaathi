import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "SolarSaathi | Rooftop solar estimates",
  description:
    "Review an indicative rooftop solar system, price and payback estimate for homes in Nagpur and Vidarbha.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col font-sans transition-colors duration-200"
      >
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <Navbar />
              <AuthModal />
              <div className="flex-1">{children}</div>
              <SiteFooter />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
