import { getCurrentUser } from '@/actions/user/get-current-user'
import { AccountAsideMenu } from '@/components/account/aside-menu'
import { AccountProfileHeader } from '@/components/account/account-profile-header'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="mx-auto flex w-full max-w-[1080px] flex-col items-center px-4 pt-8 pb-12">
      <AccountProfileHeader user={user} />
      <AccountAsideMenu />
      <main className="mt-8 w-full">{children}</main>
    </div>
  )
}
