import { PrismaSystemSettingRepository } from "../../repositories/prisma/prisma-system-setting-repository";
import { GetGamificationSettingsUseCase } from "../system/gamification/get-settings";

export function makeGetGamificationSettingsUseCase() {
  const repository = new PrismaSystemSettingRepository();
  const useCase = new GetGamificationSettingsUseCase(repository);

  return useCase;
}
