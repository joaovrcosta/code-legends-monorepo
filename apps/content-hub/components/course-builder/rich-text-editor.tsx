'use client';
import { BlockNoteSchema, defaultBlockSpecs, createCodeBlockSpec } from "@blocknote/core";
import { useCreateBlockNote, SuggestionMenuController, getDefaultReactSlashMenuItems } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCallback, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Info, AlertTriangle, Lightbulb, CheckCircle2, Target } from "lucide-react";
import { ChallengeBlock } from "./blocks/challenge-block";
import { getHighlighter } from "./shiki";

const codeBlockCustomOptions = {
  createHighlighter: getHighlighter,
  supportedLanguages: {
    javascript: { name: "JavaScript", aliases: ["js"] },
    typescript: { name: "TypeScript", aliases: ["ts"] },
    tsx: { name: "TSX", aliases: ["tsx"] },
    jsx: { name: "JSX", aliases: ["jsx"] },
    html: { name: "HTML", aliases: ["htm", "html"] },
    css: { name: "CSS", aliases: ["css"] },
    json: { name: "JSON", aliases: ["json"] },
    python: { name: "Python", aliases: ["py"] },
    text: { name: "Plain Text", aliases: ["txt"] }
  },
  defaultLanguage: "javascript"
};

const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    codeBlock: createCodeBlockSpec(codeBlockCustomOptions),
    challenge: ChallengeBlock(),
  },
});

export interface RichTextEditorRef {
  insertMarkdown: (markdown: string) => Promise<void>;
}

interface RichTextEditorProps {
  initialMarkdown: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  className?: string;
}

function buildBlockSlotsFromEditorProps(p: any): {
  pieces: { id: string; content: string }[];
  solution: string[];
} {
  const correctLines = String(p.blockSlotsCorrect || p.parsonsCorrect || "")
    .split("\n")
    .map((l) => l.replace(/\r$/, ""))
    .filter((l) => l.trim().length > 0);
  const distrLines = String(p.blockSlotsDistractors || p.parsonsDistractors || "")
    .split("\n")
    .map((l) => l.replace(/\r$/, ""))
    .filter((l) => l.trim().length > 0);
  const cPieces = correctLines.map((content, i) => ({ id: `c${i}`, content }));
  const dPieces = distrLines.map((content, i) => ({ id: `d${i}`, content }));
  return {
    pieces: [...cPieces, ...dPieces],
    solution: [...cPieces.map((x) => x.id), ...dPieces.map((x) => x.id)],
  };
}

function blockSlotsTextareasFromParsed(parsed: any): {
  blockSlotsCorrect: string;
  blockSlotsDistractors: string;
} {
  const pieces: { id: string; content: string }[] = Array.isArray(parsed.pieces)
    ? parsed.pieces
    : [];
  const sol: string[] = Array.isArray(parsed.solution) ? parsed.solution : [];
  const byId: Record<string, string> = Object.fromEntries(
    pieces.map((p) => [p.id, p.content]),
  );
  let blockSlotsCorrect = "";
  let blockSlotsDistractors = "";
  if (sol.length > 0) {
    blockSlotsCorrect = sol.map((id: string) => byId[id]).filter((c) => c !== undefined).join("\n");
    const inSol = new Set(sol);
    const extra = pieces.filter((p) => !inSol.has(p.id)).map((p) => p.content);
    blockSlotsDistractors = extra.join("\n");
  } else if (pieces.length > 0) {
    blockSlotsCorrect = pieces.map((p) => p.content).join("\n");
  }
  return { blockSlotsCorrect, blockSlotsDistractors };
}

