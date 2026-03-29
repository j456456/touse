import type { Metadata } from "next";
import { lora } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Babel — Democratize AI",
  description:
    "Babel bridges the language divide by uplifting LLM performance on non-English prompts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${lora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
