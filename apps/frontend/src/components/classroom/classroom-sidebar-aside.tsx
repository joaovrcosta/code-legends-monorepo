'use client'

import type { ReactNode } from 'react'
import { Menu, X } from 'lucide-react'
import useClassroomSidebarStore from '@/stores/classroom-sidebar'
import {
  CLASSROOM_SIDEBAR_COLLAPSED_RAIL_CLASS,
  CLASSROOM_SIDEBAR_COLLAPSED_SLOT_CLASS,
  CLASSROOM_SIDEBAR_OPEN_WIDTH_CLASS,
} from '@/lib/classroom-sidebar-layout'
import { cn } from '@/lib/utils'

type ClassroomSidebarAsideProps = {
  children: ReactNode
  title?: string
  headerClassName?: string
  titleClassName?: string
  showBorder?: boolean
}

const PANEL_TRANSITION =
  'transition-[width,border-radius,box-shadow] duration-300 ease-in-out' as const

export function ClassroomSidebarAside({
  children,
  title = 'Conteúdo',
  headerClassName,
  titleClassName = 'text-base font-normal text-[#C4C4CC]',
  showBorder = false,
}: ClassroomSidebarAsideProps) {
  const { isOpen, toggleSidebar } = useClassroomSidebarStore()

  return (
    <aside
      aria-label="Trilha do curso"
      className={cn(
        'fixed left-0 top-[78px] z-40 hidden h-[calc(100dvh-78px)] overflow-hidden lg:block',
        'transition-[width] duration-300 ease-in-out',
        isOpen
          ? CLASSROOM_SIDEBAR_OPEN_WIDTH_CLASS
          : CLASSROOM_SIDEBAR_COLLAPSED_SLOT_CLASS,
      )}
    >
      <div
        className={cn(
          'absolute inset-y-0 left-0 pt-0 pb-4 pl-3 pr-3',
          isOpen ? 'w-[378px]' : 'w-20',
        )}
      >
        <div
          className={cn(
            'flex h-full flex-col overflow-hidden border border-[#25252A] bg-surface',
            PANEL_TRANSITION,
            isOpen
              ? 'w-full rounded-t-[20px] shadow-none'
              : cn(
                  'rounded-3xl shadow-lg',
                  CLASSROOM_SIDEBAR_COLLAPSED_RAIL_CLASS,
                ),
          )}
        >
          <div
            className={cn(
              'relative flex h-14 shrink-0 items-center bg-surface',
              isOpen
                ? cn(
                    'justify-end px-4',
                    showBorder && 'border-b border-[#25252A]',
                    headerClassName,
                  )
                : 'justify-center px-2',
              !isOpen && 'rounded-t-3xl',
            )}
          >
            {isOpen ? (
              <h2
                className={cn(
                  titleClassName,
                  'pointer-events-none absolute inset-y-0 left-4 flex items-center truncate opacity-100 transition-opacity duration-150 delay-300',
                )}
              >
                {title}
              </h2>
            ) : null}
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label={isOpen ? 'Fechar trilha' : 'Abrir trilha'}
              className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#C4C4CC] transition-colors hover:bg-[#25252A] hover:text-white"
            >
              {isOpen ? (
                <X size={22} strokeWidth={2} />
              ) : (
                <Menu size={22} strokeWidth={2} />
              )}
            </button>
          </div>

          <div
            className={cn(
              'min-h-0 flex-1 overflow-hidden',
              isOpen
                ? 'pointer-events-auto opacity-100 transition-opacity duration-150 delay-300'
                : 'pointer-events-none opacity-0 transition-opacity duration-75 delay-0',
            )}
            aria-hidden={!isOpen}
          >
            <div className="h-full w-[346px] max-w-none overflow-x-hidden overflow-y-auto px-4">
              {children}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
