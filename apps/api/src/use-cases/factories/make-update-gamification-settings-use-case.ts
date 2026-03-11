import { PrismaSystemSettingRepository } from "../../repositories/prisma/prisma-system-setting-repository";
import { UpdateGamificationSettingsUseCase } from "../system/gamification/update-settings";

export function makeUpdateGamificationSettingsUseCase() {
  const repository = new PrismaSystemSettingRepository();
  const useCase = new UpdateGamificationSettingsUseCase(repository);

  return useCase;
}
