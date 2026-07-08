import './globals.css'
import localFont from 'next/font/local'
import { Poppins, Instrument_Sans } from 'next/font/google'
import { Suspense } from 'react'
import { Providers, type ProvidersSession } from '@/components/providers/session-provider'
import { AppShellWithData } from '@/components/layout/app-shell-with-data'
import { AppShellStreamingFallback } from '@/components/layout/app-shell-streaming-fallback'
import { getResolvedUserPlan } from '@/actions/user/get-user-from-api'
import { getCapabilitiesFromAPI } from '@/actions/user/get-capabilities'
import { auth } from '@/auth/authSetup'
import type { Metadata } from 'next'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins',
})

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-instrument-sans',
})

const wotfard = localFont({
  src: '../../fonts/wotfard-regular-webfont.woff2',
  variable: '--font-wotfard',
  weight: '400',
  style: 'normal',
  display: 'swap',
})

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Code Legends - Aprenda Programação do Zero',
  description:
    'Plataforma de ensino de programação com cursos completos de front-end, back-end e desenvolvimento full-stack.',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = (await auth()) as ProvidersSession
  const initialPlan = await getResolvedUserPlan()
  const isLoggedIn = Boolean(session?.user)
  const initialCapabilities = isLoggedIn
    ? await getCapabilitiesFromAPI()
    : null

  return (
    <html
      lang="pt-BR"
      className={`${poppins.variable} ${instrumentSans.variable} ${wotfard.variable}`}
    >
      <body className="font-instrumentSans antialiased">
        <Providers
          session={session}
          initialPlan={initialPlan}
          initialCapabilities={initialCapabilities}
          serverCapabilitiesFetched={isLoggedIn}
        >
          <Suspense
            fallback={<AppShellStreamingFallback>{children}</AppShellStreamingFallback>}
          >
            <AppShellWithData>{children}</AppShellWithData>
          </Suspense>
        </Providers>
      </body>
    </html>
  )
}
