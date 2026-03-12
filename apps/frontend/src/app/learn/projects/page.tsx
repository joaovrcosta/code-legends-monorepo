import { ProjectCard } from "@/components/learn/projects/project-card";
import { Input } from "@/components/ui/input";
import { MagnifyingGlass, RocketLaunch } from "@phosphor-icons/react/dist/ssr";

const PROJECTS_MOCK = [
  {
    id: "1",
    title: "SaaS de IA com Pagamentos",
    category: "FULLSTACK",
    image: "https://xesque.rocketseat.dev/challenges/thumbnails/1758815354477.png",
    level: "AVANCADO",
    description: "Integração completa com OpenAI API, Stripe para assinaturas e banco de dados PostgreSQL.",
    url: "/projetos/saas-ia"
  },
  {
    id: "2",
    title: "App de Delivery (Uber Eats Clone)",
    category: "MOBILE",
    image: "https://xesque.rocketseat.dev/challenges/thumbnails/1759338627958.png",
    level: "INTERMEDIARIO",
    description: "Desenvolvimento mobile com React Native, Google Maps API e acompanhamento em tempo real.",
    url: "/projetos/delivery-app"
  },
  {
    id: "3",
    title: "Dashboard de Investimentos",
    category: "FINANCE",
    image: "https://xesque.rocketseat.dev/challenges/thumbnails/1759178437318.png",
    level: "AVANCADO",
    description: "Visualização de dados complexos com Recharts, WebSocket para cotações e Next.js 15.",
    url: "/projetos/crypto-dashboard"
  },
  {
    id: "4",
    title: "E-commerce Headless",
    category: "FRONTEND",
    image: "https://xesque.rocketseat.dev/challenges/thumbnails/1758212940856.png",
    level: "INICIANTE",
    description: "Criação de uma loja performática focada em Web Vitals utilizando Tailwind CSS e CMS.",
    url: "/projetos/ecommerce"
  },
  {
    id: "5",
    title: "Portifólio Dev",
    category: "FRONTEND",
    image: "https://xesque.rocketseat.dev/challenges/thumbnails/1758130073199.png",
    level: "INTERMEDIARIO",
    description: "Arquitetura de microsserviços, cache com Redis e sistema de mensageria com RabbitMQ.",
    url: "/projetos/social-api"
  },
  {
    id: "6",
    title: "Landing Page de Games",
    category: "UI/UX",
    image: "https://xesque.rocketseat.dev/challenges/thumbnails/1758815354477.png",
    level: "INICIANTE",
    description: "Design imersivo com animações avançadas de scroll e efeitos de glassmorphism.",
    url: "/projetos/games-lp"
  }
];

export default function ProjectsPage() {
  return (
    <div className="py-4 lg:px-12 px-6">
      <div className="flex flex-col items-center justify-center">
        <div className="w-full flex-col px-0 py-6 flex">
          <div className="flex items-center justify-start space-x-2">
            <RocketLaunch className="text-[#00C8FF]" size={28} weight="fill" />
            <span className="font-bold bg-blue-gradient-500 bg-clip-text text-transparent text-lg tracking-wider">
              Projetos
            </span>


          </div>
          <div className="mt-6 relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#414147] group-focus-within:text-[#00C8FF] transition-colors pointer-events-none">
              <MagnifyingGlass size={20} weight="bold" />
            </div>
            <Input
              className="rounded-full h-[52px] lg:max-w-[350px] w-full border-[#25252A] bg-[#0c0c0f] pl-12 pr-4 shadow-lg focus-visible:ring-[#00C8FF]/20 transition-all placeholder:text-[#414147]"
              placeholder="Pesquisar projeto..."
            />
          </div>
          <div>
            <p>Oi</p>
          </div>
        </div>

        <div className="w-full lg:pb-0 pb-12 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {PROJECTS_MOCK.map((project) => (
              <ProjectCard
                key={project.id}
                title={project.title}
                category={project.category}
                image={project.image}
                level={project.level}
                description={project.description}
                url={project.url}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}