# Lab tests (autoria de `testFile`)

Contrato para autores no content-hub ao escrever steps de aulas **lab**.

## Modelo de execução

- Testes rodam no **Jest do Sandpack** (iframe), não no servidor Next/API.
- O aluno **não** precisa usar `export`. No **Verificar**, a plataforma usa um espelho oculto com auto-exports para o Jest; o editor do aluno não muda.
- Helpers oficiais ficam em `/lab-test-helpers.js` (oculto; fora da pasta do aluno).

## Campos do step

| Campo | Obrigatório | Uso |
|-------|-------------|-----|
| `id` | sim | `step-1`, `step-2`, … |
| `title` | sim | Instrução (Markdown; use `` `código` `` para highlight) |
| `hint` | não | Dica sob demanda (“Stuck? Get a hint”) |
| `expected` | recomendado | Pergunta amigável (tom de carinha); **exibida no playground quando o Verificar falha** |
| `testFile` | sim* | Fonte Jest deste passo (*ou `tests`) |

Exemplo:

```json
{
  "id": "step-1",
  "title": "Use `console.log()` para imprimir sua idade no console.",
  "hint": "Exemplo: console.log(25);",
  "expected": "você usou console.log() para imprimir sua idade?",
  "testFile": "import { readStudentCode } from '/lab-test-helpers.js';\n\nconst code = readStudentCode('/App.js');\n\ntest('usa console.log pelo menos uma vez', () => {\n  expect(code).toContain('console.log(');\n});\n"
}
```

O `expected` é uma pergunta curta em 2ª pessoa (não o código cru). Exemplos:
- `"você usou console.log() para imprimir sua idade?"`
- `"você adicionou um segundo console.log() com outro número?"`

## Entry do aluno

| Template | Arquivo | Default do helper sem path |
|----------|---------|----------------------------|
| `react` (padrão se omitido / React+JSX) | `/App.js` | `/App.js` |
| `vanilla` (JS puro) | `/index.js` | `/index.js` |

Com `labRespectTemplate` ligado, testes **não** forçam template react — o campo `template` do specs é a fonte da verdade.

## API oficial (`/lab-test-helpers.js`)

```js
import {
  readStudentCode,
  assertVarKeyword,
  assertBindingValue,
  assertConsoleLogArg,
  assertConsoleLogCount,
  assertCodeContains,
  softImportModule,
} from '/lab-test-helpers.js'
```

| Helper | Uso |
|--------|-----|
| `readStudentCode(path?)` | Lê fonte; **só** `/App.js` ou `/index.js` (allowlist hardcoded). Limite 512 KiB. |
| `assertVarKeyword(code, keyword, name)` | Exige `var`/`let`/`const` + nome (ignora comentários/strings). |
| `assertConsoleLogArg(code, name)` | Exige `console.log(name)` no código ativo. |
| `assertConsoleLogCount(code, min)` | Conta `console.log(` reais (ignora strings/comentários). |
| `assertCodeContains(code, trecho)` | Exige o trecho no fonte **ignorando espaços, `;` e aspas `'` vs `"`**. Use para `console.log(3+4)`, strings literais, etc. |
| `softImportModule(path?)` | `import` com **cache-bust** (`?labCheck=…`) para cada Verificar. |
| `await assertBindingValue(name, expected, { path?, type? })` | Valor runtime após auto-export + cache-bust. **Sempre** `async` + `await`. 1º arg = nome da variável, **nunca** `code`. |

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

**Errado (não gerar):** `assertBindingValue(code, 'numOfSlices', 8)` — o 1º argumento é o nome, não o fonte. Sem `await`, o Jest pode marcar o teste como passou sem checar.

## Histórico de código do aluno (API)

O playground persiste:

1. **Workspace** (`PUT /lessons/:id/lab-progress` → `labProgress.files`) — último código allowlist para resume; gravado **só no Verificar** (sem autosave na digitação).
2. **Tentativas** (`POST /lessons/:id/lab-attempts`) — snapshot no **Verificar**.

Importante sobre `LabCodeAttempt.result` (`pass` | `fail` | `timeout` | `error`):

- É **auto-relatado pelo client** (Jest roda no iframe Sandpack). A API **não** reexecuta os testes.
- Serve só para **histórico / pedagogia / telemetria**.
- **Proibido** usar esse campo para liberar certificado, XP, desbloqueio de módulo, nota oficial ou qualquer gate que exija prova de correção.
- Progresso “oficial” continua sendo `labProgress` (steps) + `POST /lessons/:id/complete`.

## Regras

- Preferir **só** os helpers oficiais.
- Para checar trecho de código digitado, preferir **`assertCodeContains`** (não `toContain` cru).
- Para contar `console.log`, preferir **`assertConsoleLogCount`** — **nunca** `code.split('console.log(')` (comentários do starter inflacionam a contagem).
- **Proibido** no `testFile`: `eval`, `new Function`, `rewire`, `require` de path arbitrário do aluno, ler `/lab-test-helpers.js` ou `*.test.js`.
- Um step = um `testFile`; nomes de `test(...)` claros.
- O `testFile` de cada step testa o requisito **novo**; só reteste steps anteriores se o passo novo **depender** deles (ex.: `console.log(favoriteFood)`). Declarações independentes (`nome`, depois `idade`) não se retestam.
- Keyword checks: evite pedir `var` em declarações multi-var se o exercício for avançado demais — o helper cobre `var a = 1, x = 8`, mas AST completo não está na v1.

## Deploy / migrate

Notas de migration da API: ver link em `apps/api/docs/lab-lesson-deploy.md`.
