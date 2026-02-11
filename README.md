# Code Legends Monorepo

Monorepo contendo os projetos da plataforma Code Legends, gerenciado com Turborepo e pnpm Workspaces.

## Estrutura

```
code-legends-repo/
├── apps/
│   ├── api/              # API Backend (Fastify + Prisma)
│   ├── frontend/         # Frontend Next.js (Aplicação principal)
│   └── content-hub/      # Content Hub Next.js (Gerenciamento de conteúdo)
│
└── packages/             # Pacotes compartilhados (futuro)
```

## Tecnologias

- **Turborepo**: Orquestração e cache de builds
- **pnpm**: Gerenciamento de dependências e workspaces
- **Node.js**: >=18

## Pré-requisitos

- Node.js >= 18
- pnpm >= 9.0.0

Para instalar o pnpm:
```bash
npm install -g pnpm
```

## Instalação

Instale todas as dependências do monorepo:

```bash
pnpm install
```

## Scripts Disponíveis

### Executar todos os projetos

```bash
# Desenvolvimento (todos os projetos)
pnpm dev

# Build de todos os projetos
pnpm build

# Iniciar todos os projetos em produção
pnpm start

# Lint em todos os projetos
pnpm lint

# Testes em todos os projetos
pnpm test
```

### Executar projeto específico

```bash
# API
pnpm --filter @code-legends/api dev
pnpm --filter @code-legends/api build

# Frontend
pnpm --filter @code-legends/frontend dev
pnpm --filter @code-legends/frontend build

# Content Hub
pnpm --filter @code-legends/content-hub dev
pnpm --filter @code-legends/content-hub build
```

## Projetos

### API (`apps/api/`)

API backend construída com Fastify, Prisma e PostgreSQL.

**Scripts:**
- `pnpm dev` - Inicia servidor de desenvolvimento
- `pnpm build` - Compila o projeto
- `pnpm start` - Inicia servidor de produção
- `pnpm test` - Executa testes

**Variáveis de ambiente:**
- `DATABASE_CLIENT=pg`
- `JWT_SECRET` - Secret para JWT
- `PORT=3333` - Porta do servidor
- `NODE_ENV` - Ambiente (development/production)

**Docker:**
```bash
cd apps/api
docker-compose up -d
```

### Frontend (`apps/frontend/`)

Aplicação Next.js principal da plataforma.

**Scripts:**
- `pnpm dev` - Inicia servidor de desenvolvimento (porta 3000)
- `pnpm build` - Build de produção
- `pnpm start` - Inicia servidor de produção

**Variáveis de ambiente:**
- `NEXT_PUBLIC_API_URL` - URL da API (ex: http://localhost:3333)

### Content Hub (`apps/content-hub/`)

Sistema de gerenciamento de conteúdo Next.js.

**Scripts:**
- `pnpm dev` - Inicia servidor de desenvolvimento (porta 3000)
- `pnpm build` - Build de produção
- `pnpm start` - Inicia servidor de produção

**Variáveis de ambiente:**
- `NEXT_PUBLIC_API_URL` - URL da API (ex: http://localhost:3333)

## Deploy

Cada projeto mantém seu ambiente de deploy independente:

- **API**: Docker/Docker Compose
- **Frontend**: Vercel (configurar root como `apps/frontend/`)
- **Content Hub**: Vercel (configurar root como `apps/content-hub/`)

## Desenvolvimento

### Workflow recomendado

1. Instale as dependências: `pnpm install`
2. Configure as variáveis de ambiente em cada app
3. Execute todos os projetos: `pnpm dev`
4. Ou execute projetos específicos conforme necessário

### Adicionar novo pacote compartilhado

1. Crie o pacote em `packages/nome-do-pacote/`
2. Adicione `"name": "@code-legends/nome-do-pacote"` no package.json
3. Referencie em outros projetos com `"@code-legends/nome-do-pacote": "workspace:*"`

## Cache do Turborepo

O Turborepo utiliza cache inteligente para acelerar builds. Builds que não tiveram alterações são reutilizados automaticamente.

Para limpar o cache:
```bash
pnpm clean
```

## Contribuindo

Cada projeto mantém sua independência. Ao fazer alterações:

1. Teste localmente com `pnpm dev`
2. Execute lint: `pnpm lint`
3. Execute testes: `pnpm test`
4. Build de produção: `pnpm build`

## Licença

ISC
