import { createHighlighter } from "shiki";

export const getHighlighter = async () => {
  return await createHighlighter({
    themes: ["dark-plus"],
    langs: [
      "javascript",
      "typescript",
      "tsx",
      "jsx",
      "html",
      "css",
      "json",
      "python",
    ],
  });
};
