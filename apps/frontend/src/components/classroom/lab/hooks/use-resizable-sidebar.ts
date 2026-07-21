'use client'

import {
  useCallback,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react'

export const SIDEBAR_DEFAULT_PX = 360
export const SIDEBAR_MIN_PX = 240
export const SIDEBAR_MAX_PX = 720

export function useResizableSidebar(
  layoutRef: RefObject<HTMLDivElement | null>,
) {
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT_PX)
  const [isResizing, setIsResizing] = useState(false)

  const clampSidebarWidth = useCallback((width: number) => {
    const layoutWidth = layoutRef.current?.clientWidth ?? 0
    const maxFromLayout =
      layoutWidth > 0
        ? Math.min(SIDEBAR_MAX_PX, Math.floor(layoutWidth * 0.65))
        : SIDEBAR_MAX_PX
    return Math.min(maxFromLayout, Math.max(SIDEBAR_MIN_PX, width))
  }, [layoutRef])

  const handleResizeStart = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault()
      const handle = event.currentTarget
      handle.setPointerCapture(event.pointerId)
      setIsResizing(true)

      const onPointerMove = (moveEvent: PointerEvent) => {
        const left = layoutRef.current?.getBoundingClientRect().left ?? 0
        setSidebarWidth(clampSidebarWidth(moveEvent.clientX - left))
      }

      const onPointerUp = (upEvent: PointerEvent) => {
        handle.releasePointerCapture(upEvent.pointerId)
        handle.removeEventListener('pointermove', onPointerMove)
        handle.removeEventListener('pointerup', onPointerUp)
        setIsResizing(false)
      }

      handle.addEventListener('pointermove', onPointerMove)
      handle.addEventListener('pointerup', onPointerUp)
    },
    [clampSidebarWidth, layoutRef],
  )

  return {
    sidebarWidth,
    setSidebarWidth,
    isResizing,
    clampSidebarWidth,
    handleResizeStart,
  }
}
