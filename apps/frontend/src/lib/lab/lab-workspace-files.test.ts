import { describe, expect, it } from 'vitest'
import {
  mergeLabStarterWithWorkspace,
  pickStudentWorkspaceFiles,
} from './lab-workspace-files'

describe('mergeLabStarterWithWorkspace', () => {
  it('usa starter quando workspace vazio', () => {
    expect(
      mergeLabStarterWithWorkspace({ '/App.js': 'a' }, {}),
    ).toEqual({ '/App.js': 'a' })
  })

  it('sobrescreve allowlist e ignora path inválido', () => {
    expect(
      mergeLabStarterWithWorkspace(
        { '/App.js': 'starter' },
        { '/App.js': 'aluno', '/secret.js': 'x' },
      ),
    ).toEqual({ '/App.js': 'aluno' })
  })
})

describe('pickStudentWorkspaceFiles', () => {
  it('só allowlist e strip', () => {
    const out = pickStudentWorkspaceFiles({
      '/App.js': {
        code: "var a = 1;\n/* __lab_auto_exports__ */\nexport { a };\n",
      },
      '/lab.step.test.js': { code: 'nope' },
    })
    expect(out).toEqual({ '/App.js': 'var a = 1;\n' })
  })
})
