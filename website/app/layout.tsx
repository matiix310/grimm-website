import type { Metadata, Viewport } from "next";
import { Overpass, Archivo_Narrow, Paytone_One } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/Sonner";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const overpass = Overpass({
  subsets: ["latin"],
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const archivoNarrow = Archivo_Narrow({
  subsets: ["latin"],
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const paytonOne = Paytone_One({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Liste BDE Grimm",
  description: "Le site web de la liste BDE Grimm.",
  openGraph: {
    title: "Liste BDE Grimm",
    description: "Le site web de la liste BDE Grimm.",
    type: "website",
    images: "https://bde-grimm.com/grimm-logo-round.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#D55F30",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <Toaster />
        {children}
      </body>
    </html>
  );
}
