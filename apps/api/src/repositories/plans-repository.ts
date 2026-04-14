export interface ActivePlanRow {
  slug: string;
  name: string;
  imageUrl: string | null;
  colorHex: string | null;
}

export interface IPlansRepository {
  findFirstActiveBySlug(slug: string): Promise<ActivePlanRow | null>;
}
