import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stock-Eye",
  description: "App for analysing and generating stock market reports",
};

const currentDate = new Date().toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "long",
});

export default async function RootLayout({
  children,
  marketOutlook,
  globalIndices,
  keyIndicators,
  institutionOutlook,
  sectorOutlook,
  sectorPerformance,
  stocksInFocus,
  marketDepth,
}: Readonly<{
  children: React.ReactNode;
  marketOutlook: React.ReactNode;
  globalIndices: React.ReactNode;
  keyIndicators: React.ReactNode;
  institutionOutlook: React.ReactNode;
  sectorOutlook: React.ReactNode;
  sectorPerformance: React.ReactNode;
  stocksInFocus: React.ReactNode;
  marketDepth: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 md:p-8 relative pb-20">
          <header className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Things to Know Today
              </h1>
              <p className="text-md text-gray-400">{currentDate}</p>
            </div>
          </header>
          {children}
          <main className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              {marketOutlook}
              {globalIndices}
              {keyIndicators}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              <div className="lg:col-span-2 h-full flex flex-col grow">
                {institutionOutlook}
              </div>
              <div className="lg:col-span-1 h-full flex flex-col grow">
                {sectorOutlook}
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              <div className="lg:col-span-2  h-full flex flex-col grow">
                {sectorPerformance}
              </div>
              <div className="lg:col-span-1  h-full flex flex-col grow">
                {stocksInFocus}
              </div>
            </div>
            {marketDepth}
          </main>
        </div>
      </body>
    </html>
  );
}