// Interceptamos a saída do BlockNote para converter nosso bloco customizado num bloco de código Markdown.
function prepareBlocksForExport(blocks: any[]): void {
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.type === "challenge") {
      const p = block.props;
      blocks[i] = {
        id: block.id,
        type: "codeBlock",
        props: { language: "challenge" },
        content: [
          {
            type: "text",
            text: JSON.stringify(
              (() => {
                const exportType = p.challengeType === "parsons" ? "block_slots" : (p.challengeType || "prediction");
                const base: Record<string, unknown> = {
                  type: exportType,
                  question: p.question || "",
                  code: p.code || "",
                  language: p.language || "javascript",
                  options: JSON.parse(p.options || "[]"),
                  correctAnswer: p.correctAnswer || "",
                  explanation: p.explanation || "",
                };
                if (exportType === "block_slots") {
                  const { pieces, solution } = buildBlockSlotsFromEditorProps(p);
                  base.pieces = pieces;
                  base.solution = solution;
                  const img = String(p.missionImageUrl || "").trim();
                  if (img) base.missionImageUrl = img;
                }
                if (p.shuffleOptions === "true") {
                  base.shuffleOptions = true;
                }
                return base;
              })(),
              null,
              2,
            ),
            styles: {}
          }
        ],
        children: []
      };
    } else if (block.type === "image") {
      const alignment = block.props?.textAlignment;
      if (alignment && alignment !== "left") {
        blocks.splice(i + 1, 0, {
          id: `align-${block.id}`,
          type: "paragraph",
          props: {
            textAlignment: "left",
            textColor: "default",
            backgroundColor: "default",
          },
          content: [
            {
              type: "text",
              // Marcador em texto puro para sobreviver ao export "lossy" do Markdown.
              text: `[[cl-image-align:${alignment}]]`,
              styles: {},
            },
          ],
          children: [],
        });
        i++;
      }
    } else if (block.children && block.children.length > 0) {
      prepareBlocksForExport(block.children);
    }
  }
}

function processImportedBlocks(blocks: any[]): void {
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.type === "codeBlock" && block.props.language === "challenge") {
      try {
        const text = block.content.map((c: any) => c.text).join("");
        const parsed = JSON.parse(text);
        const rawType = parsed.type || "prediction";
        const challengeType = rawType === "parsons" ? "block_slots" : rawType;
        const blockSlotsFields =
          challengeType === "block_slots"
            ? blockSlotsTextareasFromParsed(parsed)
            : { blockSlotsCorrect: "", blockSlotsDistractors: "" };
        blocks[i] = {
          id: block.id,
          type: "challenge",
          props: {
            textAlignment: "left",
            textColor: "default",
            challengeType,
            question: parsed.question || "",
            code: parsed.code || "",
            language: parsed.language || "javascript",
            options: JSON.stringify(parsed.options || []),
            correctAnswer: parsed.correctAnswer || "",
            explanation: parsed.explanation || "",
            blockSlotsCorrect: blockSlotsFields.blockSlotsCorrect,
            blockSlotsDistractors: blockSlotsFields.blockSlotsDistractors,
            missionImageUrl: String(parsed.missionImageUrl || "").trim(),
            shuffleOptions: parsed.shuffleOptions === true ? "true" : "false",
          },
          content: [],
          children: []
        };
      } catch (e) {
        console.error("Failed to parse challenge block JSON:", e);
      }
    } else if (block.type === "paragraph") {
      // Detecta marcador de alinhamento gerado no export (logo após um bloco de imagem)
      const text = Array.isArray(block.content)
        ? block.content.map((c: any) => c?.text ?? "").join("")
        : "";
      const match = text.trim().match(/^\[\[cl-image-align:(left|center|right|justify)\]\]$/);
      if (match) {
        const alignment = match[1];
        const prev = blocks[i - 1];
        if (prev && prev.type === "image") {
          prev.props = { ...(prev.props ?? {}), textAlignment: alignment };
        }
        // Remove o marcador do documento
        blocks.splice(i, 1);
        i--;
        continue;
      }
    } else if (block.children && block.children.length > 0) {
      processImportedBlocks(block.children);
    }
  }
}

