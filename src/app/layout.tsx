import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { AuthModal } from "@/components/AuthModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SolarSaathi | AI-Powered Rooftop Solar Sales & Project Management",
  description:
    "AI-powered rooftop solar qualification, instant PM Surya Ghar subsidy calculations, and real-time project milestone tracking for Nagpur and Vidarbha.",
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
                    <span className="font-bold text-white text-sm">SolarSaathi (सोलर साथी)</span> • Nagpur & Vidarbha, Maharashtra
                    <p className="text-xs text-emerald-200/70 mt-1">
                      Compliant with PM Surya Ghar: Muft Bijli Yojana & DPDP Act 2023.
                    </p>
                  </div>
                  <div className="flex gap-4 text-xs font-medium">
                    <span className="text-emerald-200/80">Benchmark: 1,400 kWh/kW/Year</span>
                    <span className="text-emerald-400">•</span>
                    <span className="text-amber-400 font-semibold">₹78,000 Max Subsidy Cap</span>
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
