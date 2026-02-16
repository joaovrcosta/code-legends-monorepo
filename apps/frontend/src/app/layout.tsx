import "./globals.css";
import { Poppins, Inter } from "next/font/google";
import { Providers } from "@/components/providers/session-provider";
import { ConditionalAppShell } from "@/components/layout/conditional-app-shell";
import { getActiveCourse } from "@/actions/user/get-active-course";
import { getUserEnrolledList } from "@/actions/progress";
import type { Metadata } from "next";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Code Legends - Aprenda Programação do Zero",
  description: "Plataforma de ensino de programação com cursos completos de front-end, back-end e desenvolvimento full-stack.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Busca os dados necessários para o AppShell
  const [enrolledCoursesData, activeCourse] = await Promise.all([
    getUserEnrolledList(),
    getActiveCourse(),
  ]);

  return (
    <html lang="pt-BR" className={`${poppins.variable} ${inter.variable}`}>
      <body className="font-poppins antialiased">
        <Providers>
          <ConditionalAppShell
            initialUserCourses={enrolledCoursesData.userCourses || []}
            initialActiveCourse={activeCourse}
          >
            {children}
          </ConditionalAppShell>
        </Providers>
      </body>
    </html>
  );
}
