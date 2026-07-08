export interface SubscriptionRow {
  id: string;
  endsAt: Date;
  planSlug: string;
}

export interface ISubscriptionsRepository {
  findLatestByUserIdOrderedByEndsAt(
    userId: string
  ): Promise<SubscriptionRow | null>;
}
