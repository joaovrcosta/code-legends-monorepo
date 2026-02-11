// Type definition for the task
interface Task {
  id: number;
  title: string;
  category: string;
  image: string;
  completed: boolean;
  locked?: boolean; // Optional, since not all tasks have this property
  url: string;
}

// Type definition for the submodule
interface Submodule {
  submoduleName: string;
  tasks: Task[];
}

// Type definition for the module
interface Module {
  moduleName: string;
  submodules: Submodule[];
}

// Type definition for the React course
export interface ReactCourse {
  name: string;
  description: string;
  courseModules: Module[];
}

// The actual course object following the type
export const ReactCourse: ReactCourse = {
  name: "ReactJS",
  description: "Aprenda a construir interfaces de usuário com ReactJS",
  courseModules: [
    {
      moduleName: "Fundamentos do React",
      submodules: [
        {
          submoduleName: "Iniciando com ReactJS",
          tasks: [
            {
              id: 1,
              title: "Introdução",
              category: "ReactJS",
              image: "completeTaskRight",
              completed: true,
              url: "/learn/catalog",
            },
            {
              id: 2,
              title: "Fundamentos do ReactJS",
              category: "ReactJS",
              image: "completeTaskLeft",
              completed: true,
              url: "/learn/catalog",
            },
            {
              id: 3,
              title: "Bundlers & Compilers",
              category: "ReactJS",
              image: "incompleteTaskLeft",
              completed: false,
              url: "/learn/catalog",
            },
            {
              id: 4,
              title: "Criando um projeto React",
              category: "ReactJS",
              image: "incompleteTaskRight",
              completed: false,
              locked: true,
              url: "/learn/catalog",
            },
            {
              id: 5,
              title: "Componentes",
              category: "ReactJS",
              image: "incompleteTaskLeft",
              completed: false,
              locked: true,
              url: "/learn/catalog",
            },
            {
              id: 6,
              title: "Propriedades",
              category: "ReactJS",
              image: "incompleteTaskLeft",
              completed: false,
              locked: true,
              url: "/learn/catalog",
            },
            {
              id: 7,
              title: "Quiz - Iniciando com ReactJS",
              category: "ReactJS",
              image: "quizTest",
              completed: false,
              locked: true,
              url: "/learn/catalog",
            },
          ],
        },
        {
          submoduleName: "Estrutura de Aplicação",
          tasks: [
            {
              id: 8,
              title: "Ciclo de Vida",
              category: "ReactJS",
              image: "incompleteTaskLeft",
              completed: false,
              locked: true,
              url: "/learn/catalog",
            },
            {
              id: 9,
              title: "Hooks",
              category: "ReactJS",
              image: "incompleteTaskRight",
              completed: false,
              locked: true,
              url: "/learn/catalog",
            },
            {
              id: 10,
              title: "Gerenciamento de Estado",
              category: "ReactJS",
              image: "incompleteTaskLeft",
              completed: false,
              locked: true,
              url: "/learn/catalog",
            },
            {
              id: 11,
              title: "Context API",
              category: "ReactJS",
              image: "incompleteTaskRight",
              completed: false,
              locked: true,
              url: "/learn/catalog",
            },
            {
              id: 12,
              title: "Quiz - Estrutura de Aplicação",
              category: "ReactJS",
              image: "quizTest",
              completed: false,
              locked: true,
              url: "/learn/catalog",
            },
          ],
        },
      ],
    },
  ],
};
