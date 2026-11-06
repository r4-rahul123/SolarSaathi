import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { SolarSaathiLogo } from "@/components/SolarSaathiLogo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
              <main className="flex-1">{children}</main>
              <footer className="bg-[#123D2B] dark:bg-[#06150F] text-slate-300 text-xs py-8 border-t border-emerald-950/60 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    <span className="inline-flex items-center gap-2"><SolarSaathiLogo size="sm" inverse withName /><span className="text-sm">(सोलर साथी)</span></span> • Nagpur & Vidarbha, Maharashtra
                    <p className="text-xs text-emerald-200/70 mt-1">
                      Solar estimates for homes in Nagpur and Vidarbha.
                    </p>
                  </div>
                  <div className="flex gap-4 text-xs font-medium">
                    <span className="text-emerald-200/80">Final design and savings depend on site survey and current scheme rules.</span>
                  </div>
                </div>
              </footer>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
