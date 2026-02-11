import { Filter } from "lucide-react";
import { Checkbox } from "../ui/checkbox";

const filterOptions = [
  {
    title: "Tipo de conteudo",
    options: ["Trilhas", "Cursos", "Eventos", "Complementar"],
  },
  {
    title: "Nivel de habilidade",
    options: ["Trilhas", "Cursos", "Eventos", "Complementar"],
  },
  {
    title: "Competencia",
    options: ["Frontend", "Design", "Inglês"],
  },
];

export function Filters() {
  return (
    <div className="2xl:block hidden ml-10">
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-[#c4c4cc]">
          Filtre aqui
        </span>
        <Filter size={20} />
      </div>
      {filterOptions.map((section, index) => (
        <section key={index} className="mt-4">
          <label className="text-sm">
            <span className="font-bold bg-blue-gradient-500 bg-clip-text text-transparent">
              {section.title}
            </span>
          </label>
          <div className="space-y-2 mt-2">
            {section.options.map((option, idx) => (
              <div key={idx} className="flex items-center space-x-4 h-[24px]">
                <Checkbox id={`${section.title}-${idx}`} />
                <label
                  htmlFor={`${section.title}-${idx}`}
                  className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#c4c4cc]"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
