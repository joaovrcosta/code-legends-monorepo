# Code Legends Content Hub

Sistema de gerenciamento de conteúdo para a plataforma Code Legends.

## Funcionalidades

- ✅ Gerenciamento de Cursos
- ✅ Gerenciamento de Módulos
- ✅ Gerenciamento de Submódulos (Grupos)
- ✅ Gerenciamento de Aulas (Lessons)
- ✅ Visualização de Usuários

## Tecnologias

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Axios

## Configuração

1. Instale as dependências:

```bash
npm install
```

2. Configure a variável de ambiente:

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

3. Execute o servidor de desenvolvimento:

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

## Estrutura

- `/app` - Páginas e rotas da aplicação
- `/components` - Componentes reutilizáveis
- `/services` - Serviços de API
- `/lib` - Utilitários e configurações

## Autenticação

A aplicação utiliza autenticação JWT. O token é armazenado no `localStorage` após o login.

Para acessar o sistema, faça login através da rota `/login`.

## Notas

- A API deve estar rodando na porta 3333
- Algumas funcionalidades podem requerer permissões de ADMIN ou INSTRUCTOR na API
- O gerenciamento completo de usuários requer endpoints adicionais na API
