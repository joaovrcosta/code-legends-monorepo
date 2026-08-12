"use client";

import React, { useEffect, useState, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ComponentProps } from "react";

const SyntaxHighlighter = dynamic(
  () => import("react-syntax-highlighter").then((m) => m.Prism),
  { ssr: false },
);

type PrismStyle = Record<string, CSSProperties>;
let cachedOneDark: PrismStyle | null = null;

function getLanguage(className?: string | null): string {
  if (!className) return "text";
  const match = className.match(/language-(\w+)/);
  return match?.[1] ?? "text";
}

function getCodeString(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) {
    return children.map((c) => (typeof c === "string" ? c : "")).join("");
  }
  return String(children ?? "");
}

function ForumHighlightedCode({
  language,
  code,
}: {
  language: string;
  code: string;
}) {
  const [style, setStyle] = useState<PrismStyle | null>(cachedOneDark);

  useEffect(() => {
    if (cachedOneDark) {
      setStyle(cachedOneDark);
      return;
    }
    import("react-syntax-highlighter/dist/esm/styles/prism")
      .then((m) => {
        cachedOneDark = m.oneDark as PrismStyle;
        setStyle(cachedOneDark);
      })
      .catch(() => setStyle({}));
  }, []);

  return (
    <div className="forum-md-pre">
      <div className="forum-md-pre-header">
        <span>{language}</span>
      </div>
      {style ? (
        <SyntaxHighlighter
          language={language === "text" ? "plaintext" : language}
          style={style}
          customStyle={{ margin: 0, background: "transparent" }}
        >
          {code}
        </SyntaxHighlighter>
      ) : (
        <pre>
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}

function ForumCodeBlock({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const language = getLanguage(className);
  const code = getCodeString(children).replace(/\n$/, "");
  return <ForumHighlightedCode language={language} code={code} />;
}

export function ForumMarkdown({ content }: { content: string }) {
  return (
    <div className="forum-md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({
            className,
            children,
            ...props
          }: ComponentProps<"code"> & { inline?: boolean }) {
            const text = getCodeString(children);
            const isBlock =
              Boolean(className?.includes("language-")) || text.includes("\n");

            if (!isBlock) {
              return (
                <code className="forum-md-inline-code" {...props}>
                  {children}
                </code>
              );
            }

            return (
              <ForumCodeBlock className={className}>{children}</ForumCodeBlock>
            );
          },
          pre({ children }) {
            return <>{children}</>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
