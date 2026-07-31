import {
  MAX_STUDENT_CODE_BYTES,
  STUDENT_CODE_ALLOWLIST,
  defaultStudentPath,
  type LabTemplate,
} from './lab-test-helpers-core'

export const LAB_TEST_HELPERS_PATH = '/lab-test-helpers.js'

export {
  MAX_STUDENT_CODE_BYTES,
  STUDENT_CODE_ALLOWLIST,
  assertBindingAssignedInSource,
  assertCodeContains,
  assertCodeSize,
  assertConsoleLogCount,
  compactCode,
  countConsoleLogCalls,
  defaultStudentPath,
  hasConsoleLogArg,
  hasKeywordBinding,
  isBindingIdent,
  isLikelySourceCode,
  isMistakenAssertBindingValueCall,
  isPrimitiveExpected,
  quoteVariants,
  resolveStudentCodePath,
  sourceContainsLoose,
  stripStringsAndComments,
} from './lab-test-helpers-core'
export type { DeclKeyword, LabTemplate } from './lab-test-helpers-core'

/**
 * Conteúdo injetado no Sandpack (hidden).
 * Lógica de parse alinhada a lab-test-helpers-core (unit tests no core).
 */
export function buildLabTestHelpersSource(
  template: LabTemplate = 'react',
): string {
  const allow = JSON.stringify([...STUDENT_CODE_ALLOWLIST])
  const defaultPath = defaultStudentPath(template)
  return `
/* Code Legends lab test helpers */
const STUDENT_CODE_ALLOWLIST = ${allow};
const MAX_STUDENT_CODE_BYTES = ${MAX_STUDENT_CODE_BYTES};
const DEFAULT_STUDENT_PATH = ${JSON.stringify(defaultPath)};

function resolveStudentCodePath(path) {
  const normalized = (path == null || path === "" ? DEFAULT_STUDENT_PATH : String(path)).trim();
  const withSlash = normalized.startsWith("/") ? normalized : "/" + normalized;
  if (!STUDENT_CODE_ALLOWLIST.includes(withSlash)) {
    throw new Error("Path não permitido: \`" + withSlash + "\`. Use apenas /App.js ou /index.js.");
  }
  return withSlash;
}

function stripStringsAndComments(source) {
  let out = "";
  let i = 0;
  const len = source.length;
  const pushSpace = (ch) => {
    out += ch === "\\n" ? "\\n" : " ";
  };
  while (i < len) {
    const c = source[i];
    const n = source[i + 1];
    if (c === "/" && n === "/") {
      pushSpace(c);
      pushSpace(n);
      i += 2;
      while (i < len && source[i] !== "\\n") {
        pushSpace(source[i]);
        i += 1;
      }
      continue;
    }
    if (c === "/" && n === "*") {
      pushSpace(c);
      pushSpace(n);
      i += 2;
      while (i < len && !(source[i] === "*" && source[i + 1] === "/")) {
        pushSpace(source[i]);
        i += 1;
      }
      if (i < len) {
        pushSpace(source[i]);
        pushSpace(source[i + 1] || "");
        i += 2;
      }
      continue;
    }
    if (c === "'" || c === '"' || c === String.fromCharCode(96)) {
      const quote = c;
      pushSpace(c);
      i += 1;
      while (i < len) {
        if (source[i] === "\\\\") {
          pushSpace(source[i]);
          if (i + 1 < len) {
            pushSpace(source[i + 1]);
            i += 2;
            continue;
          }
          i += 1;
          break;
        }
        if (source[i] === quote) {
          pushSpace(source[i]);
          i += 1;
          break;
        }
        if (quote === String.fromCharCode(96) && source[i] === "$" && source[i + 1] === "{") {
          pushSpace(source[i]);
          pushSpace(source[i + 1]);
          i += 2;
          let depth = 1;
          while (i < len && depth > 0) {
            if (source[i] === "{") depth += 1;
            else if (source[i] === "}") depth -= 1;
            pushSpace(source[i]);
            i += 1;
          }
          continue;
        }
        pushSpace(source[i]);
        i += 1;
      }
      continue;
    }
    out += c;
    i += 1;
  }
  return out;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^\${}()|[\\]\\\\]/g, "\\\\$&");
}

function hasKeywordBinding(source, keyword, name) {
  if (!/^[A-Za-z_$][\\w$]*$/.test(name)) return false;
  const cleaned = stripStringsAndComments(source);
  // Para no ; OU na próxima keyword — ASI / sem ponto e vírgula entre decls.
  const nextStmt =
    "(?=\\\\s*(?:;|$|\\\\b(?:var|let|const|function|class|if|for|while|switch|return|export|import)\\\\b))";
  const declRe = new RegExp(
    "\\\\b" + keyword + "\\\\b\\\\s+([\\\\s\\\\S]*?)" + nextStmt,
    "g"
  );
  let match;
  while ((match = declRe.exec(cleaned))) {
    const parts = match[1].split(",");
    for (const part of parts) {
      const id = part.trim().match(/^([A-Za-z_$][\\w$]*)/);
      if (id && id[1] === name) return true;
    }
  }
  return false;
}

function hasConsoleLogArg(source, argName) {
  if (!/^[A-Za-z_$][\\w$]*$/.test(argName)) return false;
  const cleaned = stripStringsAndComments(source);
  const re = new RegExp(
    "\\\\bconsole\\\\s*\\\\.\\\\s*log\\\\s*\\\\(\\\\s*" +
      escapeRegExp(argName) +
      "\\\\s*\\\\)"
  );
  return re.test(cleaned);
}

function countConsoleLogCalls(source) {
  const cleaned = stripStringsAndComments(source);
  const re = /\\bconsole\\s*\\.\\s*log\\s*\\(/g;
  let n = 0;
  while (re.exec(cleaned)) n += 1;
  return n;
}

function compactCode(source) {
  return String(source).replace(/\\s+/g, "");
}

function quoteVariants(snippet) {
  const s = String(snippet);
  const set = {};
  const add = (v) => {
    set[v] = true;
  };
  add(s);
  if (s.indexOf("'") !== -1) add(s.split("'").join('"'));
  if (s.indexOf('"') !== -1) add(s.split('"').join("'"));
  return Object.keys(set);
}

function sourceContainsLoose(source, needle) {
  const hay = compactCode(source).split(";").join("");
  const variants = quoteVariants(needle);
  for (let i = 0; i < variants.length; i++) {
    const n = compactCode(variants[i]).split(";").join("");
    if (n.length > 0 && hay.indexOf(n) !== -1) return true;
  }
  return false;
}

function looksLikeReactBootstrap(code) {
  return (
    /createRoot\\s*\\(/.test(code) &&
    /react-dom\\/client/.test(code)
  );
}

export function readStudentCode(path) {
  const resolved = resolveStudentCodePath(path);
  const fs = require("fs");
  let code = fs.readFileSync(resolved, "utf8");
  // Labs vanilla costumam testar '/index.js'. Com template react (Jest),
  // /index.js vira o bootstrap e o código do aluno fica em /App.js.
  if (
    resolved === "/index.js" &&
    looksLikeReactBootstrap(code) &&
    STUDENT_CODE_ALLOWLIST.includes("/App.js")
  ) {
    try {
      code = fs.readFileSync("/App.js", "utf8");
    } catch (_e) {
      // mantém o /index.js se /App.js não existir
    }
  }
  const bytes =
    typeof TextEncoder !== "undefined"
      ? new TextEncoder().encode(code).length
      : code.length;
  if (bytes > MAX_STUDENT_CODE_BYTES) {
    throw new Error(
      "Arquivo do aluno excede o limite de " + MAX_STUDENT_CODE_BYTES + " bytes."
    );
  }
  return code;
}

export async function softImportModule(path) {
  let resolved = resolveStudentCodePath(path);
  const fs = require("fs");
  // Mesmo remap de readStudentCode: bootstrap React em /index.js → /App.js
  if (
    resolved === "/index.js" &&
    STUDENT_CODE_ALLOWLIST.includes("/App.js")
  ) {
    try {
      const indexCode = fs.readFileSync("/index.js", "utf8");
      if (looksLikeReactBootstrap(indexCode)) {
        resolved = "/App.js";
      }
    } catch (_e) {
      // mantém /index.js
    }
  }
  // Espelho oculto com auto-export (escrito no Verificar; editor não muda).
  // Mesma pasta do aluno: /App.js → /App.__lab_check.js (imports relativos ok).
  const mirror = resolved.replace(/(\\.[^./]+)?$/, ".__lab_check.js");
  let importPath = resolved;
  try {
    fs.readFileSync(mirror, "utf8");
    importPath = mirror;
  } catch (_e) {
    // sem espelho: importa o arquivo do aluno
  }
  const bust = Date.now() + "-" + Math.random().toString(36).slice(2);
  try {
    return await import(importPath + "?labCheck=" + bust);
  } catch (e) {
    const msg = e && e.message ? String(e.message) : String(e);
    throw new Error(
      "Try checking your code again. You likely have a syntax error.\\n" + msg
    );
  }
}

export function assertVarKeyword(code, keyword, name) {
  if (!hasKeywordBinding(code, keyword, name)) {
    throw new Error(
      "Did you use the \`" +
        keyword +
        "\` keyword to create the \`" +
        name +
        "\` variable?"
    );
  }
}

export function assertConsoleLogArg(code, argName) {
  if (!hasConsoleLogArg(code, argName)) {
    throw new Error("Did you use console.log() to print \`" + argName + "\`?");
  }
}

export function assertConsoleLogCount(code, min) {
  const n = countConsoleLogCalls(code);
  if (n < min) {
    throw new Error(
      min === 1
        ? "Did you use console.log() at least once?"
        : "Did you use console.log() at least " + min + " times? Found " + n + "."
    );
  }
}

export { stripStringsAndComments, countConsoleLogCalls };

export function assertCodeContains(code, needle) {
  if (!sourceContainsLoose(code, needle)) {
    const display = String(needle).replace(/\\s+/g, " ").trim();
    throw new Error(
      "Did you include \`" +
        display +
        "\` in your code? (spaces and quote style do not matter)"
    );
  }
}

function isLikelySourceCode(value) {
  if (typeof value !== "string") return false;
  if (value.length > 80 || value.indexOf("\\n") !== -1) return true;
  return /(?:^|\\n)\\s*(?:var|let|const|function|import|export)\\b/.test(value);
}

function isBindingIdent(value) {
  return typeof value === "string" && /^[A-Za-z_$][\\w$]*$/.test(value);
}

function isPrimitiveExpected(value) {
  const t = typeof value;
  return value === null || t === "string" || t === "number" || t === "boolean";
}

function hasBindingLiteralAssignment(code, name, expected) {
  if (typeof expected === "string") {
    return (
      sourceContainsLoose(code, name + " = '" + expected + "'") ||
      sourceContainsLoose(code, name + ' = "' + expected + '"') ||
      sourceContainsLoose(code, name + " = \`" + expected + "\`")
    );
  }
  const hay = stripStringsAndComments(code);
  const escName = escapeRegExp(name);
  const lit =
    typeof expected === "number"
      ? String(expected).replace(/\\./g, "\\\\.")
      : String(expected);
  const boundary =
    typeof expected === "number" ? "(?![\\\\d.eE])" : "(?![\\\\w$])";
  return new RegExp(
    "\\\\b" + escName + "\\\\s*=\\\\s*" + lit + boundary
  ).test(hay);
}

function assertBindingAssignedInSource(code, name, expected) {
  const hasBinding =
    hasKeywordBinding(code, "var", name) ||
    hasKeywordBinding(code, "let", name) ||
    hasKeywordBinding(code, "const", name);
  if (!hasBinding) {
    throw new Error("Did you create a variable named \`" + name + "\`?");
  }
  if (!hasBindingLiteralAssignment(code, name, expected)) {
    throw new Error(
      "\`" +
        name +
        "\` should have a value of \`" +
        String(expected) +
        "\`. Expected \`" +
        name +
        "\` to equal \`" +
        String(expected) +
        "\`."
    );
  }
}

async function assertBindingValueRuntime(name, expected, options) {
  const path = options && options.path ? options.path : DEFAULT_STUDENT_PATH;

  let mod = null;
  let importError = null;
  try {
    mod = await softImportModule(path);
  } catch (e) {
    importError = e;
  }

  const hasRuntimeBinding =
    mod != null && name in mod && typeof mod[name] !== "undefined";

  if (hasRuntimeBinding) {
    const value = mod[name];
    if (options && options.type) {
      if (typeof value !== options.type) {
        throw new Error(
          "Expected \`" +
            name +
            "\` to be a " +
            options.type +
            " but found it to be: \`" +
            typeof value +
            "\`."
        );
      }
    }
    if (value !== expected) {
      throw new Error(
        "\`" +
          name +
          "\` should have a value of \`" +
          String(expected) +
          "\`. Expected \`" +
          name +
          "\` to equal \`" +
          String(expected) +
          "\` but found it to equal \`" +
          String(value) +
          "\`."
      );
    }
    return value;
  }

  // Fallback: o Verificar injeta export { nome } temporário, mas o Jest às
  // vezes importa o módulo antes do rebundle. Para literais, valida no fonte.
  if (isPrimitiveExpected(expected)) {
    const code = readStudentCode(path);
    assertBindingAssignedInSource(code, name, expected);
    if (options && options.type && typeof expected !== options.type) {
      throw new Error(
        "Expected \`" +
          name +
          "\` to be a " +
          options.type +
          " but found it to be: \`" +
          typeof expected +
          "\`."
      );
    }
    return expected;
  }

  if (importError) throw importError;
  throw new Error("Did you create a variable named \`" + name + "\`?");
}

/**
 * API correta: await assertBindingValue('nome', 'Ana', { type?: 'string' })
 * Compat: assertBindingValue(code, 'nome', 'Ana') — checa o fonte de forma
 * síncrona (falha no Jest mesmo sem await) e segue com checagem runtime.
 */
export function assertBindingValue(a, b, c) {
  if (
    arguments.length >= 3 &&
    isLikelySourceCode(a) &&
    isBindingIdent(b) &&
    isPrimitiveExpected(c)
  ) {
    assertBindingAssignedInSource(a, b, c);
    return assertBindingValueRuntime(b, c, undefined);
  }
  if (typeof a !== "string" || !isBindingIdent(a)) {
    throw new Error(
      "assertBindingValue(name, expected, options?). Do NOT pass student code as the first argument. Correct: await assertBindingValue('nome', 'Ana')"
    );
  }
  return assertBindingValueRuntime(a, b, c);
}
`.trimStart()
}
