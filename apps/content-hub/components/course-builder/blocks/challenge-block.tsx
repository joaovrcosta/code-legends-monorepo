import { createReactBlockSpec } from "@blocknote/react";
import { defaultProps } from "@blocknote/core";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Eye, Edit2 } from "lucide-react";
import dynamic from "next/dynamic";

const ArticleCodeHighlighter = dynamic(
  () => import("../article-code-highlighter").then((m) => m.ArticleCodeHighlighter),
  { ssr: false }
);

const challengeTypeLabels: Record<string, string> = {
  prediction: "Previsão",
  bug: "Encontre o Bug",
  refactor: "Refatoração",
  complete: "Complete o Código",
  conceptual: "Conceitual",
};

export const ChallengeBlock = createReactBlockSpec(
  {
    type: "challenge",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      challengeType: { default: "prediction" },
      question: { default: "" },
      code: { default: "" },
      language: { default: "javascript" },
      options: { default: "[]" },
      correctAnswer: { default: "" },
      explanation: { default: "" },
      isPreview: { default: "true" },
    },
    content: "none",
  },
  {
    render: (props) => {
      const { block, editor } = props;

      const updateProp = (key: string, value: string) => {
        editor.updateBlock(block, {
          type: "challenge",
          props: { ...block.props, [key]: value },
        });
      };

      const options = JSON.parse(block.props.options || "[]") as string[];
      const hasOptions = ["prediction", "conceptual", "bug"].includes(block.props.challengeType);
      const showCode = block.props.challengeType !== "conceptual";

      const setOption = (index: number, val: string) => {
        const next = [...options];
        next[index] = val;
        updateProp("options", JSON.stringify(next));
      };

      const addOption = () => {
        updateProp("options", JSON.stringify([...options, ""]));
      };

      const removeOption = (index: number) => {
        const next = options.filter((_, i) => i !== index);
        updateProp("options", JSON.stringify(next));
      };

      const isPreview = block.props.isPreview === "true";

      return (
        <div className="relative w-full rounded-xl border border-zinc-700 bg-zinc-900/50 text-zinc-100 overflow-hidden" contentEditable={false}>
          <div className="flex flex-wrap relative items-center justify-between border-b border-zinc-700 bg-zinc-900/80 px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-zinc-700 px-2 py-0.5 text-[11px] font-medium text-zinc-200">
                {challengeTypeLabels[block.props.challengeType] || "Desafio"}
              </span>
              <span className="text-xs text-zinc-400">Desafio Interativo</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={isPreview ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => updateProp("isPreview", "true")}
              >
                <Eye className="h-3 w-3" /> Preview
              </Button>
              <Button
                variant={!isPreview ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => updateProp("isPreview", "false")}
              >
                <Edit2 className="h-3 w-3" /> Editar
              </Button>
            </div>
          </div>

          <div className="p-4">
            {isPreview ? (
              <div className="space-y-4">
                {block.props.question && (
                  <p className="font-medium text-zinc-100">{block.props.question}</p>
                )}
                {showCode && block.props.code && (
                  <div className="rounded-md bg-zinc-950 text-xs overflow-hidden">
                    <ArticleCodeHighlighter
                      code={block.props.code}
                      language={block.props.language || "text"}
                    />
                  </div>
                )}
                {hasOptions && options.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-zinc-400">Opções:</p>
                    <div className="grid gap-2">
                      {options.map((opt, i) => (
                        <div key={i} className="rounded border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-300">
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {block.props.explanation && (
                  <div className="mt-4 border-t border-zinc-700 pt-3">
                    <p className="text-xs text-zinc-400 font-medium mb-1">Explicação:</p>
                    <p className="text-sm text-zinc-300">{block.props.explanation}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-zinc-400">Tipo de Desafio</Label>
                    <select
                      className="flex h-9 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-300 disabled:cursor-not-allowed disabled:opacity-50"
                      value={block.props.challengeType}
                      onChange={(e) => updateProp("challengeType", e.target.value)}
                    >
                      <option value="prediction">Previsão</option>
                      <option value="conceptual">Conceitual</option>
                      <option value="bug">Encontre o Bug</option>
                      <option value="refactor">Refatoração</option>
                      <option value="complete">Complete o Código</option>
                    </select>
                  </div>

                  {showCode && (
                    <div className="space-y-1">
                      <Label className="text-xs text-zinc-400">Linguagem</Label>
                      <select
                        className="flex h-9 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-300"
                        value={block.props.language}
                        onChange={(e) => updateProp("language", e.target.value)}
                      >
                        {["javascript", "typescript", "tsx", "jsx", "python", "html", "css", "json", "text"].map((lang) => (
                          <option key={lang} value={lang}>{lang}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-zinc-400">Pergunta</Label>
                  <Textarea
                    className="min-h-12 resize-y text-sm bg-zinc-900 border-zinc-700"
                    value={block.props.question}
                    onChange={(e) => updateProp("question", e.target.value)}
                    placeholder="Ex: O que é impresso no console?"
                  />
                </div>

                {showCode && (
                  <div className="space-y-1">
                    <Label className="text-xs text-zinc-400">Código</Label>
                    <Textarea
                      className="min-h-24 resize-y font-mono text-sm bg-zinc-950 border-zinc-700 text-green-400"
                      value={block.props.code}
                      onChange={(e) => updateProp("code", e.target.value)}
                      placeholder="Seu código aqui..."
                    />
                  </div>
                )}

                {hasOptions && (
                  <div className="space-y-2">
                    <Label className="text-xs text-zinc-400">Opções</Label>
                    {options.map((opt, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <Input
                          className="h-8 text-sm bg-zinc-900 border-zinc-700"
                          value={opt}
                          onChange={(e) => setOption(i, e.target.value)}
                          placeholder={`Opção ${i + 1}`}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-400 hover:bg-red-950/30"
                          onClick={() => removeOption(i)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1 border-zinc-700 hover:bg-zinc-800"
                      onClick={addOption}
                    >
                      <Plus className="h-3 w-3" /> Adicionar Opção
                    </Button>
                  </div>
                )}

                <div className="space-y-1">
                  <Label className="text-xs text-zinc-400">Resposta Correta</Label>
                  <Input
                    className="bg-zinc-900 border-zinc-700"
                    value={block.props.correctAnswer}
                    onChange={(e) => updateProp("correctAnswer", e.target.value)}
                    placeholder="Resposta exata"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-zinc-400">Explicação</Label>
                  <Textarea
                    className="min-h-12 bg-zinc-900 border-zinc-700 text-sm"
                    value={block.props.explanation}
                    onChange={(e) => updateProp("explanation", e.target.value)}
                    placeholder="Explicação da resposta correta"
                  />
                </div>

              </div>
            )}
          </div>
        </div>
      );
    },
  }
);
