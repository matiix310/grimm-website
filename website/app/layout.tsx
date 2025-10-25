import type { Metadata } from "next";
import { Overpass, Archivo_Narrow, Paytone_One } from "next/font/google";
import "./globals.css";

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
  title: "BDE GRIMM",
  description: "Le site web du BDE GRIMM.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
