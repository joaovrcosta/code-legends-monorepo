/**
 * Auto-export temporário para testes Jest (labs estilo Codecademy).
 * Usa acorn + acorn-jsx para bindings só no top-level do módulo.
 */
import { Parser, type Program } from 'acorn'
import jsx from 'acorn-jsx'

const parser = Parser.extend(jsx())

export const LAB_AUTO_EXPORT_MARKER = '/* __lab_auto_exports__ */'

type AcornNode = { type: string; name?: string; id?: AcornNode | null }

/** Remove bloco de export injetado só para os testes. */
export function stripLabAutoExports(code: string): string {
  const idx = code.indexOf(LAB_AUTO_EXPORT_MARKER)
  if (idx === -1) return code
  return code.slice(0, idx).replace(/\s+$/, '\n')
}

function bindingNameFromDeclaratorId(id: AcornNode): string | null {
  if (id.type === 'Identifier' && id.name) return id.name
  return null
}

export function listTopLevelBindings(code: string): string[] | null {
  let ast: Program
  try {
    ast = parser.parse(code, {
      ecmaVersion: 'latest',
      sourceType: 'module',
    }) as Program
  } catch {
    return null
  }

  const names: string[] = []

  for (const node of ast.body as AcornNode[]) {
    if (node.type === 'VariableDeclaration') {
      const decls = (node as AcornNode & { declarations: AcornNode[] })
        .declarations
      for (const decl of decls) {
        const name = bindingNameFromDeclaratorId(decl.id as AcornNode)
        if (name === null) return null
        names.push(name)
      }
      continue
    }
    if (node.type === 'FunctionDeclaration') {
      if (node.id?.name) names.push(node.id.name)
      continue
    }
    if (node.type === 'ClassDeclaration') {
      if (node.id?.name) names.push(node.id.name)
    }
  }

  return [...new Set(names)]
}

function addExportName(set: Set<string>, name: string | undefined | null) {
  if (name) set.add(name)
}

export function listAlreadyExported(code: string): Set<string> | null {
  let ast: Program
  try {
    ast = parser.parse(code, {
      ecmaVersion: 'latest',
      sourceType: 'module',
    }) as Program
  } catch {
    return null
  }

  const exported = new Set<string>()

  for (const node of ast.body as AcornNode[]) {
    if (node.type === 'ExportNamedDeclaration') {
      const exp = node as AcornNode & {
        declaration?: AcornNode & { declarations?: AcornNode[] }
        specifiers?: Array<AcornNode & { local?: AcornNode }>
      }
      if (exp.declaration) {
        if (exp.declaration.type === 'VariableDeclaration') {
          for (const decl of exp.declaration.declarations ?? []) {
            const name = bindingNameFromDeclaratorId(decl.id as AcornNode)
            if (name === null) return null
            addExportName(exported, name)
          }
        } else if (
          exp.declaration.type === 'FunctionDeclaration' ||
          exp.declaration.type === 'ClassDeclaration'
        ) {
          addExportName(exported, exp.declaration.id?.name)
        }
      }
      if (exp.specifiers) {
        for (const spec of exp.specifiers) {
          if (spec.type === 'ExportSpecifier') {
            addExportName(exported, spec.local?.name)
          }
        }
      }
      continue
    }
    if (node.type === 'ExportDefaultDeclaration') {
      exported.add('default')
    }
  }

  return exported
}

/**
 * Injeta export temporário das bindings top-level. Fail-closed: se o parse falhar,
 * retorna o código base sem injetar (melhor teste falhar do que bundle quebrado).
 */
export function withLabAutoExports(code: string): string {
  const base = stripLabAutoExports(code)
    .replace(/\nexport\s*\{\s*\}\s*;?\s*$/m, '\n')
    .replace(/^\s*export\s*\{\s*\}\s*;?\s*$/m, '')

  const declared = listTopLevelBindings(base)
  const already = listAlreadyExported(base)
  if (declared === null || already === null) return base

  const missing = declared.filter((name) => !already.has(name))
  if (missing.length === 0) return base
  return `${base.trimEnd()}\n${LAB_AUTO_EXPORT_MARKER}\nexport { ${missing.join(', ')} };\n`
}
