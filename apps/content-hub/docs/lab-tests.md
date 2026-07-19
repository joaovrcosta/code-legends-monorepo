# Lab tests (autoria de `testFile`)

Contrato para autores no content-hub ao escrever steps de aulas **lab**.

## Modelo de execução

- Testes rodam no **Jest do Sandpack** (iframe), não no servidor Next/API.
- O aluno **não** precisa usar `export`. No **Verificar**, a plataforma injeta exports temporários das bindings top-level e restaura o código depois.
- Helpers oficiais ficam em `/lab-test-helpers.js` (oculto; fora da pasta do aluno).

## Entry do aluno

| Template | Arquivo |
|----------|---------|
| `react` (padrão com testes) | `/App.js` |
| `vanilla` | `/index.js` |

## API oficial (`/lab-test-helpers.js`)

```js
import {
  readStudentCode,
  assertVarKeyword,
  assertBindingValue,
  assertConsoleLogArg,
  assertCodeContains,
  softImportModule,
} from '/lab-test-helpers.js'
```

| Helper | Uso |
|--------|-----|
| `readStudentCode(path?)` | Lê fonte; **só** `/App.js` ou `/index.js` (allowlist hardcoded). Limite 512 KiB. |
| `assertVarKeyword(code, keyword, name)` | Exige `var`/`let`/`const` + nome (ignora comentários/strings). |
| `assertConsoleLogArg(code, name)` | Exige `console.log(name)` no código ativo. |
| `assertCodeContains(code, trecho)` | Exige o trecho no fonte **ignorando espaços, `;` e aspas `'` vs `"`**. Use para `console.log(3+4)`, strings literais, etc. |
| `softImportModule(path?)` | `import` com **cache-bust** (`?labCheck=…`) para cada Verificar. |
| `assertBindingValue(name, expected, { path?, type? })` | Valor runtime após auto-export + cache-bust. |

### Exemplo (expressão / literal flexível)

```js
import { readStudentCode, assertCodeContains } from '/lab-test-helpers.js'

const code = readStudentCode('/App.js')

test('imprime a soma', () => {
  // passa com console.log(3+4) ou console.log(3 + 4);
  assertCodeContains(code, 'console.log(3 + 4)')
})

test('imprime a string', () => {
  // passa com 'JavaScript' ou "JavaScript"
  assertCodeContains(code, "console.log('JavaScript')")
})
```

### Exemplo (step `numOfSlices`)

```js
import {
  readStudentCode,
  assertVarKeyword,
  assertBindingValue,
} from '/lab-test-helpers.js'

const code = readStudentCode('/App.js')

test('declara numOfSlices com var', () => {
  assertVarKeyword(code, 'var', 'numOfSlices')
})

test('numOfSlices é 8', async () => {
  await assertBindingValue('numOfSlices', 8, { type: 'number' })
})
```

## Regras

- Preferir **só** os helpers oficiais.
- Para checar trecho de código digitado, preferir **`assertCodeContains`** (não `toContain` cru).
- **Proibido** no `testFile`: `eval`, `new Function`, `rewire`, `require` de path arbitrário do aluno, ler `/lab-test-helpers.js` ou `*.test.js`.
- Um step = um `testFile`; nomes de `test(...)` claros.
- Keyword checks: evite pedir `var` em declarações multi-var se o exercício for avançado demais — o helper cobre `var a = 1, x = 8`, mas AST completo não está na v1.

## Deploy / migrate

Notas de migration da API: ver link em `apps/api/docs/lab-lesson-deploy.md`.
