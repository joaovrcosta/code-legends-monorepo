/** Exemplo de specs para aulas do tipo lab (content-hub).
 * Com testes o playground usa template react + /App.js.
 * Preferir helpers oficiais: ver apps/content-hub/docs/lab-tests.md
 */
export const LAB_SPECS_PLACEHOLDER = `{
  "template": "react",
  "files": {
    "/App.js": "let spaceship = {\\n  'Fuel Type': 'Turbo Fuel',\\n  homePlanet: 'Earth'\\n};\\n\\n// Write your greenEnergy() function below:\\n\\n\\n// Write your remotelyDisable() function below:\\n\\n\\n// Call your functions below, then console.log(spaceship)\\n"
  },
  "steps": [
    {
      "id": "step-1",
      "title": "Write a function \`greenEnergy()\` that has an object as a parameter and sets that object's \`'Fuel Type'\` property to \`'avocado oil'\`.",
      "hint": "Use bracket notation: obj['Fuel Type'] = 'avocado oil'",
      "expected": "obj['Fuel Type'] = 'avocado oil'",
      "testFile": "import { softImportModule } from '/lab-test-helpers.js';\\n\\ntest('greenEnergy is a function', async () => {\\n  const mod = await softImportModule('/App.js');\\n  expect(typeof mod.greenEnergy).toBe('function');\\n});\\n\\ntest('greenEnergy sets Fuel Type to avocado oil', async () => {\\n  const mod = await softImportModule('/App.js');\\n  const obj = { 'Fuel Type': 'Turbo Fuel' };\\n  mod.greenEnergy(obj);\\n  expect(obj['Fuel Type']).toBe('avocado oil');\\n});\\n"
    },
    {
      "id": "step-2",
      "title": "Write a function \`remotelyDisable()\` that has an object as a parameter and sets that object's \`disabled\` property to \`true\`.",
      "hint": "obj.disabled = true",
      "expected": "obj.disabled = true",
      "testFile": "import { softImportModule } from '/lab-test-helpers.js';\\n\\ntest('remotelyDisable is a function', async () => {\\n  const mod = await softImportModule('/App.js');\\n  expect(typeof mod.remotelyDisable).toBe('function');\\n});\\n\\ntest('remotelyDisable sets disabled to true', async () => {\\n  const mod = await softImportModule('/App.js');\\n  const obj = {};\\n  mod.remotelyDisable(obj);\\n  expect(obj.disabled).toBe(true);\\n});\\n"
    },
    {
      "id": "step-3",
      "title": "Call your two functions with the \`spaceship\` object, then \`console.log(spaceship)\`.",
      "hint": "greenEnergy(spaceship); remotelyDisable(spaceship); console.log(spaceship);",
      "expected": "greenEnergy(spaceship);\\nremotelyDisable(spaceship);\\nconsole.log(spaceship);",
      "testFile": "import { readStudentCode, assertConsoleLogArg } from '/lab-test-helpers.js';\\nconst code = readStudentCode('/App.js');\\n\\ntest('calls greenEnergy(spaceship)', () => {\\n  expect(code).toMatch(/greenEnergy\\\\s*\\\\(\\\\s*spaceship\\\\s*\\\\)/);\\n});\\n\\ntest('calls remotelyDisable(spaceship)', () => {\\n  expect(code).toMatch(/remotelyDisable\\\\s*\\\\(\\\\s*spaceship\\\\s*\\\\)/);\\n});\\n\\ntest('console.logs spaceship', () => {\\n  assertConsoleLogArg(code, 'spaceship');\\n});\\n"
    }
  ]
}`
