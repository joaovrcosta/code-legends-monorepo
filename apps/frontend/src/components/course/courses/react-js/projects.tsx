import Image from "next/image";
import Link from "next/link";

const projects = [
  {
    id: 1,
    title: "Lando Norris",
    image: "/68eb96833074e144081699.jpg",
    description:
      "A high-performance platform for F1 driver Lando Norris, capturing his energy and racing passion through dynamic interactions, bold visuals, and a digital experience as engaging as he is",
    url: "#",
    glow: "from-[#242c37] via-[#6eb5ff] to-transparent", // cinza-azulado
    shadowColor: "#07507c", // azul claro shadow card 3
  },
  {
    id: 2,
    title: "Solved",
    image: "/project-1-haha.jpg",
    description:
      "Um sistema de design moderno para acelerar o desenvolvimento front-end.",
    url: "#",
    glow: "from-[#71b7fb] via-[#184b77] to-transparent", // azul predominante
    shadowColor: "#FF6138", // laranja shadow card 1
  },
  {
    id: 3,
    title: "Tobiko",
    image: "/unnamed (5).jpg",
    description:
      "Tobiko is a modern transformation platform that helps data engineers cut waste, blind spots, and preventable errors in their workflows.",
    url: "#",
    glow: "from-[#7f2200] via-[#7f2200] to-transparent", // roxo predominante
    shadowColor: "#7f2200", // roxo shadow card 2
  },
  {
    id: 4,
    title: "Tech Portifólio",
    image: "/project-2-haha.jpg",
    description: "Página inicial para games. Totalmente responsiva e estilosa.",
    url: "#",
    glow: "from-[#242c37] via-[#6eb5ff] to-transparent", // cinza-azulado
    shadowColor: "#07507c", // azul claro shadow card 3
  },
];

export function CourseProjects() {
  return (
    <div className="grid lg:grid-cols-2 gap-8 grid-cols-1">
      {projects.map((project) => (
        <div
          key={project.id}
          className="group relative rounded-[20px] overflow-hidden min-h-[340px] flex flex-col justify-end z-1 shadow-none hover:shadow-[0_0_150px_#00C8FF] transition-shadow duration-500 ease-in-out"

          // style={{
          //   minHeight: 340,
          //   boxShadow: `0 0 100px ${project.shadowColor}`,
          // }}
        >
          {/* Glow/color blur externo */}
          <div
            className={`pointer-events-none absolute -inset-3 z-0 rounded-[inherit] blur-xl opacity-60 bg-gradient-to-br will-change-[opacity] ${project.glow}`}
            aria-hidden="true"
          />
          {/* Imagem de fundo ocupando todo o card */}
          <div className="absolute inset-0 w-full h-full z-0">
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover select-none pointer-events-none"
              priority={true}
            />
            {/* Gradiente no topo */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-[#18181c] via-black/70 to-transparent pointer-events-none" />
            {/* Gradiente na base */}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#18181c] via-black/80 to-transparent pointer-events-none" />
          </div>
          {/* Conteúdo do card por cima */}
          <div className="relative z-10 p-7 flex flex-col justify-end h-full min-h-[340px]">
            <h3 className="font-semibold text-[22px] text-white mb-3 drop-shadow-[0_0_4px_#000C]">
              {project.title}
            </h3>
            <p className="text-zinc-200 text-sm mb-8 line-clamp-2">
              {project.description}
            </p>
            <div className="mt-auto">
              <Link
                href={project.url}
                className="text-[#00C8FF] font-semibold text-sm hover:underline flex items-center gap-2 group"
              >
                Ver estudo de caso{" "}
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
