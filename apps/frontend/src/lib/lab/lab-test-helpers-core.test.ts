import { describe, expect, it } from 'vitest'
import {
  MAX_STUDENT_CODE_BYTES,
  assertCodeSize,
  hasConsoleLogArg,
  hasKeywordBinding,
  resolveStudentCodePath,
  stripStringsAndComments,
} from './lab-test-helpers-core'

describe('resolveStudentCodePath', () => {
  it('aceita allowlist e default /App.js', () => {
    expect(resolveStudentCodePath()).toBe('/App.js')
    expect(resolveStudentCodePath('/App.js')).toBe('/App.js')
    expect(resolveStudentCodePath('/index.js')).toBe('/index.js')
    expect(resolveStudentCodePath('App.js')).toBe('/App.js')
  })

  it('rejeita paths fora da allowlist (helpers, testes)', () => {
    expect(() => resolveStudentCodePath('/lab-test-helpers.js')).toThrow(
      /não permitido/,
    )
    expect(() => resolveStudentCodePath('/lab.step.test.js')).toThrow(
      /não permitido/,
    )
    expect(() => resolveStudentCodePath('/foo.js')).toThrow(/não permitido/)
  })
})

describe('assertCodeSize', () => {
  it('rejeita acima de 512 KiB', () => {
    expect(() => assertCodeSize(MAX_STUDENT_CODE_BYTES + 1)).toThrow(/limite/)
    expect(() => assertCodeSize(MAX_STUDENT_CODE_BYTES)).not.toThrow()
  })
})

describe('stripStringsAndComments', () => {
  it('remove comentários de linha e bloco', () => {
    const source =
      'var a = 1; // var numOfSlices = 8\n/* var x = 1 */\nvar b = 2;'
    expect(hasKeywordBinding(source, 'var', 'numOfSlices')).toBe(false)
    expect(hasKeywordBinding(source, 'var', 'b')).toBe(true)
    expect(stripStringsAndComments(source)).not.toMatch(/numOfSlices/)
  })
})

describe('hasKeywordBinding', () => {
  it('casa declaração simples', () => {
    expect(hasKeywordBinding("var numOfSlices = 8;", 'var', 'numOfSlices')).toBe(
      true,
    )
    expect(hasKeywordBinding('let numOfSlices = 8;', 'var', 'numOfSlices')).toBe(
      false,
    )
  })

  it('casa multi-decl na mesma linha', () => {
    expect(
      hasKeywordBinding('var a = 1, numOfSlices = 8;', 'var', 'numOfSlices'),
    ).toBe(true)
  })

  it('casa com quebra de linha após keyword', () => {
    expect(
      hasKeywordBinding('var\n  numOfSlices = 8;', 'var', 'numOfSlices'),
    ).toBe(true)
  })

  it('ignora keyword só em comentário', () => {
    expect(
      hasKeywordBinding('// var numOfSlices = 8\nlet x = 1;', 'var', 'numOfSlices'),
    ).toBe(false)
  })

  it('ignora keyword só dentro de string', () => {
    expect(
      hasKeywordBinding(
        "const s = 'var numOfSlices = 8';\nlet x = 1;",
        'var',
        'numOfSlices',
      ),
    ).toBe(false)
  })
})

describe('hasConsoleLogArg', () => {
  it('casa console.log(favoriteFood)', () => {
    expect(hasConsoleLogArg('console.log(favoriteFood);', 'favoriteFood')).toBe(
      true,
    )
  })

  it('ignora console.log só em string', () => {
    expect(
      hasConsoleLogArg(
        "const s = 'console.log(favoriteFood)';\n",
        'favoriteFood',
      ),
    ).toBe(false)
  })

  it('ignora em comentário', () => {
    expect(
      hasConsoleLogArg('// console.log(favoriteFood)\nvar x = 1;', 'favoriteFood'),
    ).toBe(false)
  })
})
