import { PrismaClient, LessonType } from '@prisma/client'
import { hashSync } from 'bcryptjs'
import { SEED_PLAN_FEATURES } from '@code-legends/plans'
import { seedPaymentProviders } from './scripts/seed-payment-providers'

/** Deve coincidir com apps/api/src/constants/default-certificate-template.ts */
const DEFAULT_CERTIFICATE_TEMPLATE_ID = 'clseed_default_certificate_template'

const prisma = new PrismaClient()

const COURSE_SLUG = 'fundamentos-frontend-completo'
const INSTRUCTOR_EMAIL = 'seed-instructor@codelegends.com.br'

const SKILLS = [
  {
    slug: 'general',
    name: 'Geral',
    description: 'XP global/bônus não atribuído a uma skill específica.',
  },
  {
    slug: 'javascript',
    name: 'JavaScript',
    description: 'Fundamentos e práticas modernas de JavaScript para web.',
  },
  {
    slug: 'web-development',
    name: 'Web Development',
    description: 'Desenvolvimento web full stack com foco em front-end.',
  },
  {
    slug: 'html',
    name: 'HTML',
    description: 'Estruturação de documentos e semântica para a web.',
  },
  {
    slug: 'css',
    name: 'CSS',
    description: 'Estilização, layout e responsividade para interfaces web.',
  },
  {
    slug: 'react',
    name: 'React',
    description: 'Desenvolvimento de interfaces reativas com React.',
  },
]

const PLANS = [
  {
    slug: 'FREE',
    name: 'Plano gratuito',
    description: 'Acesso a conteúdos gratuitos do catálogo.',
    colorHex: '#B8E62E',
    amountCents: 0,
    order: 0,
    externalId: null,
    productName: null,
  },
  {
    slug: 'PRO',
    name: 'Code Legends PRO',
    description:
      'Acesso a todos os conteúdos do catálogo, certificados e suporte. Assinatura anual.',
    colorHex: '#8234E9',
    amountCents: 19700,
    order: 1,
    externalId: 'CODE-LEGENDS-PRO',
    productName: 'Code Legends PRO - Assinatura anual',
  },
  {
    slug: 'PREMIUM',
    name: 'Code Legends PREMIUM',
    description:
      'Tudo do PRO com mentorias, vagas e certificados ilimitados. Assinatura anual.',
    colorHex: '#FF6200',
    amountCents: 39700,
    order: 2,
    externalId: 'CODE-LEGENDS-PREMIUM',
    productName: 'Code Legends PREMIUM - Assinatura anual',
  },
]

