import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guerra das Cinzas e do Véu — Sandbox",
  description: "Protótipo jogável 0.1 do duelo Bestas de Fogo vs Magos Umbrais.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen text-stone-100 antialiased">{children}</body>
    </html>
  );
}
