import { AccountAsideMenu } from '@/components/account/aside-menu'

export const dynamic = 'force-dynamic'

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="max-w-[1560px] mx-auto flex gap-4 lg:gap-10 lg:flex-row flex-col items-start px-4 pb-20">
      <AccountAsideMenu />
      <main className="w-full lg:flex-1 min-w-0">{children}</main>
    </div>
  )
}
