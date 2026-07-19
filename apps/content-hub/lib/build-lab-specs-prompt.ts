import { LAB_SPECS_PLACEHOLDER } from '@/lib/lab-specs-placeholder'

export type LabSpecsPromptInput = {
  title: string
  description: string
  labDescription?: string
  labCategory?: string
  labLearnTitle?: string
  labLearnBody?: string
  labDurationMinutes?: string
  courseTitle?: string
  moduleTitle?: string
  groupTitle?: string
}

/**
 * Prompt pronto para colar em um LLM e gerar `lab_specs` no formato do content-hub.
 */
export function buildLabSpecsPrompt(input: LabSpecsPromptInput): string {
  const title = input.title.trim() || 'Tema do lab'
  const description =
    input.description.trim() ||
    'Pratique o conceito principal desta aula de forma guiada por steps.'
  const labDescription = input.labDescription?.trim() || description
  const learnTitle = input.labLearnTitle?.trim() || title
  const learnBody =
    input.labLearnBody?.trim() ||
    '(Não há learn body ainda — invente um texto curto em Markdown alinhado ao exercício.)'
  const category = input.labCategory?.trim() || 'GERAL'
  const duration = input.labDurationMinutes?.trim() || '15'

  const contextParts = [
    input.courseTitle ? `Curso: ${input.courseTitle}` : null,
    input.moduleTitle ? `Módulo: ${input.moduleTitle}` : null,
    input.groupTitle ? `Submódulo: ${input.groupTitle}` : null,
  ].filter(Boolean)

  return `Você é um especialista em autoria de labs interativos de programação (estilo Codecademy / freeCodeCamp).

Gere APENAS um único objeto JSON válido de lab_specs (parseável por JSON.parse).
PROIBIDO: markdown, fences \`\`\`, comentários // fora de strings, texto antes/depois do JSON.

---

DADOS DA AULA

Título: ${title}
Descrição: ${description}
Descrição do lab: ${labDescription}
Categoria: ${category}
Título Learn: ${learnTitle}
Duração estimada (min): ${duration}
${contextParts.length ? `\nContexto:\n${contextParts.join('\n')}\n` : ''}
Learn body (referência — use como base do exercício):
"""
${learnBody}
"""

---

SCHEMA

{
  "template": "react",
  "files": {
    "/App.js": "starter do aluno com comentários // Write your … below:"
  },
  "steps": [
    {
      "id": "step-1",
      "title": "Instrução do passo",
      "hint": "Dica curta",
      "testFile": "código Jest completo deste passo"
    }
  ]
}

Regras:
- template "react" + "/App.js" (padrão). Só use "vanilla" + "/index.js" se for JS puro sem React.
- 2 a 5 steps progressivos; ids step-1, step-2, …
- Aluno NÃO precisa de export (a plataforma injeta).
- Quebras de linha DENTRO de strings JSON: use \\\\n (duas barras + n no texto que você escreve).

---

TESTES — USE SÓ HELPERS (obrigatório na maioria dos casos)

import {
  readStudentCode,
  assertVarKeyword,
  assertBindingValue,
  assertConsoleLogArg,
  softImportModule,
} from '/lab-test-helpers.js'

| Caso | Como testar |
|------|-------------|
| variável var/let/const | assertVarKeyword + assertBindingValue |
| console.log(variavel) | assertConsoleLogArg(code, 'variavel') |
| função + comportamento | softImportModule('/App.js') e chame a função |
| console.log(5) ou texto literal | expect(code).toContain('console.log(5)') — SEM regex |

PROIBIDO no testFile: eval, new Function, rewire, require de path do aluno.
EVITE toMatch(/.../) e qualquer regex. Regex costuma gerar JSON inválido.

Se for inevitável usar regex: no arquivo JSON, cada \\ do código Jest vira \\\\ .
Ex.: no Jest o regex tem \\s e \\. ; no JSON isso aparece como \\\\s e \\\\.
Mas prefira SEMPRE toContain ou helpers.

---

JSON VÁLIDO vs INVÁLIDO (leia com atenção)

INVÁLIDO (quebra o save):
"expect(code).toMatch(/console\\.log\\s*/);"

VÁLIDO (sem regex):
"expect(code).toContain('console.log(5)');"

VÁLIDO (helpers):
"assertConsoleLogArg(code, 'mensagem');"

Antes de responder, simule mentalmente JSON.parse no seu output. Se houver escape inválido, corrija.

---

EXEMPLO DE SAÍDA VÁLIDA (copie o estilo de escape deste exemplo)

${LAB_SPECS_PLACEHOLDER}

---

TAREFA

Crie lab_specs coerente com os dados da aula: starter mínimo, steps claros, testFiles que validam cada step com helpers (ou toContain).

Responda SOMENTE com o JSON.`
}
