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

  it('preserva App.js vazio e ignora index.js bootstrap do workspace', () => {
    expect(
      mergeLabStarterWithWorkspace(
        { '/App.js': 'starter' },
        {
          '/App.js': '',
          '/index.js': 'import { createRoot } from "react-dom/client";',
        },
      ),
    ).toEqual({ '/App.js': '' })
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

  it('não persiste /index.js quando /App.js existe (bootstrap react)', () => {
    const out = pickStudentWorkspaceFiles({
      '/App.js': { code: '' },
      '/index.js': {
        code: 'import { createRoot } from "react-dom/client";\n',
      },
    })
    expect(out).toEqual({ '/App.js': '' })
  })

  it('persiste /index.js em lab vanilla (só index)', () => {
    const out = pickStudentWorkspaceFiles({
      '/index.js': { code: 'var x = 1;\n' },
    })
    expect(out).toEqual({ '/index.js': 'var x = 1;\n' })
  })
})
