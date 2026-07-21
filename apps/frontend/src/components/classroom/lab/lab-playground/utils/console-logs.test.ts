import { describe, expect, it } from 'vitest'
import {
  collapseDuplicatedRun,
  dedupeConsecutiveLogs,
} from './console-logs'
import type { SandpackConsoleLog } from '../types'

function L(...vals: Array<string | number>): SandpackConsoleLog[] {
  return vals.map((v, i) => ({
    id: String(i),
    method: 'log',
    data: [v],
  }))
}

function vals(logs: SandpackConsoleLog[]): Array<string | number> {
  return collapseDuplicatedRun(logs).map((x) => x.data![0] as string | number)
}

describe('dedupeConsecutiveLogs', () => {
  it('remove linhas consecutivas idênticas', () => {
    const out = dedupeConsecutiveLogs(L(25, 25, 'JS')).map(
      (x) => x.data![0] as string | number,
    )
    expect(out).toEqual([25, 'JS'])
  })
})

describe('collapseDuplicatedRun', () => {
  it('colapsa ciclo duplo completo', () => {
    expect(vals(L(25, 'JS', 12, 25, 'JS', 12))).toEqual([25, 'JS', 12])
  })

  it('colapsa ciclo triplo', () => {
    expect(vals(L(1, 2, 1, 2, 1, 2))).toEqual([1, 2])
  })

  it('colapsa cauda parcial [a,b,c,a,b]', () => {
    expect(vals(L(25, 'JS', 12, 25, 'JS'))).toEqual([25, 'JS', 12])
  })

  it('não colapsa padrão legítimo curto [1,2,1]', () => {
    expect(vals(L(1, 2, 1))).toEqual([1, 2, 1])
  })

  it('mantém saída única', () => {
    expect(vals(L(25))).toEqual([25])
  })

  it('dedupe consecutivos antes do colapso', () => {
    expect(vals(L(25, 25))).toEqual([25])
  })
})
