import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { validateEnv } from "@/lib/env";

if (typeof window !== "undefined") {
  validateEnv();
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BioInteractiva - Aprende Bioinformática",
  description: "Plataforma educativa interactiva para aprender bioinformática desde cero: línea de comando, búsqueda en bases de datos, genómica y filogenética.",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
