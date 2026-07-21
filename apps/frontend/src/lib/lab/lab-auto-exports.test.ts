import { describe, expect, it } from 'vitest'
import {
  listTopLevelBindings,
  withLabAutoExports,
} from './lab-auto-exports'

describe('listTopLevelBindings', () => {
  it('ignora variáveis dentro de função', () => {
    const code = `function foo() {
  let x = 1;
  const y = 2;
}
var top = 3;`
    expect(listTopLevelBindings(code)).toEqual(['foo', 'top'])
  })

  it('captura multi-decl na mesma linha', () => {
    expect(listTopLevelBindings('let a = 1, b = 2;')).toEqual(['a', 'b'])
  })

  it('ignora declaração em comentário (parse real)', () => {
    const code = `// let x = 5
let real = 1;`
    expect(listTopLevelBindings(code)).toEqual(['real'])
  })

  it('template literal com interpolação aninhada', () => {
    const code = 'const msg = `a ${`b ${1}`}`;\nlet outer = 1;'
    expect(listTopLevelBindings(code)).toEqual(['msg', 'outer'])
  })

  it('JSX com expressão em chaves não vaza binding interno', () => {
    const code = `let count = 1;
export default function App() {
  return <div>{count}</div>;
}`
    expect(listTopLevelBindings(code)).toEqual(['count'])
  })

  it('fail-closed em destructuring top-level', () => {
    expect(listTopLevelBindings('const { a } = obj;')).toBeNull()
  })
})

describe('withLabAutoExports', () => {
  it('não exporta binding local de função', () => {
    const code = `function foo() {
  let x = 1;
}
console.log("hi");`
    const out = withLabAutoExports(code)
    expect(out).not.toMatch(/export\s*\{\s*x\s*\}/)
    expect(out).toMatch(/export\s*\{\s*foo\s*\}/)
  })

  it('fail-closed se parse inválido', () => {
    const code = 'let a = ;'
    expect(withLabAutoExports(code)).toBe(code)
  })
})
