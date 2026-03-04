'use client'

import React, { type ComponentProps } from 'react'
import { Info, AlertTriangle, Lightbulb, CheckCircle2 } from 'lucide-react'

// 1. Função para limpar recursivamente a palavra-chave do início do texto
function removeVariantPrefix(
  node: React.ReactNode,
  variant: string,
): React.ReactNode {
  if (!node) return null

  if (typeof node === 'string') {
    // Remove a palavra chave (ex: "Sucesso") e caracteres especiais do início
    const regex = new RegExp(`^\\s*[>]*\\s*${variant}\\s*[:|-]?\\s*`, 'i')
    return node.replace(regex, '')
  }

  if (Array.isArray(node)) {
    // Tenta limpar apenas o primeiro nó de texto encontrado
    let foundFirstText = false
    return React.Children.map(node, (child) => {
      if (foundFirstText) return child // Se já limpou o prefixo, retorna o resto normal

      if (typeof child === 'string' && child.trim().length > 0) {
        foundFirstText = true
        return removeVariantPrefix(child, variant)
      }

      // Se for um elemento (ex: <strong>), entra nele para procurar o texto
      if (React.isValidElement(child)) {
        const element = child as React.ReactElement<{
          children?: React.ReactNode
        }>
        return React.cloneElement(element, {
          ...element.props,
          children: removeVariantPrefix(element.props.children, variant),
        })
      }
      return child
    })
  }

  if (React.isValidElement(node)) {
    const element = node as React.ReactElement<{
      children?: React.ReactNode
    }>
    return React.cloneElement(element, {
      ...element.props,
      children: removeVariantPrefix(element.props.children, variant),
    })
  }

  return node
}

// Helper simples para detectar o tipo baseado no texto bruto
function getCalloutVariant(text: string): CalloutVariant {
  const t = text.trim().toLowerCase()
  if (t.includes('note') || t.includes('nota')) return 'note'
  if (t.includes('warning') || t.includes('aviso')) return 'warning'
  if (t.includes('tip') || t.includes('dica')) return 'tip'
  if (t.includes('success') || t.includes('sucesso')) return 'success'
  return null
}

function getNodeText(node: React.ReactNode): string {
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(getNodeText).join('')
  if (React.isValidElement(node)) {
    const element = node as React.ReactElement<{
      children?: React.ReactNode
    }>
    return getNodeText(element.props.children)
  }
  return ''
}

export type CalloutVariant = 'note' | 'warning' | 'tip' | 'success' | null

const variantStyles = {
  note: { color: 'text-blue-400', border: 'bg-blue-400', icon: Info },
  warning: {
    color: 'text-amber-400',
    border: 'bg-amber-400',
    icon: AlertTriangle,
  },
  tip: { color: 'text-emerald-400', border: 'bg-emerald-400', icon: Lightbulb },
  success: {
    color: 'text-[#4ade80]', // Verde Neon exato
    border: 'bg-[#4ade80]',
    icon: CheckCircle2,
  },
}

export function CalloutBlockquote({
  children,
  className = '',
  ...props
}: ComponentProps<'blockquote'>) {
  const rawText = getNodeText(children)
  const variant = getCalloutVariant(rawText)
  const style = variant ? variantStyles[variant] : null

  // Se não for um callout especial, retorna o blockquote padrão
  if (!variant || !style) {
    return (
      <blockquote
        className={`border-l-4 border-zinc-700 pl-4 italic text-zinc-400 ${className}`}
        {...props}
      >
        {children}
      </blockquote>
    )
  }

  const Icon = style.icon
  // Limpa a palavra "Sucesso" para ela não aparecer duplicada
  const content = removeVariantPrefix(children, variant)

  return (
    <div
      className={`relative my-6 flex gap-4 rounded-lg bg-[#0c0c0c] p-6 shadow-sm border border-white/5 ${className}`}
    >
      {/* Coluna da Esquerda: Ícone + Linha Decorativa */}
      <div className="flex flex-col items-center">
        <Icon size={24} className={`${style.color} shrink-0`} />
        {/* Essa div cria a linha vertical abaixo do ícone igual à imagem */}
        <div
          className={`mt-2 w-0.5 flex-1 rounded-full ${style.border} opacity-50`}
        />
      </div>

      {/* Coluna da Direita: Conteúdo */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Renderiza o conteúdo limpo. 
             Dica: O markdown vai transformar **Título** em <strong>Título</strong>.
             Estilizamos o strong globalmente dentro deste bloco para ser Branco e Block. */}
        <div className="text-gray-300 leading-relaxed [&>p>strong]:block [&>p>strong]:text-lg [&>p>strong]:text-white [&>p>strong]:mb-1 [&>p>strong]:font-bold">
          {content}
        </div>
      </div>
    </div>
  )
}
