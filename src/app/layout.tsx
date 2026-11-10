import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const archivo = localFont({
  src: "./fonts/archivo-latin.woff2",
  variable: "--font-archivo",
  weight: "100 900",
  display: "swap",
});

const plexMono = localFont({
  src: [
    {
      path: "./fonts/ibm-plex-mono-400-latin.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/ibm-plex-mono-500-latin.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/ibm-plex-mono-600-latin.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/ibm-plex-mono-700-latin.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-plexmono",
  display: "swap",
});

const caveat = localFont({
  src: "./fonts/caveat-latin.woff2",
  variable: "--font-caveat",
  weight: "400 700",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NEVALO — Registre de la transparence professionnelle",
    template: "%s · NEVALO",
  },
  description:
    "Évaluez et découvrez la réalité des entreprises avant de vous engager.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${archivo.variable} ${plexMono.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
