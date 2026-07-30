/** Exemplo de specs para aulas do tipo lab (content-hub).
 * Respeite o template: react → /App.js; JS puro → vanilla + /index.js.
 * Preferir helpers oficiais: ver apps/content-hub/docs/lab-tests.md
 */
export const LAB_SPECS_PLACEHOLDER = `{
  "template": "react",
  "files": {
    "/App.js": "// Pratique o uso de console.log().\\n\\n// Write your first console.log() below:\\n\\n\\n// Write your second console.log() below:\\n"
  },
  "steps": [
    {
      "id": "step-1",
      "title": "Use \`console.log()\` para imprimir o número \`25\` no console.",
      "hint": "Exemplo: \`console.log(25);\`",
      "expected": "você usou console.log() para imprimir o número 25?",
      "testFile": "import { readStudentCode, assertConsoleLogCount, stripStringsAndComments } from '/lab-test-helpers.js';\\n\\nconst code = readStudentCode('/App.js');\\n\\ntest('usa console.log pelo menos uma vez', () => {\\n  assertConsoleLogCount(code, 1);\\n});\\n\\ntest('o console.log imprime um número', () => {\\n  const active = stripStringsAndComments(code);\\n  expect(/console\\\\.log\\\\(\\\\s*\\\\d+\\\\s*\\\\)/.test(active)).toBe(true);\\n});\\n"
    },
    {
      "id": "step-2",
      "title": "Na linha seguinte, use outro \`console.log()\` para imprimir o número \`12\`.",
      "hint": "Adicione um segundo \`console.log()\` com outro número, por exemplo: \`console.log(12);\`",
      "expected": "você adicionou um segundo console.log() com outro número?",
      "testFile": "import { readStudentCode, assertConsoleLogCount } from '/lab-test-helpers.js';\\n\\nconst code = readStudentCode('/App.js');\\n\\ntest('usa console.log duas vezes', () => {\\n  assertConsoleLogCount(code, 2);\\n});\\n"
    }
  ]
}`
