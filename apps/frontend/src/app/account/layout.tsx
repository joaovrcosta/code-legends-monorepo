import { getCurrentUser } from '@/actions/user/get-current-user'
import { AccountAsideMenu } from '@/components/account/aside-menu'
import { AccountProfileHeader } from '@/components/account/account-profile-header'
import { CtaUpgradeBanner, UpgradeGate } from '@/components/cta'
import { getUpgradeEligibility } from '@/lib/upgrade-eligibility'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user] = await Promise.all([
    getCurrentUser(),
    getUpgradeEligibility(),
  ])

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="mx-auto flex w-full max-w-[1080px] flex-col items-center px-0 pt-0 pb-0 md:px-4 md:pt-8 md:pb-12">
      <AccountProfileHeader user={user} />
      <UpgradeGate>
        <div className="mt-6 w-full">
          <CtaUpgradeBanner />
        </div>
      </UpgradeGate>
      <AccountAsideMenu />
      <main className="mt-8 w-full">{children}</main>
    </div>
  )
}
