export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nova funcionalidade
        'fix',      // Correção de bug
        'docs',     // Documentação
        'style',    // Formatação, ponto e vírgula faltando, etc
        'refactor', // Refatoração de código
        'perf',     // Melhoria de performance
        'test',     // Adição ou correção de testes
        'build',    // Mudanças no sistema de build
        'ci',       // Mudanças em CI/CD
        'chore',    // Outras mudanças que não modificam src ou test
        'revert',   // Reverte um commit anterior
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 250],
  },
};

