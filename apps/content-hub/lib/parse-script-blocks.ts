export type ScriptBlockType = "FALA" | "PAUSA" | "CODIGO" | "OUTRO";

export interface ScriptBlock {
  id: string;
  type: ScriptBlockType;
  label: string;
  content: string;
  lineStart: number;
}

const TAG_LINE_REGEX = /^\[([^\]]+)\]\s*(.*)?$/;

function normalizeTag(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function mapTagToType(rawTag: string): { type: ScriptBlockType; label: string } {
  const normalized = normalizeTag(rawTag);

  if (normalized === "FALA") {
    return { type: "FALA", label: "FALA" };
  }
  if (normalized === "PAUSA") {
    return { type: "PAUSA", label: "PAUSA" };
  }
  if (normalized === "CODIGO NA TELA" || normalized.startsWith("CODIGO NA TELA")) {
    return { type: "CODIGO", label: "CÓDIGO NA TELA" };
  }

  return { type: "OUTRO", label: rawTag.trim() || "OUTRO" };
}

function flushBlock(
  blocks: ScriptBlock[],
  draft: { type: ScriptBlockType; label: string; lines: string[]; lineStart: number } | null,
) {
  if (!draft) return;

  blocks.push({
    id: String(blocks.length),
    type: draft.type,
    label: draft.label,
    content: draft.lines.join("\n").trimEnd(),
    lineStart: draft.lineStart,
  });
}

export function parseScriptBlocks(notes: string): ScriptBlock[] {
  if (!notes.trim()) return [];

  const lines = notes.replace(/\r\n/g, "\n").split("\n");
  const blocks: ScriptBlock[] = [];
  let draft: {
    type: ScriptBlockType;
    label: string;
    lines: string[];
    lineStart: number;
  } | null = null;
  let preamble: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(TAG_LINE_REGEX);

    if (match) {
      if (!draft && preamble.length > 0) {
        const content = preamble.join("\n").trim();
        if (content) {
          blocks.push({
            id: String(blocks.length),
            type: "OUTRO",
            label: "Texto",
            content,
            lineStart: 0,
          });
        }
        preamble = [];
      }

      flushBlock(blocks, draft);

      const { type, label } = mapTagToType(match[1]);
      const inlineContent = match[2]?.trim() ?? "";
      draft = {
        type,
        label,
        lines: inlineContent ? [inlineContent] : [],
        lineStart: i + 1,
      };
      continue;
    }

    if (draft) {
      draft.lines.push(line);
    } else {
      preamble.push(line);
    }
  }

  if (!draft && preamble.length > 0) {
    const content = preamble.join("\n").trim();
    if (content) {
      blocks.push({
        id: String(blocks.length),
        type: "OUTRO",
        label: "Texto",
        content,
        lineStart: 0,
      });
    }
  }

  flushBlock(blocks, draft);

  return blocks;
}

export function scriptBlockTypeLabel(type: ScriptBlockType): string {
  switch (type) {
    case "FALA":
      return "Fala";
    case "PAUSA":
      return "Pausa";
    case "CODIGO":
      return "Código";
    default:
      return "Outro";
  }
}

function normalizeCodeLanguage(lang: string | undefined): string {
  const value = (lang ?? "text").trim().toLowerCase();
  if (!value) return "text";
  if (value === "js") return "javascript";
  if (value === "ts") return "typescript";
  return value;
}

/** Extrai código e linguagem de blocos [CÓDIGO NA TELA], com ou sem cercas ``` */
export function extractCodeBlockContent(raw: string): {
  code: string;
  language: string;
} {
  const trimmed = raw.trim();
  if (!trimmed) return { code: "", language: "text" };

  const fullFence = trimmed.match(/^```(\w+)?\s*\n([\s\S]*?)```\s*$/);
  if (fullFence) {
    return {
      language: normalizeCodeLanguage(fullFence[1]),
      code: fullFence[2].trimEnd(),
    };
  }

  const openFence = trimmed.match(/^```(\w+)?\s*\n([\s\S]*)$/);
  if (openFence) {
    return {
      language: normalizeCodeLanguage(openFence[1]),
      code: openFence[2].trimEnd(),
    };
  }

  return { code: trimmed, language: "text" };
}
