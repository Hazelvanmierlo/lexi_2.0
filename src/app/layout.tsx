import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { ClerkProvider } from "@clerk/nextjs";
import { CartProvider } from "@/lib/cart-context";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display-google",
  display: "swap",
});

const sans = Geist({
  subsets: ["latin"],
  variable: "--font-sans-google",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-google",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("footer");
  return {
    title: "Lexi.kids",
    description: t("tagline"),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const authEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED === "true";
  const tree = (
    <html
      lang={locale}
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lexi focus:bg-primary focus:px-4 focus:py-2 focus:text-white focus:shadow-lexi"
        >
          Naar inhoud
        </a>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <CartProvider>{children}</CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
  return authEnabled ? <ClerkProvider>{tree}</ClerkProvider> : tree;
}
