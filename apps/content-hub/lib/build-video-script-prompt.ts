import type {
  AdjacentVideoLessons,
  VideoLessonNeighbor,
} from '@/lib/course-structure'

export const VIDEO_SCRIPT_STYLE_IDS = ['sequenced', 'standalone'] as const

export type VideoScriptStyleId = (typeof VIDEO_SCRIPT_STYLE_IDS)[number]

export const VIDEO_SCRIPT_STYLES: {
  id: VideoScriptStyleId
  label: string
  description: string
}[] = [
  {
    id: 'sequenced',
    label: 'Com sequência',
    description: 'Conecta abertura e encerramento às videoaulas vizinhas',
  },
  {
    id: 'standalone',
    label: 'Autocontida',
    description: 'Roteiro independente, sem referências a outras aulas',
  },
]

export type VideoScriptPromptInput = {
  title: string
  description: string
  courseTitle?: string
  moduleTitle?: string
  groupTitle?: string
  /** Só usado no estilo `sequenced`. */
  adjacent?: AdjacentVideoLessons | null
}

function formatVideoNeighborBlock(
  label: string,
  neighbor: VideoLessonNeighbor,
): string {
  const duration =
    neighbor.lesson.video_duration?.trim() ||
    neighbor.lesson.video?.duration?.trim() ||
    'não informada'
  const objective = neighbor.lesson.description?.trim() || 'não informado'

  return `${label}:
- Título: ${neighbor.lesson.title}
- Objetivo: ${objective}
- Duração: ${duration}
- Local: ${neighbor.moduleTitle} → ${neighbor.groupTitle}`
}

function lessonMeta(input: VideoScriptPromptInput) {
  const title = input.title.trim() || 'Tema da aula'
  const description =
    input.description.trim() ||
    'Explique o conceito principal desta aula de forma clara e prática.'
  const duration = '5–10 minutos'
  const contextParts = [
    input.courseTitle ? `Curso: ${input.courseTitle}` : null,
    input.moduleTitle ? `Módulo: ${input.moduleTitle}` : null,
    input.groupTitle ? `Submódulo: ${input.groupTitle}` : null,
  ].filter(Boolean)

  return { title, description, duration, contextParts }
}

