import { AccountManageButton } from './account-manage-button'

interface AccountCardHeaderProps {
  title: string
  manageHref: string
}

export function AccountCardHeader({ title, manageHref }: AccountCardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 pt-6 pb-4">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <AccountManageButton href={manageHref} />
    </div>
  )
}
