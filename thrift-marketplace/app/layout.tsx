import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ThreadMarket – Buy & Sell Thrift Clothes",
  description:
    "A sustainable marketplace for buying and selling pre-loved clothing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 min-h-screen font-sans">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-gray-200 bg-white mt-16 py-8 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} ThreadMarket. Sustainable fashion for everyone.
        </footer>
      </body>
    </html>
  );
}
