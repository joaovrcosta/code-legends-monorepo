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
  assertCodeContains,
  assertCodeSize,
  assertConsoleLogCount,
  compactCode,
  countConsoleLogCalls,
  defaultStudentPath,
  hasConsoleLogArg,
  hasKeywordBinding,
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
  const declRe = new RegExp("\\\\b" + keyword + "\\\\b\\\\s+([^;]+)", "g");
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

export function readStudentCode(path) {
  const resolved = resolveStudentCodePath(path);
  const fs = require("fs");
  const code = fs.readFileSync(resolved, "utf8");
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
  const resolved = resolveStudentCodePath(path);
  const bust = Date.now() + "-" + Math.random().toString(36).slice(2);
  try {
    return await import(resolved + "?labCheck=" + bust);
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

export async function assertBindingValue(name, expected, options) {
  const path = options && options.path ? options.path : DEFAULT_STUDENT_PATH;
  const mod = await softImportModule(path);
  if (!(name in mod) || typeof mod[name] === "undefined") {
    throw new Error("Did you create a variable named \`" + name + "\`?");
  }
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
`.trimStart()
}
