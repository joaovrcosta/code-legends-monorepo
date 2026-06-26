'use client'

import { cn } from '@/lib/utils'

export type CatalogQuickTab = 'all' | 'news' | 'free' | 'careers'

const QUICK_TABS: { id: CatalogQuickTab; label: string }[] = [
  { id: 'all', label: 'Tudo' },
  { id: 'news', label: 'Novidades' },
  { id: 'free', label: 'Conteúdos grátis' },
  { id: 'careers', label: 'Carreiras' },
]

type CatalogFilterHeaderProps = {
  activeTab: CatalogQuickTab
  onTabChange: (tab: CatalogQuickTab) => void
  className?: string
}

export function CatalogFilterHeader({
  activeTab,
  onTabChange,
  className,
}: CatalogFilterHeaderProps) {
  return (
    <div
      className={cn(
        'mb-6 flex w-full min-w-0 flex-col gap-4 lg:mb-8',
        className,
      )}
    >
      <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {QUICK_TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'h-[42px] shrink-0 rounded-full px-4 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-gradient-500 text-[#E0E0EE]'
                  : 'bg-[#15151B] font-light text-[#E0E0EE] hover:bg-[#25252A]',
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
