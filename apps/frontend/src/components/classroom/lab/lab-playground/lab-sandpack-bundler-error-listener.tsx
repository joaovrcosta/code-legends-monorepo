'use client'

import { useEffect, useRef } from 'react'
import { useSandpackClient } from '@codesandbox/sandpack-react'

/** Erros de bundle/sintaxe (overlay Sandpack), além de console.error. */
export function LabSandpackBundlerErrorListener({
  sessionId,
  capturing,
  onBundlerError,
}: {
  sessionId: number
  capturing: boolean
  onBundlerError: () => void
}) {
  const { listen } = useSandpackClient()
  const listenRef = useRef(listen)
  const onErrorRef = useRef(onBundlerError)
  const gateRef = useRef(false)
  listenRef.current = listen
  onErrorRef.current = onBundlerError

  useEffect(() => {
    gateRef.current = sessionId > 0 && capturing
  }, [sessionId, capturing])

  useEffect(() => {
    return listenRef.current((msg) => {
      if (!gateRef.current) return
      const data = msg as {
        type?: string
        action?: string
        notificationType?: string
        compilatonError?: boolean
      }
      if (data.type === 'action' && data.action === 'show-error') {
        onErrorRef.current()
        return
      }
      if (
        data.type === 'action' &&
        data.action === 'notification' &&
        data.notificationType === 'error'
      ) {
        onErrorRef.current()
        return
      }
      if (data.type === 'done' && data.compilatonError) {
        onErrorRef.current()
      }
    })
  }, [])

  return null
}
