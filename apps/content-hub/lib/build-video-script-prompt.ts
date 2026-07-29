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
      description: 'Tom dinâmico; conecta abertura e encerramento às videoaulas vizinhas',
    },
    {
      id: 'standalone',
      label: 'Autocontida',
      description: 'Tom dinâmico; roteiro independente, sem referências a outras aulas',
    },
  ]

export type VideoScriptPromptInput = {
  title: string
  description: string
  courseTitle?: string
  moduleTitle?: string
  groupTitle?: string
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

const STYLE_GUIDELINES = `💡 DIRETRIZES DE ESTILO E ENGAJAMENTO (ESTILO DEV/DINÂMICO)

Linguagem Viva e Coloquial: Use expressões naturais do meio dev sem exagerar (ex: "Bora lá", "Se liga só", "Na prática", "Pulo do gato", "Sem segredo", "Num estalo", "Direto ao ponto").

Analogias Poderosas: Use metáforas do mundo real (apps, compras, jogos, rotinas) para explicar conceitos abstratos de código. A analogia deve enriquecer a explicação de forma simples.

Ritmo Confortável e Oratória Fluida: Escreva exatamente como uma pessoa fala. Alterne frases curtas com perguntas retóricas; use "..." dentro de [FALA] para pausas de pensamento e entonação. Use [PAUSA] só para momentos de silêncio real na gravação.

Abordagem Visual e Ativa: Descreva o conceito do que acontece na tela enquanto o código é exibido. Evite apenas ler linhas de código; explique o porquê e o resultado.`

const TAG_RULES = `⚠️ REGRAS RÍGIDAS DE TAGS (OBRIGATÓRIO)

[FALA]: TODO o texto falado deve estar estritamente dentro desta tag.

[PAUSA]: Usada APENAS para momentos de silêncio do gravador. Conteúdo permitido: linha vazia, "..." ou "(pausa curta)". PROIBIDO colocar frases ou explicações dentro ou após a tag de pausa sem abrir um novo bloco de fala.

[CÓDIGO NA TELA]: Somente o que aparece na tela (código, pseudocódigo, tópicos visuais). NÃO envolva o conteúdo com crases de bloco Markdown (\`\`\`); escreva o código/texto puro diretamente dentro da tag.

Regra de ouro de reabertura: Se houver texto a ser falado após um [PAUSA] ou [CÓDIGO NA TELA], SEMPRE abra um novo bloco [FALA].

Correto:
[FALA] Primeira parte do raciocínio...

[PAUSA]

[FALA] Segunda parte do raciocínio que continua aqui...

Incorreto:
[FALA] Primeira parte do raciocínio...

[PAUSA]

Segunda parte sem tag...

Outras regras:
- Pausas na oratória: Use "..." dentro do mesmo [FALA]. Reserve a tag [PAUSA] apenas para transições marcantes (use no máximo 1 vez a cada 3–5 blocos).
- Não use "---" ou linhas separadoras; mude de assunto com parágrafo em branco dentro de [FALA] ou com [PAUSA] + novo [FALA].

Antes de entregar, verifique:
1. Toda linha com texto falado está dentro de um bloco [FALA]?
2. Nenhum bloco [PAUSA] tem parágrafos de fala?
3. Depois de cada [PAUSA] vem imediatamente [FALA] ou [CÓDIGO NA TELA] se houver mais conteúdo?`

const OUTPUT_FORMAT = `FORMATO DE SAÍDA

Gere apenas o roteiro pronto para leitura/gravação formatado com as tags [FALA], [PAUSA] e [CÓDIGO NA TELA], sem adendos ou explicações sobre o processo.

Escreva como fala natural (não como texto formal). Use frases curtas e médias, fáceis de falar em voz alta.`

function buildSequencedPrompt(input: VideoScriptPromptInput): string {
  const { title, description, duration, contextParts } = lessonMeta(input)
  const adjacent = input.adjacent ?? null

  const videoNeighborsBlock = adjacent
    ? `
VIDEOAULAS VIZINHAS

${adjacent.previous
      ? formatVideoNeighborBlock('Videoaula anterior', adjacent.previous)
      : 'Videoaula anterior: não há videoaula anterior neste curso.'
    }

${adjacent.next
      ? formatVideoNeighborBlock('Próxima videoaula', adjacent.next)
      : 'Próxima videoaula: não há próxima videoaula neste curso.'
    }
`
    : ''

  return `Você é um especialista em ensino de programação e criação de roteiros para videoaulas educacionais, inspirado no estilo de explicação dinâmico, moderno e altamente engajador (no tom da Rocketseat / Diego Fernandes e "The Joy of React", mas adaptado para vídeo).

Crie um roteiro de videoaula com linguagem 100% natural, informal, didática e empolgante, pensada exatamente para ser ouvida e falada.

${STYLE_GUIDELINES}

---

DADOS DA AULA

Tema da aula: ${title}

Objetivo da aula: ${description}

Duração estimada: ${duration}
${contextParts.length
      ? `
Contexto da aula:
${contextParts.join('\n')}
`
      : ''
    }${videoNeighborsBlock}
---

ESTRUTURA DO ROTEIRO

Abertura (Hook Chiclete):
Comece com uma pergunta reflexiva, provocação ou situação curiosa do dia a dia sobre o tema.
Prenda a atenção nos primeiros 5 segundos.
Quando existir videoaula anterior, conecte a abertura a ela de forma natural e breve (sem resumir a aula inteira).

Contextualização Rápida:
Explique por que esse conceito importa no "mundo real".
Mostre onde ele aparece na prática em aplicações famosas ou cenários do cotidiano.

Explicação Principal (Progressiva):
Vá do conceito simples ao técnico de forma fluida.
Quebre ideias em blocos curtos, como alguém conversando ao vivo.
Se precisar de um pré-requisito, apresente como um lembrete rápido e autoexplicativo.

Demonstração / Exemplo Prático:
Apresente o código ou trecho conceitual na tela.
Explique a lógica por trás enquanto "mostra" o código na tela.

Insight / O "Pulo do Gato":
Destaque um erro clássico de iniciante, um bug misterioso ou uma dica valiosa sobre o tema.
Entregue o segredo para evitar esse problema.

Recap Rápido & Encerramento:
Recapitule os pontos essenciais em 2 ou 3 frases curtas.
Quando existir próxima videoaula, feche com uma ponte natural para ela — sem explicar o conteúdo dela; só crie transição.
Quando não houver próxima, feche reforçando a utilidade do conceito e abrindo curiosidade para continuar codando.
Use bordões de fechamento amigáveis (ex: "Pensa nisso... e nos vemos no código!").

IMPORTANTE

Considere a sequência do curso ao escrever o roteiro.
Conecte a abertura com a videoaula anterior (se existir).
Use o submódulo como contexto para manter a aula alinhada com a jornada do aluno.
Ao finalizar, crie uma ponte natural para a próxima videoaula (se existir).
Ignore quizzes, artigos e projetos entre as videoaulas.
Não invente conteúdo além do informado acima.
Não mencione informações ausentes no contexto.

${TAG_RULES}

${OUTPUT_FORMAT}

Exemplo de formatação:

[FALA] Na aula passada a gente viu o conceito... e hoje a gente vai praticar de verdade. Bora lá?

[PAUSA]

[FALA] Então agora... se liga só. Você vai criar o seu primeiro algoritmo.

[CÓDIGO NA TELA]
1. Receber um número
2. Dividir esse número por 2

[FALA] Vamos passar por cada linha juntos...`
}

function buildStandalonePrompt(input: VideoScriptPromptInput): string {
  const { title, description, duration, contextParts } = lessonMeta(input)

  return `Você é um especialista em ensino de programação e criação de roteiros para videoaulas educacionais, inspirado no estilo de explicação dinâmico, moderno e altamente engajador (no tom da Rocketseat / Diego Fernandes e "The Joy of React", mas adaptado para vídeo).

Crie um roteiro de videoaula com linguagem 100% natural, informal, didática e empolgante, pensada exatamente para ser ouvida e falada.

${STYLE_GUIDELINES}

---

DADOS DA AULA

Tema da aula: ${title}

Objetivo da aula: ${description}

Duração estimada: ${duration}
${contextParts.length
      ? `
Contexto da aula: ${contextParts.join(' | ')}
`
      : ''
    }
---

ESTRUTURA DO ROTEIRO

Abertura (Hook Chiclete):
Comece com uma pergunta reflexiva, provocação ou situação curiosa do dia a dia sobre o tema.
Prenda a atenção nos primeiros 5 segundos.
Não referencie outras aulas do curso.

Contextualização Rápida:
Explique por que esse conceito importa no "mundo real".
Mostre onde ele aparece na prática em aplicações famosas ou cenários do cotidiano.

Explicação Principal (Progressiva):
Vá do conceito simples ao técnico de forma fluida.
Quebre ideias em blocos curtos, como alguém conversando ao vivo.
Se precisar de um pré-requisito, apresente como um lembrete rápido e autoexplicativo (sem falar "como vimos antes").

Demonstração / Exemplo Prático:
Apresente o código ou trecho conceitual na tela.
Explique a lógica por trás enquanto "mostra" o código na tela.

Insight / O "Pulo do Gato":
Destaque um erro clássico de iniciante, um bug misterioso ou uma dica valiosa sobre o tema.
Entregue o segredo para evitar esse problema.

Recap Rápido & Encerramento:
Recapitule os pontos essenciais em 2 ou 3 frases curtas.
Feche reforçando a utilidade do conceito e abrindo espaço mental/curiosidade para continuar codando.
Use bordões de fechamento amigáveis (ex: "Pensa nisso... e nos vemos no código!").
NÃO cite "próxima aula", "vídeo seguinte" ou expressões parecidas.

IMPORTANTE

Este roteiro deve ser totalmente autocontido: precisa funcionar sozinho, em qualquer posição do curso.
NUNCA mencione ou implique a existência de aulas anteriores ou seguintes.
NUNCA use expressões como "como vimos", "na aula passada", "no próximo vídeo", "antes de continuarmos", "depois veremos".
Use o submódulo apenas como contexto interno para calibrar o nível de profundidade — não para criar referências textuais na fala.
Ignore quizzes, artigos e projetos entre as videoaulas.
Não invente conteúdo além do informado acima.
Não mencione informações ausentes no contexto.

${TAG_RULES}

Antes de entregar, verifique também:
4. O roteiro não menciona, cita ou dá dicas sobre aulas anteriores ou seguintes?

${OUTPUT_FORMAT}

Exemplo de formatação:

[FALA] Você já parou pra pensar em como o computador decide entre duas opções? Hoje a gente vai destrinchar isso. Bora lá?

[PAUSA]

[FALA] Então... se liga só. Na prática isso aparece o tempo todo.

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
