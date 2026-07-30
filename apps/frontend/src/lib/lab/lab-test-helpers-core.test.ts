import { describe, expect, it } from 'vitest'
import {
  MAX_STUDENT_CODE_BYTES,
  assertBindingAssignedInSource,
  assertCodeContains,
  assertCodeSize,
  assertConsoleLogCount,
  compactCode,
  countConsoleLogCalls,
  defaultStudentPath,
  hasConsoleLogArg,
  hasKeywordBinding,
  isLikelySourceCode,
  isMistakenAssertBindingValueCall,
  quoteVariants,
  resolveStudentCodePath,
  sourceContainsLoose,
  stripStringsAndComments,
} from './lab-test-helpers-core'

describe('resolveStudentCodePath', () => {
  it('aceita allowlist e default /App.js (react)', () => {
    expect(resolveStudentCodePath()).toBe('/App.js')
    expect(resolveStudentCodePath(null, 'react')).toBe('/App.js')
    expect(resolveStudentCodePath('/App.js')).toBe('/App.js')
    expect(resolveStudentCodePath('/index.js')).toBe('/index.js')
    expect(resolveStudentCodePath('App.js')).toBe('/App.js')
  })

  it('default /index.js para template vanilla', () => {
    expect(resolveStudentCodePath(undefined, 'vanilla')).toBe('/index.js')
    expect(resolveStudentCodePath(null, 'vanilla')).toBe('/index.js')
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

describe('defaultStudentPath', () => {
  it('mapeia template → entry', () => {
    expect(defaultStudentPath('react')).toBe('/App.js')
    expect(defaultStudentPath('vanilla')).toBe('/index.js')
    expect(defaultStudentPath()).toBe('/App.js')
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

describe('countConsoleLogCalls / assertConsoleLogCount', () => {
  const starter = `// Pratique o uso de console.log().

// Write your first console.log() below:


// Write your second console.log() below:
`

  it('ignora console.log citado em comentários do starter', () => {
    expect(countConsoleLogCalls(starter)).toBe(0)
    expect(countConsoleLogCalls(`${starter}\nconsole.log(25);\n`)).toBe(1)
    expect(
      countConsoleLogCalls(`${starter}\nconsole.log(25);\nconsole.log(12);\n`),
    ).toBe(2)
  })

  it('assertConsoleLogCount falha com 1 call quando min=2', () => {
    expect(() =>
      assertConsoleLogCount(`${starter}\nconsole.log(25);\n`, 2),
    ).toThrow(/at least 2/)
    expect(() =>
      assertConsoleLogCount(
        `${starter}\nconsole.log(25);\nconsole.log(12);\n`,
        2,
      ),
    ).not.toThrow()
  })
})

describe('sourceContainsLoose / assertCodeContains', () => {
  it('ignora espaços em expressões', () => {
    expect(sourceContainsLoose('console.log(3+4)', 'console.log(3 + 4)')).toBe(
      true,
    )
    expect(sourceContainsLoose('console.log(3 + 4);', 'console.log(3+4)')).toBe(
      true,
    )
  })

  it('aceita aspas simples ou duplas', () => {
    expect(
      sourceContainsLoose('console.log("JavaScript")', "console.log('JavaScript')"),
    ).toBe(true)
    expect(
      sourceContainsLoose("console.log('JavaScript');", 'console.log("JavaScript")'),
    ).toBe(true)
  })

  it('ignora ponto e vírgula', () => {
    expect(sourceContainsLoose('console.log(2011);', 'console.log(2011)')).toBe(
      true,
    )
  })

  it('assertCodeContains lança se faltar', () => {
    expect(() =>
      assertCodeContains('console.log(1)', 'console.log(3 + 4)'),
    ).toThrow(/Did you include/)
  })

  it('compactCode e quoteVariants', () => {
    expect(compactCode('a + b')).toBe('a+b')
    expect(quoteVariants("console.log('x')")).toContain('console.log("x")')
  })
})

describe('assertBindingValue arg normalization', () => {
  it('detecta fonte do aluno vs nome curto', () => {
    expect(isLikelySourceCode("var nome = 'Ana';")).toBe(true)
    expect(isLikelySourceCode('nome')).toBe(false)
    expect(
      isMistakenAssertBindingValueCall(
        "// starter\nvar nome = 'Ana';\n",
        'nome',
        'Ana',
        3,
      ),
    ).toBe(true)
    expect(isMistakenAssertBindingValueCall('nome', 'Ana', undefined, 2)).toBe(
      false,
    )
    expect(
      isMistakenAssertBindingValueCall('nome', 'Ana', { type: 'string' }, 3),
    ).toBe(false)
  })

  it('assertBindingAssignedInSource passa com valor certo e falha com vazio/errado', () => {
    expect(() =>
      assertBindingAssignedInSource("var idade = 25;", 'idade', 25),
    ).not.toThrow()
    expect(() =>
      assertBindingAssignedInSource("var nome = 'Ana';", 'nome', 'Ana'),
    ).not.toThrow()
    expect(() =>
      assertBindingAssignedInSource('// empty\n', 'idade', 25),
    ).toThrow(/variable named/)
    expect(() =>
      assertBindingAssignedInSource("var idade = 10;", 'idade', 25),
    ).toThrow(/should have a value/)
  })
})
