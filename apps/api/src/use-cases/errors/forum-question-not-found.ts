export class ForumQuestionNotFoundError extends Error {
  constructor() {
    super("Pergunta do fórum não encontrada.");
  }
}
