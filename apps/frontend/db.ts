import completeTaskRight from "./public/complete-task-right.svg";
import completeTaskLeft from "./public/complete-task-left.svg";
import incompleteTaskLeft from "./public/incomplete-task-left.svg";
import recordedClassIcon from "./public/recorded-class-icon.svg";
import incompleteRecordedClass from "./public/incomplete-recorded-class.svg";
import imcompleteTestIcon from "./public/imcomplete-test-icon.svg";
import quizTest from "./public/quiz-test-incomplete.svg";
import { StaticImageData } from "next/image";

interface Module {
  moduleName: string;
  submodules: Submodule[];
  level: string;
  locked: boolean;
  tags: string[];
  progress: number;
  completed: boolean;
}

interface Submodule {
  submoduleName: string;
  tasks: Task[];
}

export type Task = {
  id: number;
  title: string;
  category: string;
  image: StaticImageData;
  completed: boolean;
  locked?: boolean;
  videoUrl: string;
  type: string;
};

export interface ReactCourse {
  title: string;
  description: string;
  courseModules: Module[];
}

export const reactCourseData: ReactCourse = {
  title: "ReactJS",
  description:
    "In this React course, you’ll build powerful interactive applications with one of the most popular JavaScript libraries.",

  courseModules: [
    {
      moduleName: "Fundamentos do React",
      level: "Módulo - Nível 1",
      locked: false,
      progress: 56,
      tags: ["ReactJS", "Front-end"],
      completed: false,
      submodules: [
        {
          submoduleName: "Iniciando com ReactJS",
          tasks: [
            {
              id: 1,
              title: "Introdução",
              category: "ReactJS",
              image: recordedClassIcon,
              type: "video",
              completed: true,
              videoUrl: "https://streamable.com/e/y01s30?",
            },
            {
              id: 2,
              title: "Fundamentos do ReactJS",
              category: "ReactJS",
              image: recordedClassIcon,
              type: "video",
              completed: true,
              videoUrl: "https://streamable.com/e/y01s30?",
            },
            {
              id: 3,
              title: "CSS Modules",
              category: "ReactJS",
              image: incompleteRecordedClass,
              type: "video",
              completed: false,
              videoUrl: "https://streamable.com/e/y01s30?",
            },
            {
              id: 4,
              title: "Criando um projeto React",
              category: "ReactJS",
              image: incompleteRecordedClass,
              type: "video",
              completed: false,
              locked: false,
              videoUrl: "https://streamable.com/e/y01s30?",
            },
            {
              id: 5,
              title: "Componentes",
              category: "ReactJS",
              image: incompleteRecordedClass,
              type: "video",
              completed: false,
              locked: false,
              videoUrl: "https://streamable.com/e/y01s30?",
            },
            {
              id: 6,
              title: "Propriedades",
              category: "ReactJS",
              image: incompleteRecordedClass,
              type: "video",
              completed: false,
              locked: false,
              videoUrl: "https://streamable.com/e/y01s30?",
            },
            {
              id: 7,
              title: "Colors",
              category: "ReactJS",
              image: quizTest,
              type: "quiz",
              completed: false,
              locked: false,
              videoUrl: "https://streamable.com/e/y01s30?",
            },
            {
              id: 8,
              title: "Fundamentos ReactJS",
              category: "ReactJS",
              image: imcompleteTestIcon,
              completed: false,
              type: "project",
              locked: false,
              videoUrl: "https://streamable.com/e/y01s30?",
            },
          ],
        },
        {
          submoduleName: "Esrututura da aplicação",
          tasks: [
            {
              id: 9,
              title: "CSS Modules",
              category: "ReactJS",
              image: incompleteRecordedClass,
              completed: false,
              type: "video",
              locked: false,
              videoUrl: "/learn/catalog",
            },
            {
              id: 10,
              title: "CSS Global",
              category: "ReactJS",
              image: incompleteRecordedClass,
              completed: false,
              type: "video",
              locked: false,
              videoUrl: "/learn/catalog",
            },
            {
              id: 11,
              title: "Componentes: Header",
              category: "ReactJS",
              image: quizTest,
              completed: false,
              type: "quiz",
              locked: false,
              videoUrl: "/learn/catalog",
            },
            {
              id: 12,
              title: "Componentes: Sidebar",
              category: "ReactJS",
              image: imcompleteTestIcon,
              type: "project",
              completed: false,
              locked: false,
              videoUrl: "/learn/catalog",
            },
          ],
        },
      ],
    },
    {
      moduleName: "Aprofundando em Hooks",
      level: "Módulo - Nível 2",
      locked: true,
      progress: 0,
      tags: ["ReactJS", "Front-end"],
      completed: false,
      submodules: [
        {
          submoduleName: "Desbravando os Hooks",
          tasks: [
            {
              id: 1,
              title: "CSS Modules",
              category: "ReactJS",
              image: completeTaskRight,
              completed: false,
              locked: true,
              type: "video",
              videoUrl: "/learn/catalog",
            },
            {
              id: 2,
              title: "CSS Global",
              category: "ReactJS",
              image: completeTaskLeft,
              completed: false,
              locked: true,
              type: "video",
              videoUrl: "/learn/catalog",
            },
            {
              id: 3,
              title: "Componentes: Header",
              category: "ReactJS",
              image: incompleteTaskLeft,
              completed: false,
              locked: true,
              type: "video",
              videoUrl: "/learn/catalog",
            },
            {
              id: 4,
              title: "Componentes: Sidebar",
              category: "ReactJS",
              image: quizTest,
              type: "quiz",
              completed: false,
              locked: true,
              videoUrl: "/learn/catalog",
            },
          ],
        },
      ],
    },
    {
      moduleName: "Aprofundando em Hooks",
      level: "Módulo - Nível 2",
      locked: true,
      progress: 0,
      tags: ["ReactJS", "Front-end"],
      completed: false,
      submodules: [
        {
          submoduleName: "Desbravando os Hooks",
          tasks: [
            {
              id: 1,
              title: "CSS Modules",
              category: "ReactJS",
              image: completeTaskRight,
              completed: false,
              locked: true,
              type: "video",
              videoUrl: "/learn/catalog",
            },
            {
              id: 2,
              title: "CSS Global",
              category: "ReactJS",
              image: completeTaskLeft,
              completed: false,
              locked: true,
              type: "video",
              videoUrl: "/learn/catalog",
            },
            {
              id: 3,
              title: "Componentes: Header",
              category: "ReactJS",
              image: incompleteTaskLeft,
              completed: false,
              locked: true,
              type: "video",
              videoUrl: "/learn/catalog",
            },
            {
              id: 4,
              title: "Componentes: Sidebar",
              category: "ReactJS",
              image: quizTest,
              type: "quiz",
              completed: false,
              locked: true,
              videoUrl: "/learn/catalog",
            },
          ],
        },
      ],
    },
    {
      moduleName: "Aprofundando em Hooks",
      level: "Módulo - Nível 2",
      locked: true,
      progress: 0,
      tags: ["ReactJS", "Front-end"],
      completed: false,
      submodules: [
        {
          submoduleName: "Desbravando os Hooks",
          tasks: [
            {
              id: 1,
              title: "CSS Modules",
              category: "ReactJS",
              image: completeTaskRight,
              completed: false,
              locked: true,
              type: "video",
              videoUrl: "/learn/catalog",
            },
            {
              id: 2,
              title: "CSS Global",
              category: "ReactJS",
              image: completeTaskLeft,
              completed: false,
              locked: true,
              type: "video",
              videoUrl: "/learn/catalog",
            },
            {
              id: 3,
              title: "Componentes: Header",
              category: "ReactJS",
              image: incompleteTaskLeft,
              completed: false,
              locked: true,
              type: "video",
              videoUrl: "/learn/catalog",
            },
            {
              id: 4,
              title: "Componentes: Sidebar",
              category: "ReactJS",
              image: quizTest,
              type: "quiz",
              completed: false,
              locked: true,
              videoUrl: "/learn/catalog",
            },
          ],
        },
      ],
    },
    {
      moduleName: "Aprofundando em Hooks",
      level: "Módulo - Nível 2",
      locked: true,
      progress: 0,
      tags: ["ReactJS", "Front-end"],
      completed: false,
      submodules: [
        {
          submoduleName: "Desbravando os Hooks",
          tasks: [
            {
              id: 1,
              title: "CSS Modules",
              category: "ReactJS",
              image: completeTaskRight,
              completed: false,
              locked: true,
              type: "video",
              videoUrl: "/learn/catalog",
            },
            {
              id: 2,
              title: "CSS Global",
              category: "ReactJS",
              image: completeTaskLeft,
              completed: false,
              locked: true,
              type: "video",
              videoUrl: "/learn/catalog",
            },
            {
              id: 3,
              title: "Componentes: Header",
              category: "ReactJS",
              image: incompleteTaskLeft,
              completed: false,
              locked: true,
              type: "video",
              videoUrl: "/learn/catalog",
            },
            {
              id: 4,
              title: "Componentes: Sidebar",
              category: "ReactJS",
              image: quizTest,
              type: "quiz",
              completed: false,
              locked: true,
              videoUrl: "/learn/catalog",
            },
          ],
        },
      ],
    },
  ],
};
