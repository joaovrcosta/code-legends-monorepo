'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const links = [
  { name: 'Visão geral', path: '/account' },
  { name: 'Assinatura', path: '/account/purchases' },
  { name: 'Certificados', path: '/account/certificates' },
  { name: 'Dados de acesso', path: '/account/access' },
  { name: 'Dados pessoais', path: '/account/personal-data' },
]

export function AccountAsideMenu() {
  const pathName = usePathname()

  const isActive = (path: string) => {
    if (path === '/account') {
      return pathName === '/account'
    }
    return pathName.startsWith(path)
  }

  return (
    <nav className="mt-8 w-full">
      <div className="relative flex w-full items-center justify-center gap-6 border-b border-[#25252A]">
        {links.map((link) => {
          const active = isActive(link.path)

          return (
            <Link
              key={link.path}
              href={link.path}
              className={cn(
                'relative shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-200',
                active ? 'text-white' : 'text-[#C4C4CC] hover:text-white',
              )}
            >
              {link.name}
              {active && (
                <motion.span
                  layoutId="account-tab-indicator"
                  className="absolute right-0 bottom-0 left-0 h-0.5 bg-blue-gradient-500"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
