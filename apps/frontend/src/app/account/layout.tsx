import { AccountAsideMenu } from '@/components/account/aside-menu'

export const dynamic = 'force-dynamic'

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex w-full flex-col items-start gap-4 lg:gap-10 lg:flex-row">
      <AccountAsideMenu />
      <main className="w-full min-w-0 lg:flex-1">{children}</main>
    </div>
  )
}
