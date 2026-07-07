'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

const links = [
  { name: 'Visão geral', path: '/account' },
  { name: 'Assinatura', path: '/account/purchases' },
  { name: 'Certificados', path: '/account/certificates' },
  { name: 'Dados de acesso', path: '/account/access' },
  { name: 'Dados pessoais', path: '/account/personal-data' },
]

type TabIndicatorStyle = {
  left: number
  width: number
}

export function AccountAsideMenu() {
  const pathName = usePathname()
  const scrollRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const linkRefs = useRef<Map<string, HTMLSpanElement>>(new Map())
  const [indicator, setIndicator] = useState<TabIndicatorStyle>({
    left: 0,
    width: 0,
  })
  const [isReady, setIsReady] = useState(false)

  const isActive = (path: string) => {
    if (path === '/account') {
      return pathName === '/account'
    }
    return pathName.startsWith(path)
  }

  const activePath =
    links.find((link) => isActive(link.path))?.path ?? links[0].path

  const updateIndicator = useCallback(() => {
    const link = linkRefs.current.get(activePath)
    if (!link) return

    setIndicator({
      left: link.offsetLeft,
      width: link.offsetWidth,
    })
    setIsReady(true)
  }, [activePath])

  useLayoutEffect(() => {
    setIsReady(false)
    updateIndicator()

    const scrollContainer = scrollRef.current
    const activeLink = linkRefs.current.get(activePath)

    if (scrollContainer && activeLink) {
      const containerWidth = scrollContainer.offsetWidth
      const linkLeft = activeLink.offsetLeft
      const linkWidth = activeLink.offsetWidth
      const scrollTarget = linkLeft - containerWidth / 2 + linkWidth / 2

      scrollContainer.scrollTo({
        left: Math.max(0, scrollTarget),
        behavior: 'smooth',
      })
    }

    const frame = requestAnimationFrame(updateIndicator)

    const track = trackRef.current
    if (!track || typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateIndicator)
      return () => {
        cancelAnimationFrame(frame)
        window.removeEventListener('resize', updateIndicator)
      }
    }

    const observer = new ResizeObserver(updateIndicator)
    observer.observe(track)
    for (const link of linkRefs.current.values()) {
      observer.observe(link)
    }

    window.addEventListener('resize', updateIndicator)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', updateIndicator)
    }
  }, [updateIndicator, activePath])

  return (
    <nav className="mt-8 w-full">
      <div className="-mx-4 px-4 md:mx-0 md:px-0">
        <div
          ref={scrollRef}
          className="overflow-x-auto scrollbar-hide border-b border-[#25252A]"
        >
          <div
            ref={trackRef}
            className="relative mx-auto flex w-max min-w-full items-center justify-start gap-2 md:justify-center md:gap-6"
          >
            {links.map((link) => {
              const active = isActive(link.path)

              return (
                <span
                  key={link.path}
                  ref={(element) => {
                    if (element) linkRefs.current.set(link.path, element)
                    else linkRefs.current.delete(link.path)
                  }}
                  className="relative shrink-0"
                >
                  <Link
                    href={link.path}
                    className={cn(
                      'relative z-10 block px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-200 md:px-4',
                      active
                        ? 'text-white'
                        : 'text-[#C4C4CC] hover:text-white',
                    )}
                  >
                    {link.name}
                  </Link>
                </span>
              )
            })}

            <div
              aria-hidden
              className={cn(
                'pointer-events-none absolute bottom-0 left-0 h-0.5 bg-blue-gradient-500 transition-[transform,width,opacity] duration-300 ease-out',
                isReady ? 'opacity-100' : 'opacity-0',
              )}
              style={{
                width: indicator.width,
                transform: `translateX(${indicator.left}px)`,
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  )
}
