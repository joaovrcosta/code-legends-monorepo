import { describe, expect, it } from 'vitest'
import { buildLabTestHelpersSource } from './lab-test-helpers-source'

describe('buildLabTestHelpersSource literal boundaries', () => {
  it('generated helpers rejeitam truee e aceitam true', () => {
    const src = buildLabTestHelpersSource('react')
    // Isola o helper gerado sem exports ESM
    const body = src
      .replace(/^export /gm, '')
      .replace(/export function/g, 'function')
      .replace(/export \{[^}]+\}/g, '')
    // eslint-disable-next-line no-new-func
    const factory = new Function(
      `${body}\nreturn { assertBindingAssignedInSource };`,
    )
    const { assertBindingAssignedInSource } = factory()

    expect(() =>
      assertBindingAssignedInSource('var ativo = true;', 'ativo', true),
    ).not.toThrow()
    expect(() =>
      assertBindingAssignedInSource('var ativo = truee;', 'ativo', true),
    ).toThrow(/should have a value/)
    expect(() =>
      assertBindingAssignedInSource('var idade = 25;', 'idade', 25),
    ).not.toThrow()
    expect(() =>
      assertBindingAssignedInSource('var idade = 250;', 'idade', 25),
    ).toThrow(/should have a value/)
  })
})
