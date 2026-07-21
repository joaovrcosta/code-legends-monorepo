export type SpecsMap = Record<
  string,
  {
    tests?: Record<string, { status?: string; errors?: unknown[] }>
    describes?: Record<string, unknown>
    error?: { message?: string } | string
  }
>

export type TestStatus = 'idle' | 'starting' | 'running' | 'complete'

export type SandpackFileInput = string | { code: string; hidden?: boolean }

export type SandpackConsoleLog = {
  id: string
  method: string
  data?: Array<string | number | boolean | Record<string, unknown> | null>
}
