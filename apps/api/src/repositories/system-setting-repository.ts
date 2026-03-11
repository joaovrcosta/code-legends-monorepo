export interface SystemSettingRepository {
  findByKey(key: string): Promise<{ key: string; value: string } | null>;
  setByKey(key: string, value: string): Promise<{ key: string; value: string }>;
  getMultiple(keys: string[]): Promise<Array<{ key: string; value: string }>>;
}
