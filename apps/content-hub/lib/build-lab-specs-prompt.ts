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
PROIBIDO: markdown fences \`\`\`, comentários // fora de strings, texto antes/depois do JSON.

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
      "title": "Instrução com highlight Markdown",
      "hint": "Dica curta",
      "testFile": "código Jest completo deste passo"
    }
  ]
}

Regras gerais:
- template "react" + "/App.js" (padrão). Só use "vanilla" + "/index.js" se for JS puro sem React.
- 2 a 5 steps progressivos; ids step-1, step-2, …
- Aluno NÃO precisa de export (a plataforma injeta).
- Quebras de linha DENTRO de strings JSON: use \\\\n.

---

TÍTULOS (highlight obrigatório)

O frontend renderiza step.title com Markdown. Código e valores literais DEVEM ir entre crases para aparecerem em verde.

CORRETO:
"Na primeira linha, use \`console.log()\` para imprimir a string \`JavaScript\` no console."

ERRADO (sem highlight):
"Na primeira linha, use console.log() para imprimir a string JavaScript no console."

Coloque entre crases: nomes de funções/API (\`console.log()\`), literais (\`JavaScript\`, \`2011\`), propriedades, keywords quando forem o foco do passo.

---

TESTES — HELPERS OFICIAIS

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
| console.log(número) | expect(code).toContain('console.log(2011)') |

PROIBIDO no testFile: eval, new Function, rewire, require de path do aluno, toMatch/regex.

---

STRINGS EM console.log — NÃO SEJA RÍGIDO COM ASPAS

Em JavaScript, 'texto' e "texto" são equivalentes. O aluno pode usar qualquer uma.
NUNCA faça só:
expect(code).toContain("console.log('JavaScript')");  // falha se o aluno usar aspas duplas

SEMPRE aceite as duas formas (e ignore ; opcional se quiser):

const ok =
  code.includes("console.log('JavaScript')") ||
  code.includes('console.log("JavaScript")');
expect(ok).toBe(true);

O mesmo vale para frases longas:
const ok =
  code.includes("console.log('Woohoo! I love to code! #codecademy')") ||
  code.includes('console.log("Woohoo! I love to code! #codecademy")');
expect(ok).toBe(true);

Para números (sem aspas), toContain simples basta:
expect(code).toContain('console.log(2011)');

---

JSON VÁLIDO (crítico)

- Aspas dentro de strings JSON: escape com \\"
- Prefira aspas simples no código Jest quando possível, para o JSON ficar mais simples
- INVÁLIDO: expect(code).toContain("console.log('x')");  dentro de "testFile": "..." sem escapar as aspas internas
- VÁLIDO: usar includes com \\" escapado, ou misturar ' e " com cuidado

Antes de responder, simule JSON.parse. Se quebrar, corrija.

---

EXEMPLO DE SAÍDA VÁLIDA (estilo de escape)

${LAB_SPECS_PLACEHOLDER}

---

TAREFA

Crie lab_specs coerente com os dados da aula:
- starter mínimo
- titles com \`código\` em highlight
- testFiles flexíveis (aspas ' ou " quando for string)
- helpers oficiais quando fizer sentido

Responda SOMENTE com o JSON.`
}
