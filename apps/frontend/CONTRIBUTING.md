# Guia de Contribuição

## Padrão de Commits

Este projeto utiliza o padrão [Conventional Commits](https://www.conventionalcommits.org/) para padronizar as mensagens de commit.

### Formato

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Tipos de Commit

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação, ponto e vírgula faltando, etc (não altera código)
- `refactor`: Refatoração de código
- `perf`: Melhoria de performance
- `test`: Adição ou correção de testes
- `build`: Mudanças no sistema de build
- `ci`: Mudanças em CI/CD
- `chore`: Outras mudanças que não modificam src ou test
- `revert`: Reverte um commit anterior

### Exemplos

```bash
# Nova funcionalidade
git commit -m "feat: adiciona botão de pesquisa no header"

# Correção de bug
git commit -m "fix: corrige erro de hidratação no banner"

# Documentação
git commit -m "docs: atualiza README com instruções de instalação"

# Refatoração
git commit -m "refactor: reorganiza estrutura de componentes"

# Com escopo
git commit -m "feat(header): adiciona menu dropdown de usuário"
```

### Regras

- Use o modo imperativo ("adiciona" não "adicionando" ou "adicionado")
- Não termine o subject com ponto
- O subject deve ter no máximo 100 caracteres
- Use o body para explicar o "o quê" e "por quê" quando necessário

## Lint e Formatação

O projeto utiliza ESLint com plugin para remover automaticamente imports e variáveis não utilizadas.

### Comandos

```bash
# Executa lint
npm run lint

# Executa lint e corrige automaticamente
npm run lint:fix
```

### Hooks do Husky

O Husky está configurado para:

- **pre-commit**: Executa `lint:fix` automaticamente antes de cada commit
- **commit-msg**: Valida a mensagem de commit usando commitlint

Isso garante que:

- Código não usado seja removido automaticamente
- Mensagens de commit sigam o padrão estabelecido
