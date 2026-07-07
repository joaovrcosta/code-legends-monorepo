import Link from 'next/link'
import { cn } from '@/lib/utils'

interface AccountManageButtonProps {
  href: string
  className?: string
}

export function AccountManageButton({ href, className }: AccountManageButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center rounded-full border border-[#25252A] bg-mutedDeep px-4 py-1.5 text-sm text-white transition-colors hover:bg-[#25252A]',
        className,
      )}
    >
      Gerenciar
    </Link>
  )
}