async function main() {
  console.log('🌱 Seeding database...')

  await prisma.certificateTemplate.upsert({
    where: { id: DEFAULT_CERTIFICATE_TEMPLATE_ID },
    update: {
      name: 'Code Legends — Conclusão (padrão)',
      description:
        'Template base listado no Content Hub. O layout do PDF/visual na conta do aluno usa o design da plataforma; o registro vincula emissões e o painel admin.',
    },
    create: {
      id: DEFAULT_CERTIFICATE_TEMPLATE_ID,
      name: 'Code Legends — Conclusão (padrão)',
      description:
        'Template base listado no Content Hub. O layout do PDF/visual na conta do aluno usa o design da plataforma; o registro vincula emissões e o painel admin.',
    },
  })
  console.log('✅ Default certificate template seeded!')

  // 0. Planos
  for (const plan of PLANS) {
    const features = SEED_PLAN_FEATURES[plan.slug] ?? []
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: { features },
      create: { ...plan, features },
    })
  }
  console.log('✅ Plans seeded!')

  const categories = [
    {
      name: 'Front-end',
      slug: 'front-end',
      description: 'Desenvolvimento de interfaces e experiência do usuário',
      icon: '💻',
      color: '#3B82F6',
      order: 1,
    },
    {
      name: 'Back-end',
      slug: 'back-end',
      description: 'Desenvolvimento de APIs e lógica de servidor',
      icon: '⚙️',
      color: '#10B981',
      order: 2,
    },
    {
      name: 'Designer',
      slug: 'designer',
      description: 'Design UI/UX e interfaces visuais',
      icon: '🎨',
      color: '#EC4899',
      order: 3,
    },
    {
      name: 'Inglês',
      slug: 'ingles',
      description: 'Aprendizado de idiomas',
      icon: '🗣️',
      color: '#F59E0B',
      order: 4,
    },
    {
      name: 'Empreendedorismo',
      slug: 'empreendedorismo',
      description: 'Negócios e gestão',
      icon: '💼',
      color: '#8B5CF6',
      order: 5,
    },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    })
  }

  const frontEndCategory = await prisma.category.findUniqueOrThrow({
    where: { slug: 'front-end' },
  })
  console.log('✅ Categories seeded!')

  // 2. Instrutor para o curso
  const hashedPassword = hashSync('instructor123', 10)
  const instructor = await prisma.user.upsert({
    where: { email: INSTRUCTOR_EMAIL },
    update: {},
    create: {
      email: INSTRUCTOR_EMAIL,
      name: 'Instrutor Code Legends',
      password: hashedPassword,
      role: 'INSTRUCTOR',
      slug: 'instrutor-code-legends',
    },
  })
  console.log('✅ Instructor seeded!')

  // 3. Curso completo (só cria se não existir)
  const existingCourse = await prisma.course.findUnique({
    where: { slug: COURSE_SLUG },
  })

  if (existingCourse) {
    console.log('⏭️  Course already exists, skipping course seed.')
    // continua o seed para criar entidades novas (ex.: carreiras)
  }

  const course =
    existingCourse ??
    (await prisma.course.create({
      data: {
        title: 'Full Stack',
        slug: COURSE_SLUG,
        description:
          'Aprenda HTML, CSS, JavaScript e React em um curso completo e prático. Do primeiro tag à sua primeira aplicação publicada na web. Inclui projetos reais e boas práticas do mercado.',
        level: 'Iniciante',
        instructorId: instructor.id,
        categoryId: frontEndCategory.id,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        isFree: false,
        active: true,
        releaseAt: new Date(),
        colorHex: '#3B82F6',
        icon: 'https://xesque.rocketseat.dev/platform/1760965821149.svg',
        tags: {
          connectOrCreate: [
            { where: { name: 'HTML' }, create: { name: 'HTML' } },
            { where: { name: 'CSS' }, create: { name: 'CSS' } },
            { where: { name: 'JavaScript' }, create: { name: 'JavaScript' } },
            { where: { name: 'React' }, create: { name: 'React' } },
          ],
        },
      },
    }))

  // 3.1 Skills e vínculo com o curso (para XP por skill)
  for (const skill of SKILLS) {
    await prisma.skill.upsert({
      where: { slug: skill.slug },
      update: {},
      create: skill,
    })
  }

  const javascriptSkill = await prisma.skill.findUnique({
    where: { slug: 'javascript' },
  })
  const webSkill = await prisma.skill.findUnique({
    where: { slug: 'web-development' },
  })
  const reactSkill = await prisma.skill.findUnique({
    where: { slug: 'react' },
  })

  if (javascriptSkill && webSkill && reactSkill) {
    const existingCourseSkills = await prisma.courseSkill.findMany({
      where: { courseId: course.id },
    })

    if (existingCourseSkills.length === 0) {
      await prisma.courseSkill.createMany({
        data: [
          {
            courseId: course.id,
            skillId: javascriptSkill.id,
            weight: 40,
          },
          {
            courseId: course.id,
            skillId: webSkill.id,
            weight: 35,
          },
          {
            courseId: course.id,
            skillId: reactSkill.id,
            weight: 25,
          },
        ],
      })
      console.log('✅ Skills e CourseSkills seeded para o curso principal!')
    }
  }

  // 4. Módulos e conteúdo
  const LESSON_TYPE_MAP: Record<string, LessonType> = {
    video: LessonType.VIDEO,
    article: LessonType.ARTICLE,
    text: LessonType.TEXT,
    quiz: LessonType.QUIZ,
    project: LessonType.PROJECT,
  }

  const modulesData = [
    {
      title: 'Módulo 1: HTML e estrutura da web',
      slug: 'modulo-1-html',
      orderIndex: 0,
      groups: [
        {
          title: 'Introdução ao HTML',
          orderIndex: 0,
          lessons: [
            {
              title: 'O que é HTML e por que aprender',
              description: 'História da web e papel do HTML.',
              type: 'video',
              slug: 'o-que-e-html',
              order: 0,
              video_duration: '8:00',
            },
            {
              title: 'Estrutura básica de um documento',
              description: 'DOCTYPE, html, head e body.',
              type: 'video',
              slug: 'estrutura-basica',
              order: 1,
              video_duration: '12:00',
            },
            {
              title: 'Tags de texto e headings',
              description: 'h1 a h6, p, strong, em.',
              type: 'video',
              slug: 'tags-texto-headings',
              order: 2,
              video_duration: '15:00',
            },
          ],
        },
        {
          title: 'Links, listas e imagens',
          orderIndex: 1,
          lessons: [
            {
              title: 'Links e âncoras',
              description: 'Tag a, href, target e acessibilidade.',
              type: 'video',
              slug: 'links-ancoras',
              order: 0,
              video_duration: '10:00',
            },
            {
              title: 'Listas ordenadas e não ordenadas',
              description: 'ul, ol, li.',
              type: 'video',
              slug: 'listas',
              order: 1,
              video_duration: '8:00',
            },
            {
              title: 'Imagens e atributos alt',
              description: 'Tag img e boas práticas.',
              type: 'video',
              slug: 'imagens-alt',
              order: 2,
              video_duration: '11:00',
            },
          ],
        },
      ],
    },
    {
      title: 'Módulo 2: CSS e layout',
      slug: 'modulo-2-css',
      orderIndex: 1,
      groups: [
        {
          title: 'CSS do zero',
          orderIndex: 0,
          lessons: [
            {
              title: 'Introdução ao CSS',
              description: 'Seletores, propriedades e valores.',
              type: 'video',
              slug: 'introducao-css',
              order: 0,
              video_duration: '14:00',
            },
            {
              title: 'Cores, fontes e espaçamento',
              description: 'color, font-family, margin, padding.',
              type: 'video',
              slug: 'cores-fontes-espacamento',
              order: 1,
              video_duration: '18:00',
            },
            {
              title: 'Box model na prática',
              description: 'content, padding, border, margin.',
              type: 'video',
              slug: 'box-model',
              order: 2,
              video_duration: '12:00',
            },
          ],
        },
        {
          title: 'Layout com Flexbox e Grid',
          orderIndex: 1,
          lessons: [
            {
              title: 'Flexbox: conceitos e eixos',
              description: 'display flex, flex-direction, justify e align.',
              type: 'video',
              slug: 'flexbox-conceitos',
              order: 0,
              video_duration: '20:00',
            },
            {
              title: 'CSS Grid: linhas e áreas',
              description: 'grid-template-columns, gap, grid-area.',
              type: 'video',
              slug: 'css-grid',
              order: 1,
              video_duration: '22:00',
            },
            {
              title: 'Projeto: layout responsivo',
              description: 'Montando uma página que se adapta ao mobile.',
              type: 'video',
              slug: 'projeto-layout-responsivo',
              order: 2,
              video_duration: '25:00',
            },
          ],
        },
      ],
    },
    {
      title: 'Módulo 3: JavaScript no navegador',
      slug: 'modulo-3-javascript',
      orderIndex: 2,
      groups: [
        {
          title: 'Sintaxe e fundamentos',
          orderIndex: 0,
          lessons: [
            {
              title: 'Variáveis e tipos',
              description: 'let, const, string, number, boolean.',
              type: 'video',
              slug: 'variaveis-tipos',
              order: 0,
              video_duration: '16:00',
            },
            {
              title: 'Funções e escopo',
              description: 'Declaração, parâmetros e return.',
              type: 'video',
              slug: 'funcoes-escopo',
              order: 1,
              video_duration: '18:00',
            },
            {
              title: 'Arrays e objetos',
              description: 'Manipulação de dados e métodos comuns.',
              type: 'video',
              slug: 'arrays-objetos',
              order: 2,
              video_duration: '20:00',
            },
          ],
        },
        {
          title: 'DOM e eventos',
          orderIndex: 1,
          lessons: [
            {
              title: 'Acessando o DOM',
              description: 'querySelector, getElementById e navegação.',
              type: 'video',
              slug: 'acessando-dom',
              order: 0,
              video_duration: '15:00',
            },
            {
              title: 'Eventos do usuário',
              description: 'addEventListener, click, submit e preventDefault.',
              type: 'video',
              slug: 'eventos-usuario',
              order: 1,
              video_duration: '19:00',
            },
            {
              title: 'Projeto: lista interativa',
              description: 'Criando uma lista com add/remove em JS puro.',
              type: 'video',
              slug: 'projeto-lista-interativa',
              order: 2,
              video_duration: '24:00',
            },
          ],
        },
      ],
    },
    {
      title: 'Módulo 4: React na prática',
      slug: 'modulo-4-react',
      orderIndex: 3,
      groups: [
        {
          title: 'Primeiros passos em React',
          orderIndex: 0,
          lessons: [
            {
              title: 'O que é React e por que usar',
              description: 'Componentes, virtual DOM e ecossistema.',
              type: 'video',
              slug: 'o-que-e-react',
              order: 0,
              video_duration: '12:00',
            },
            {
              title: 'Componentes e JSX',
              description: 'Criando seu primeiro componente.',
              type: 'video',
              slug: 'componentes-jsx',
              order: 1,
              video_duration: '18:00',
            },
            {
              title: 'Props e composição',
              description: 'Passando dados entre componentes.',
              type: 'video',
              slug: 'props-composicao',
              order: 2,
              video_duration: '16:00',
            },
          ],
        },
        {
          title: 'Estado e ciclo de vida',
          orderIndex: 1,
          lessons: [
            {
              title: 'useState na prática',
              description: 'Estado local e atualizações.',
              type: 'video',
              slug: 'usestate-pratica',
              order: 0,
              video_duration: '20:00',
            },
            {
              title: 'useEffect e side effects',
              description: 'Requisições e subscriptions.',
              type: 'video',
              slug: 'useeffect-side-effects',
              order: 1,
              video_duration: '22:00',
            },
            {
              title: 'Projeto: app de tarefas',
              description: 'CRUD completo com React e persistência.',
              type: 'video',
              slug: 'projeto-app-tarefas',
              order: 2,
              video_duration: '30:00',
            },
          ],
        },
      ],
    },
  ]

  for (const mod of modulesData) {
    const createdModule = await prisma.module.upsert({
      where: {
        slug_courseId: {
          slug: mod.slug,
          courseId: course.id,
        },
      },
      update: {
        title: mod.title,
        orderIndex: mod.orderIndex,
      },
      create: {
        title: mod.title,
        slug: mod.slug,
        courseId: course.id,
        orderIndex: mod.orderIndex,
      },
    })

    for (const grp of mod.groups) {
      const existingGroup = await prisma.submodule.findFirst({
        where: { moduleId: createdModule.id, title: grp.title },
      })
      const createdGroup =
        existingGroup ??
        (await prisma.submodule.create({
          data: {
            title: grp.title,
            moduleId: createdModule.id,
            orderIndex: grp.orderIndex,
          },
        }))

      for (const les of grp.lessons) {
        const existingLesson = await prisma.lesson.findFirst({
          where: { slug: les.slug, submoduleId: createdGroup.id },
        })
        if (!existingLesson) {
          await prisma.lesson.create({
            data: {
              title: les.title,
              description: les.description,
              type: LESSON_TYPE_MAP[les.type] ?? LessonType.VIDEO,
              slug: les.slug,
              submoduleId: createdGroup.id,
              order: les.order,
              authorId: instructor.id,
              video_duration: les.video_duration ?? null,
              isFree: false,
              locked: false,
            },
          })
        }
      }
    }
  }

  console.log(
    "✅ Course 'Fundamentos de Front-end' created with 4 modules and 24 lessons!",
  )

  // 5. Carreira exemplo (Fullstack) com 1 módulo e 2 exames
  const career = await prisma.career.upsert({
    where: { slug: 'fullstack' },
    update: {},
    create: {
      slug: 'fullstack',
      title: 'Fullstack',
      description:
        'Trilha completa para dominar Front-end e Back-end com certificações por módulo.',
      colorHex: '#00C8FF',
      active: true,
    },
  })

  const careerModule = await prisma.careerModule.upsert({
    where: {
      // não temos unique por (careerId, orderIndex), então fazemos find + create
      id: (await prisma.careerModule.findFirst({
        where: { careerId: career.id, orderIndex: 0 },
        select: { id: true },
      }))?.id ?? '___missing___',
    },
    update: {},
    create: {
      careerId: career.id,
      title: 'Web Development Foundations',
      description:
        'Fundamentos para iniciar sua jornada Fullstack (com exames de certificação).',
      orderIndex: 0,
    },
  }).catch(async () => {
    // fallback quando o upsert acima falhar por id placeholder
    const existing = await prisma.careerModule.findFirst({
      where: { careerId: career.id, orderIndex: 0 },
    })
    if (existing) return existing
    return prisma.careerModule.create({
      data: {
        careerId: career.id,
        title: 'Web Development Foundations',
        description:
          'Fundamentos para iniciar sua jornada Fullstack (com exames de certificação).',
        orderIndex: 0,
      },
    })
  })

  // Vincula o curso seedado ao módulo da carreira
  await prisma.careerModuleCourse.upsert({
    where: {
      careerModuleId_courseId: {
        careerModuleId: careerModule.id,
        courseId: course.id,
      },
    },
    update: { orderIndex: 0 },
    create: {
      careerModuleId: careerModule.id,
      courseId: course.id,
      orderIndex: 0,
    },
  })

  const exam1 = await prisma.careerExam.upsert({
    where: { careerId_slug: { careerId: career.id, slug: 'objective-assessment-1' } },
    update: {},
    create: {
      careerId: career.id,
      slug: 'objective-assessment-1',
      title: 'Objective assessment – Part 1',
      description: 'Exame de certificação do módulo – Parte 1.',
      passingScore: 70,
      content: {
        challenges: [
          {
            type: 'conceptual',
            question: 'Qual tag HTML define o título principal da página?',
            options: ['<title>', '<h1>', '<header>', '<strong>'],
            correctAnswer: '<h1>',
            explanation:
              '`<h1>` representa o heading de maior importância no conteúdo da página.',
          },
          {
            type: 'conceptual',
            question: 'Qual propriedade CSS define a cor do texto?',
            options: ['background', 'color', 'font-style', 'border-color'],
            correctAnswer: 'color',
          },
        ],
      },
    },
  })

  const exam2 = await prisma.careerExam.upsert({
    where: { careerId_slug: { careerId: career.id, slug: 'objective-assessment-2' } },
    update: {},
    create: {
      careerId: career.id,
      slug: 'objective-assessment-2',
      title: 'Objective assessment – Part 2',
      description: 'Exame de certificação do módulo – Parte 2.',
      passingScore: 70,
      content: {
        challenges: [
          {
            type: 'conceptual',
            question: 'Qual método adiciona um evento de clique em um elemento?',
            options: ['addEventListener', 'querySelector', 'appendChild', 'setTimeout'],
            correctAnswer: 'addEventListener',
          },
          {
            type: 'conceptual',
            question: 'No React, qual hook controla estado local?',
            options: ['useMemo', 'useState', 'useEffect', 'useRef'],
            correctAnswer: 'useState',
          },
        ],
      },
    },
  })

  await prisma.careerModuleExam.upsert({
    where: {
      careerModuleId_examIndex: { careerModuleId: careerModule.id, examIndex: 1 },
    },
    update: { careerExamId: exam1.id },
    create: {
      careerModuleId: careerModule.id,
      careerExamId: exam1.id,
      examIndex: 1,
    },
  })

  await prisma.careerModuleExam.upsert({
    where: {
      careerModuleId_examIndex: { careerModuleId: careerModule.id, examIndex: 2 },
    },
    update: { careerExamId: exam2.id },
    create: {
      careerModuleId: careerModule.id,
      careerExamId: exam2.id,
      examIndex: 2,
    },
  })

  console.log('✅ Career (Fullstack) seeded with 1 module + 2 exams!')

  await seedPaymentProviders(prisma)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
