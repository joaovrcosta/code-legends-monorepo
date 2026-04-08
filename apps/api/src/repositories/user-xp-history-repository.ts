export type UserXpHistoryRow = {
  xpAmount: number
  createdAt: Date
}

export interface IUserXpHistoryRepository {
  findBetweenDates(
    userId: string,
    from: Date,
    toExclusive: Date,
  ): Promise<UserXpHistoryRow[]>
}

