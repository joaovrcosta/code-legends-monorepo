import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ContentHubProviders } from "@/components/providers/content-hub-providers";
import { Toaster } from "sonner";
import "./globals.css";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Code Legends - Content Hub",
  description: "Gerenciamento de conteúdo da plataforma Code Legends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="dark">
      <body
        className={`${poppins.variable} antialiased`}
      >
        <ContentHubProviders>
          {children}
          <Toaster position="top-right" richColors />
        </ContentHubProviders>
      </body>
    </html>
  );
}
