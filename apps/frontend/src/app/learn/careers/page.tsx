import { listCareers } from "@/actions/career";
import { CareerTrackCard } from "@/components/learn/catolog/career-track-card";

export const dynamic = "force-dynamic";

export default async function CareersPage() {
  const data = await listCareers();

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center space-x-2">
        <span className="text-muted-foreground text-[14px] font-semibold">
          Carreiras
        </span>
      </div>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.careers.map((c) => (
            <CareerTrackCard
              key={c.id}
              title={c.title}
              href={`/learn/careers/${c.slug}`}
              badge="Para assinantes"
              pills={[`${c.modulesCount} módulos`]}
              iconUrl={c.icon}
              thumbnailUrl={c.thumbnail}
              colorHex={c.colorHex}
              modulesCount={c.modulesCount}
            />
          ))}
      </div>
    </div>
  );
}