function buildSequencedPrompt(input: VideoScriptPromptInput): string {
  const { title, description, duration, contextParts } = lessonMeta(input)
  const adjacent = input.adjacent ?? null

  const videoNeighborsBlock = adjacent
    ? `
VIDEOAULAS VIZINHAS

${
  adjacent.previous
    ? formatVideoNeighborBlock('Videoaula anterior', adjacent.previous)
    : 'Videoaula anterior: não há videoaula anterior neste curso.'
}

${
  adjacent.next
    ? formatVideoNeighborBlock('Próxima videoaula', adjacent.next)
    : 'Próxima videoaula: não há próxima videoaula neste curso.'
}
`
    : ''

  return `Você é um especialista em ensino de programação e criação de roteiros para videoaulas educacionais, inspirado no estilo de explicação clara, fluida e envolvente (como “The Joy of React”, mas adaptado para vídeo).

Crie um roteiro de videoaula com linguagem natural, didática e fácil de acompanhar ouvindo.

### 💡 DIRETRIZES DE ESTILO E ENGAJAMENTO

- **Analogias Poderosas:** Use metáforas do mundo real para explicar conceitos abstratos de código. A analogia deve enriquecer a explicação técnica de forma sutil, sem desviar do foco principal.
- **Ritmo Confortável:** Escreva exatamente como uma pessoa fala naturalmente. Alterne frases curtas; use "..." dentro de [FALA] para pausas retóricas. Use [PAUSA] só para silêncio real na gravação.
- **Abordagem Visual:** Em vez de apenas listar o código, descreva o que está acontecendo conceitualmente na tela enquanto o código aparece.

---

Tema da aula:
${title}

Objetivo da aula:
${description}

Duração estimada:
${duration}
${
  contextParts.length
    ? `
Contexto da aula:
${contextParts.join('\n')}
`
    : ''
}${videoNeighborsBlock}
---

ESTRUTURA DO ROTEIRO

1. Abertura (hook)
   - Comece com uma pergunta, situação ou observação curiosa
   - Deve prender atenção nos primeiros segundos
   - Evite histórias longas

2. Contextualização rápida
   - Explique por que isso importa
   - Mostre onde o conceito aparece na prática

3. Explicação principal (progressiva)
   - Vá do simples ao mais técnico
   - Use linguagem clara e ritmo de fala natural
   - Quebre ideias em blocos curtos (como alguém explicando oralmente)

4. Demonstração / exemplo
   - Use código quando fizer sentido
   - Explique enquanto “mostra”
   - Evite apenas ler código

5. Insight importante
   - Destaque um erro comum ou confusão frequente
   - Mostre o “pulo do gato”

6. Recap rápido
   - Reforce o que foi aprendido

7. Encerramento
   - Conecte com a próxima videoaula quando ela existir
   - Não explique conteúdos que pertencem à próxima videoaula; apenas crie uma transição natural

---

IMPORTANTE

- Considere a sequência do curso ao escrever o roteiro
- Conecte a abertura com a videoaula anterior (se existir)
- Use o submódulo como contexto para manter a aula alinhada com a jornada do aluno
- Ao finalizar, crie uma ponte natural para a próxima videoaula (se existir)
- Ignore quizzes, artigos e projetos entre as videoaulas
- Não invente conteúdo além do informado acima
- Não mencione informações ausentes no contexto

---

REGRAS DAS TAGS (obrigatório)

- [FALA]: TODO texto que será falado em voz alta. Nenhuma frase falada pode ficar fora de [FALA].
- [PAUSA]: APENAS silêncio na gravação. Conteúdo permitido: linha vazia, "..." ou no máximo "(respira)" / "(pausa curta)".
  - PROIBIDO: colocar frases, explicações ou parágrafos depois de [PAUSA].
- [CÓDIGO NA TELA]: somente o que aparece na tela (listas, pseudocódigo, etc.).

Se houver mais fala depois de uma pausa, SEMPRE reabra com [FALA]:

Correto:
[FALA]
Primeira parte...

[PAUSA]

[FALA]
Segunda parte...

Incorreto:
[FALA]
Primeira parte...

[PAUSA]

Segunda parte sem tag...

Outras regras:
- Pausas retóricas no meio da fala → use "..." dentro do mesmo [FALA], não crie [PAUSA].
- Use [PAUSA] no máximo 1 vez a cada 3–5 blocos [FALA], só em transições fortes na gravação.
- Não use "---" ou linhas separadoras; mude de assunto com parágrafo em branco dentro de [FALA] ou com [PAUSA] + novo [FALA].

Antes de entregar, verifique:
1. Toda linha com texto falado está dentro de um bloco [FALA]?
2. Nenhum bloco [PAUSA] tem parágrafos de fala?
3. Depois de cada [PAUSA] vem imediatamente [FALA] ou [CÓDIGO NA TELA] se houver mais conteúdo?

---

FORMATO DO ROTEIRO

- Escreva como fala natural (não como texto formal)
- Use frases curtas e médias (fáceis de falar em voz alta)
- Separe o roteiro em blocos [FALA], [PAUSA] e [CÓDIGO NA TELA]
- Gere apenas o roteiro da videoaula, sem explicar o processo

Exemplo de formatação:

[FALA]
Na aula passada a gente viu o conceito... e hoje vamos praticar.

[PAUSA]

[FALA]
Então agora a gente faz isso de verdade. Você vai criar o seu primeiro algoritmo.

[PAUSA]

[FALA]
Antes de começar, preciso te dizer uma coisa importante...

[CÓDIGO NA TELA]
\`\`\`
1. Receber um número
2. Dividir esse número por 2
\`\`\`

[FALA]
Vamos passar por cada linha juntos...`
}

