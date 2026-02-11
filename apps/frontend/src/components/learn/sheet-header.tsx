import { Menu } from "lucide-react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";

const tabs = [
  { id: "learn", label: "Aprender", path: "/learn" },
  { id: "courses", label: "Cursos", path: "/learn/catalog" },
  { id: "hq", label: "Quartel General", path: "/learn/hq" },
  { id: "stats", label: "Estatísticas", path: "/stats" },
  { id: "use-cases", label: "Casos de uso", path: "/use-cases" },
  { id: "insights", label: "Insights", path: "/insights" },
];

export function SheetHeader() {
  return (
    <div className="block lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="w-10 h-10 border bg-transparent border-[#25252a]"
          >
            <Menu size={24} />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <div className="flex flex-col space-y-4 mt-4">
            {tabs.map((tab) => (
              <Button key={tab.id} className="w-full text-left">
                {tab.label}
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
