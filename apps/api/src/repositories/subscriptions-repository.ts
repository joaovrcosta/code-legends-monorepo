export interface SubscriptionRow {
  id: string;
  endsAt: Date;
  plan: string;
}

export interface ISubscriptionsRepository {
  findLatestByUserIdOrderedByEndsAt(
    userId: string
  ): Promise<SubscriptionRow | null>;
}
