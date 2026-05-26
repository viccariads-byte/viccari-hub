import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Viccari Hub",
  description: "Portal de estratégia de conteúdo da Viccari Ads LTDA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={cn(raleway.variable)}>
      <body className="antialiased min-h-screen bg-[#000000] text-white font-[family-name:var(--font-raleway)]">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