const getCustomSlashMenuItems = (editor: any) => [
  ...getDefaultReactSlashMenuItems(editor),
  {
    title: "Nota",
    onItemClick: () => {
      editor.insertBlocks([
        { type: "quote", content: [{ type: "text", text: "Nota", styles: { bold: true } }] },
        { type: "quote" }
      ], editor.getTextCursorPosition().block, "after");
    },
    aliases: ["note", "nota"],
    group: "Callouts Especiais",
    icon: <Info size={18} />,
    subtext: "Insere uma nota de informação azul",
  },
  {
    title: "Aviso",
    onItemClick: () => {
      editor.insertBlocks([
        { type: "quote", content: [{ type: "text", text: "Aviso", styles: { bold: true } }] },
        { type: "quote" }
      ], editor.getTextCursorPosition().block, "after");
    },
    aliases: ["aviso", "warning", "alerta"],
    group: "Callouts Especiais",
    icon: <AlertTriangle size={18} />,
    subtext: "Insere um alerta de aviso amarelo",
  },
  {
    title: "Dica",
    onItemClick: () => {
      editor.insertBlocks([
        { type: "quote", content: [{ type: "text", text: "Dica", styles: { bold: true } }] },
        { type: "quote" }
      ], editor.getTextCursorPosition().block, "after");
    },
    aliases: ["tip", "dica"],
    group: "Callouts Especiais",
    icon: <Lightbulb size={18} />,
    subtext: "Insere uma dica verde claro",
  },
  {
    title: "Sucesso",
    onItemClick: () => {
      editor.insertBlocks([
        { type: "quote", content: [{ type: "text", text: "Sucesso ", styles: {} }, { type: "text", text: "Título aqui", styles: { bold: true } }] },
        { type: "quote", content: [{ type: "text", text: "Escreva o conteúdo aqui...", styles: {} }] }
      ], editor.getTextCursorPosition().block, "after");
    },
    aliases: ["sucesso", "success"],
    group: "Callouts Especiais",
    icon: <CheckCircle2 size={18} />,
    subtext: "Insere um card de sucesso verde escuro",
  },
  {
    title: "Desafio Interativo (com código)",
    onItemClick: () => {
      editor.insertBlocks([
        {
          type: "challenge",
          props: {
            challengeType: "prediction",
            question: "O que será mostrado no console?",
            code: "const x = 1;\nconsole.log(x);",
            language: "javascript",
            options: JSON.stringify(["1", "undefined", "erro", "nada"]),
            correctAnswer: "1",
            explanation: "O valor de x é 1."
          }
        }
      ], editor.getTextCursorPosition().block, "after");
    },
    aliases: ["desafio", "challenge"],
    group: "Desafios Interativos",
    icon: <Target size={18} />,
    subtext: "Insere um desafio interativo BlockNote",
  },
  {
    title: "Desafio (sem código)",
    onItemClick: () => {
      editor.insertBlocks([
        {
          type: "challenge",
          props: {
            challengeType: "conceptual",
            question: "Qual a diferença entre props e state no React?",
            options: JSON.stringify(["Props vêm de fora, state é interno", "São a mesma coisa", "State não existe"]),
            correctAnswer: "Props vêm de fora, state é interno",
            explanation: "Props são passadas pelo componente pai."
          }
        }
      ], editor.getTextCursorPosition().block, "after");
    },
    aliases: ["pergunta", "quiz"],
    group: "Desafios Interativos",
    icon: <Target size={18} />,
    subtext: "Insere um desafio interativo conceitual",
  }
];

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ initialMarkdown, onChange, placeholder, className }, ref) => {
    const [initialContentReady, setInitialContentReady] = useState(false);

    // Cria o editor usando o schema customizado com Desafios!
    const editor = useCreateBlockNote({ schema });

    useImperativeHandle(ref, () => ({
      insertMarkdown: async (markdown: string) => {
        try {
          const blocks = await editor.tryParseMarkdownToBlocks(markdown);
          processImportedBlocks(blocks);
          editor.insertBlocks(blocks, editor.getTextCursorPosition().block, "after");
        } catch (e) {
          console.error("Failed to insert markdown", e);
        }
      }
    }));

    // Carrega o markdown inicial apenas uma vez
    useEffect(() => {
      async function loadInitialMarkdown() {
        if (initialMarkdown) {
          try {
            const blocks = await editor.tryParseMarkdownToBlocks(initialMarkdown);
            processImportedBlocks(blocks);
            editor.replaceBlocks(editor.document, blocks);
          } catch (e) {
            console.error("Failed to parse initial markdown", e);
          }
        }
        setInitialContentReady(true);
      }
      loadInitialMarkdown();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Executa apenas na montagem

    const handleChange = useCallback(async () => {
      if (!initialContentReady) return;

      // We need a deep clone so we don't mutate the actual editor document!
      const documentClone = JSON.parse(JSON.stringify(editor.document));
      prepareBlocksForExport(documentClone);

      const markdown = await editor.blocksToMarkdownLossy(documentClone);
      onChange(markdown);
    }, [editor, initialContentReady, onChange]);

    if (!initialContentReady) {
      return (
        <div className={`p-4 text-sm text-zinc-500 animate-pulse ${className || ''}`}>
          Carregando editor visual...
        </div>
      );
    }

    return (
      <div className={className}>
        <BlockNoteView
          editor={editor}
          onChange={handleChange}
          theme={"dark"}
          slashMenu={false}
          className="[&_.bn-block-outer]:mb-4"
        >
          <SuggestionMenuController
            triggerCharacter={"/"}
            getItems={async (query) =>
              getCustomSlashMenuItems(editor).filter(
                (item) =>
                  item.title.toLowerCase().includes(query.toLowerCase()) ||
                  (item.aliases &&
                    item.aliases.some((a: string) =>
                      a.toLowerCase().includes(query.toLowerCase())
                    ))
              )
            }
          />
        </BlockNoteView>
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";
