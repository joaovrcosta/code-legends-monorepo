import { describe, expect, it } from 'vitest'
import {
  LAB_STUDENT_FILES_MAX_BYTES,
  sanitizeLabStudentFiles,
  stripLabAutoExports,
} from './lab-student-files'

describe('sanitizeLabStudentFiles', () => {
  it('aceita allowlist e faz strip de auto-export', () => {
    const code = `var nome = 'Ana';\n/* __lab_auto_exports__ */\nexport { nome };\n`
    const out = sanitizeLabStudentFiles({ '/App.js': code })
    expect(out['/App.js']).toBe("var nome = 'Ana';\n")
    expect(out['/App.js']).not.toContain('export')
  })

  it('rejeita path fora da allowlist', () => {
    expect(() =>
      sanitizeLabStudentFiles({ '/lab.step.test.js': 'x' }),
    ).toThrow(/não permitido/)
  })

  it('rejeita espelho .__lab_check.js', () => {
    expect(() =>
      sanitizeLabStudentFiles({ '/App.__lab_check.js': 'x' }),
    ).toThrow(/não permitido/)
  })
})

describe('stripLabAutoExports', () => {
  it('remove marker e export', () => {
    expect(
      stripLabAutoExports('a\n/* __lab_auto_exports__ */\nexport { a };\n'),
    ).toBe('a\n')
  })
})

describe('size cap', () => {
  it('rejeita payload acima de 512 KiB', () => {
    const big = 'x'.repeat(LAB_STUDENT_FILES_MAX_BYTES + 1)
    expect(() => sanitizeLabStudentFiles({ '/App.js': big })).toThrow(
      /excede o limite/,
    )
  })
})
