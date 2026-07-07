import { listCareers } from "@/actions/career";
import { CareerTrackCard } from "@/components/learn/catolog/career-track-card";

export const dynamic = "force-dynamic";

export default async function CareersPage() {
  const data = await listCareers();

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center space-x-2">
        <span className="text-muted text-[14px] font-semibold">
          Carreiras
        </span>
      </div>

      <div className="flex w-full flex-wrap gap-4">
        {data.careers.map((c) => (
          <div
            key={c.id}
            className="min-w-[min(100%,17.5rem)] max-w-full flex-[1_1_calc((100%-2rem)/3)]"
          >
            <CareerTrackCard
              title={c.title}
              href={`/learn/careers/${c.slug}`}
              pills={[`${c.modulesCount} módulos`]}
              iconUrl={c.icon}
              thumbnailUrl={c.thumbnail}
              colorHex={c.colorHex}
              modulesCount={c.modulesCount}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