function buildStandalonePrompt(input: VideoScriptPromptInput): string {
  const { title, description, duration, contextParts } = lessonMeta(input)

  return `Você é um especialista em ensino de programação e criação de roteiros para videoaulas educacionais, inspirado no estilo de explicação clara, fluida e envolvente (como "The Joy of React", mas adaptado para vídeo).

Crie um roteiro de videoaula com linguagem natural, didática e fácil de acompanhar ouvindo.

💡 DIRETRIZES DE ESTILO E ENGAJAMENTO
Analogias Poderosas: Use metáforas do mundo real para explicar conceitos abstratos de código. A analogia deve enriquecer a explicação técnica de forma sutil, sem desviar do foco principal.
Ritmo Confortável: Escreva exatamente como uma pessoa fala naturalmente. Alterne frases curtas; use "..." dentro de [FALA] para pausas retóricas. Use [PAUSA] só para silêncio real na gravação.
Abordagem Visual: Em vez de apenas listar o código, descreva o que está acontecendo conceitualmente na tela enquanto o código aparece.

Tema da aula: ${title}

Objetivo da aula: ${description}

Duração estimada: ${duration}
${
  contextParts.length
    ? `
Contexto da aula: ${contextParts.join(' ')}
`
    : ''
}
ESTRUTURA DO ROTEIRO

Abertura (hook)
Comece com uma pergunta, situação ou observação curiosa sobre o tema da aula
Deve prender atenção nos primeiros segundos
Evite histórias longas
Não referencie nomes, temas ou posições de outras aulas do curso
Contextualização rápida
Explique por que esse conceito importa, de forma independente
Mostre onde ele aparece na prática (situações do dia a dia ou de código), sem depender de conceitos que só seriam vistos em aulas futuras
Explicação principal (progressiva)
Vá do simples ao mais técnico
Use linguagem clara e ritmo de fala natural
Quebre ideias em blocos curtos (como alguém explicando oralmente)
Se precisar de um pré-requisito conceitual, apresente-o como lembrete rápido e autoexplicativo, nunca como referência a "aula anterior" ou "módulo passado"
Demonstração / exemplo
Use código quando fizer sentido
Explique enquanto "mostra"
Evite apenas ler código
Insight importante
Destaque um erro comum ou confusão frequente
Mostre o "pulo do gato"
Recap rápido
Reforce o que foi aprendido nesta aula, sem apontar para outras aulas
Encerramento
Feche reforçando a utilidade do conceito aprendido e abrindo espaço mental para ideias mais complexas relacionadas ao tema
NÃO cite o nome, tema ou existência de uma próxima aula
NÃO use frases como "na próxima aula", "depois veremos", "isso vai preparar você para..."
O fechamento deve funcionar como um gancho de curiosidade genérico, válido independente de qual aula vier depois

IMPORTANTE

Este roteiro deve ser totalmente autocontido: precisa funcionar sozinho, em qualquer posição do curso
NUNCA mencione ou implique a existência de aulas anteriores ou seguintes
NUNCA use expressões como "como vimos", "na aula passada", "no próximo vídeo", "antes de continuarmos"
Use o submódulo apenas como contexto interno para calibrar o nível de profundidade — não para criar referências textuais na fala
Ignore quizzes, artigos e projetos entre as videoaulas
Não invente conteúdo além do informado acima
Não mencione informações ausentes no contexto

REGRAS DAS TAGS (obrigatório)

[FALA]: TODO texto que será falado em voz alta. Nenhuma frase falada pode ficar fora de [FALA].
[PAUSA]: APENAS silêncio na gravação. Conteúdo permitido: linha vazia, "..." ou no máximo "(respira)" / "(pausa curta)".
PROIBIDO: colocar frases, explicações ou parágrafos depois de [PAUSA].
[CÓDIGO NA TELA]: somente o que aparece na tela (listas, pseudocódigo, etc.).

Se houver mais fala depois de uma pausa, SEMPRE reabra com [FALA]:

Correto: [FALA] Primeira parte...

[PAUSA]

[FALA] Segunda parte...

Incorreto: [FALA] Primeira parte...

[PAUSA]

Segunda parte sem tag...

Outras regras:

Pausas retóricas no meio da fala → use "..." dentro do mesmo [FALA], não crie [PAUSA].
Use [PAUSA] no máximo 1 vez a cada 3–5 blocos [FALA], só em transições fortes na gravação.
Não use "---" ou linhas separadoras; mude de assunto com parágrafo em branco dentro de [FALA] ou com [PAUSA] + novo [FALA].

Antes de entregar, verifique:

Toda linha com texto falado está dentro de um bloco [FALA]?
Nenhum bloco [PAUSA] tem parágrafos de fala?
Depois de cada [PAUSA] vem imediatamente [FALA] ou [CÓDIGO NA TELA] se houver mais conteúdo?
O roteiro não menciona, cita ou dá dicas sobre aulas anteriores ou seguintes?

FORMATO DO ROTEIRO

Escreva como fala natural (não como texto formal)
Use frases curtas e médias (fáceis de falar em voz alta)
Separe o roteiro em blocos [FALA], [PAUSA] e [CÓDIGO NA TELA]
Gere apenas o roteiro da videoaula, sem explicar o processo

Exemplo de formatação:

[FALA] Você já parou pra pensar em como o computador decide entre duas opções? Hoje a gente vai destrinchar isso.

[PAUSA]

[FALA] Então bora entender como isso funciona na prática.

[PAUSA]

[FALA] Antes de continuar, preciso te contar uma coisa importante...

[CÓDIGO NA TELA]

1. Receber um número
2. Dividir esse número por 2

[FALA] Vamos passar por cada linha juntos...`
}

/**
 * Prompt pronto para colar em um LLM e gerar o roteiro da videoaula.
 * `sequenced` = com aulas vizinhas; `standalone` = autocontida.
 */
export function buildVideoScriptPrompt(
  style: VideoScriptStyleId,
  input: VideoScriptPromptInput,
): string {
  if (style === 'standalone') {
    return buildStandalonePrompt(input)
  }
  return buildSequencedPrompt(input)
}
