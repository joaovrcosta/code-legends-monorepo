declare module 'react-syntax-highlighter' {
  import type { ComponentType, CSSProperties } from 'react'
  export const Prism: ComponentType<{
    language?: string
    style?: Record<string, CSSProperties>
    PreTag?: string | ComponentType
    codeTagProps?: { style?: CSSProperties }
    customStyle?: CSSProperties
    showLineNumbers?: boolean
    wrapLongLines?: boolean
    children?: string
  }>
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  import type { CSSProperties } from 'react'
  export const oneDark: Record<string, CSSProperties>
}
