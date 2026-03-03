## Arquitetura da API e modelo de domínio

### 1. Hierarquia de domínio

- **Course**
  - Possui `modules` (ordem em `orderIndex`)
- **Module**
  - Possui `submodules` (model Prisma `Submodule` mapeado para a tabela `Group`)
- **Submodule**
  - Agrupa `lessons` relacionadas dentro de um módulo
- **Lesson**
  - Representa uma tarefa/unidade de estudo dentro de um submódulo
  - Conteúdos associados (1‑para‑1 por tipo):
    - `Video`
    - `Article`
    - `Quiz`
    - `Project`

### 2. Tipos de aula (`Lesson.type`)

- Definidos via enum Prisma em `schema.prisma`:
  - `LessonType { VIDEO, ARTICLE, TEXT, QUIZ, PROJECT }` mapeado para valores em minúsculas no banco (`video`, `article`, etc.).
- Na API HTTP e no frontend usamos **strings em minúsculas**:
  - `"video" | "article" | "text" | "quiz" | "project"`.
- Validação:
  - Controladores de criação e atualização de aula (`lesson/create.controller.ts`, `lesson/update.controller.ts`) validam `type` com `z.enum([...])`.
- Serialização:
  - Casos de uso que expõem aulas para o frontend (ex.: `GetRoadmapUseCase`, `ContinueCourseUseCase`, `GetLessonByCourseIdAndSlugUseCase`) convertem o enum para string minúscula antes de montar os DTOs de resposta.

### 3. Progresso e conclusão

- **Lesson**
  - Campos `completed` / `completedAt` **não são usados por usuário**; representam potencialmente estado global da lição (por exemplo, conteúdo pronto/publicado). No fluxo atual, o progresso do aluno **não** depende desses flags.
- **UserProgress**
  - Entidade responsável por progresso **por usuário e por lição**:
    - `isCompleted`, `completedAt`, `timeSpent`, `score` etc.
  - Todas as regras de conclusão de lição, destravamento de próximas lições e cálculo de progresso usam `UserProgress`.
- **UserModuleProgress** / **UnlockedModule**
  - Controlam progresso agregado por módulo e quais módulos estão desbloqueados para um usuário específico.
- **UserCourse**
  - Resume o estado do aluno em um curso:
    - `progress` (0–1), `isCompleted`, `completedAt`, `currentModuleId`, `currentTaskId`.

### 4. Repositórios e consultas

- **Repositórios Prisma** (camada de infra, ex.: `PrismaLessonRepository`, `PrismaModuleRepository`, `PrismaGroupRepository`):
  - Encapsulam o acesso ao banco via Prisma.
  - Preferência por **includes específicos por cenário**:
    - Listagem de aulas por submódulo (`findAll`) retorna apenas o necessário (campos escalares + conteúdo `video`/`article`/`quiz`/`project`).
    - Consultas mais ricas para classroom/roadmap usam casos de uso dedicados com queries Prisma diretas.
- **ILessonRepository** e demais interfaces de repositório:
  - Definem a API de acesso ao domínio para os casos de uso.
  - Implementações concretas (`Prisma*Repository`) ficam isoladas da camada de aplicação.

### 5. DTOs de domínio

- Introduzido módulo de domínio para lições em `src/domain/lesson.ts`:
  - `LessonWithContentDTO`: representação estável de lição com conteúdo associado (video/article), desacoplada do tipo gerado pelo Prisma.
- Casos de uso que expõem dados para o frontend usam DTOs:
  - `GetLessonByCourseIdAndSlugUseCase`: retorna `LessonWithContentDTO` em vez da entidade Prisma bruta.
  - `ContinueCourseUseCase`: retorna um DTO baseado em `LessonWithContentDTO` enriquecido com `video_url` / `video_duration`, mantendo compatibilidade com o frontend.

### 6. Convenções para novas implementações

- **Nomenclatura**
  - Usar sempre **Module / Submodule / Lesson** no domínio.
  - `Submodule` é o nome de domínio; o modelo Prisma está mapeado para a tabela legada `"Group"` via `@@map`.
- **Tipos fortes**
  - Para novos campos de domínio com valores limitados, preferir enums Prisma (como `LessonType`, `CourseStatus`, `UserPlan`) em vez de `String` solto.
  - Na borda HTTP, expor strings amigáveis (ex.: minúsculas) e fazer a conversão para enum na camada de aplicação/infra.
- **Consultas**
  - Evitar `include` genérico com muitas relações em repositórios compartilhados.
  - Criar métodos ou consultas específicas quando um fluxo precisa de um grafo maior de dados (ex.: roadmap, classroom).
- **DTOs**
  - Para respostas complexas expostas ao frontend, preferir DTOs de domínio (em `src/domain/**`) em vez de retornar diretamente entidades Prisma.
  - Manter os DTOs estáveis e versionáveis, de forma que mudanças internas no banco/Prisma impactem apenas a camada de mapeamento.

