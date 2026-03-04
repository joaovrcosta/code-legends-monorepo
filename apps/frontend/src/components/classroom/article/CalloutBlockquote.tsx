'use client'

import type { ComponentProps } from 'react'
import { Info, AlertTriangle, Lightbulb } from 'lucide-react'

/**
 * Extrai texto do primeiro nó para detectar variante do callout.
 * Convenção no Content Hub: > **Note** / **Nota**, > **Warning** / **Aviso**, > **Tip** / **Dica**.
 */
function getTextFromNode(node: React.ReactNode): string {
  if (typeof node === 'string') return node
  if (Array.isArray(node)) {
    const first = node[0]
    return first !== undefined ? getTextFromNode(first) : ''
  }
  if (node !== null && typeof node === 'object' && 'props' in node) {
    const props = (node as { props?: { children?: React.ReactNode } }).props
    return getTextFromNode(props?.children ?? '')
  }
  return ''
}

export type CalloutVariant = 'note' | 'warning' | 'tip' | null

function getCalloutVariant(children: React.ReactNode): CalloutVariant {
  const text = getTextFromNode(children).trim().toLowerCase()
  if (/^(note|nota)\b/.test(text)) return 'note'
  if (/^(warning|aviso|atenção|atencao)\b/.test(text)) return 'warning'
  if (/^(tip|dica)\b/.test(text)) return 'tip'
  return null
}

const variantStyles: Record<
  NonNullable<CalloutVariant>,
  { wrapper: string; icon: typeof Info }
> = {
  note: {
    wrapper:
      'border-l-4 border-[#00C8FF] bg-[#00C8FF]/10 text-white [&>*]:text-white/90',
    icon: Info,
  },
  warning: {
    wrapper:
      'border-l-4 border-amber-500 bg-amber-500/10 text-amber-100 [&>*]:text-amber-200/90',
    icon: AlertTriangle,
  },
  tip: {
    wrapper:
      'border-l-4 border-emerald-500 bg-emerald-500/10 text-emerald-100 [&>*]:text-emerald-200/90',
    icon: Lightbulb,
  },
}

interface CalloutBlockquoteProps extends ComponentProps<'blockquote'> {
  children?: React.ReactNode
}

/**
 * Blockquote customizado que estiliza callouts (Note, Aviso, Dica).
 * Convenção para autores: use no Markdown "> **Note** ...", "> **Aviso** ...", "> **Dica** ...".
 */
export function CalloutBlockquote({
  children,
  className = '',
  ...props
}: CalloutBlockquoteProps) {
  const variant = getCalloutVariant(children)
  const style = variant ? variantStyles[variant] : null
  const Icon = style?.icon

  return (
    <blockquote
      className={`my-4 flex gap-3 rounded-r-lg border border-[#25252A] py-3 pl-4 pr-4 ${style?.wrapper ?? 'border-l-4 border-[#3f3f46] bg-white/5'} ${className}`}
      {...props}
    >
      {variant && Icon && (
        <Icon size={20} className="mt-0.5 shrink-0" aria-hidden />
      )}
      <div className="min-w-0 flex-1">{children}</div>
    </blockquote>
  )
}
