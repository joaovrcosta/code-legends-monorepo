import { SystemSettingRepository } from "../../../repositories/system-setting-repository";

interface UpdateGamificationSettingsUseCaseRequest {
  xpPerLesson?: number;
  xpPerProject?: number;
  xpQuizMultiplier?: number;
}

interface UpdateGamificationSettingsUseCaseResponse {
  settings: {
    xpPerLesson: number;
    xpPerProject: number;
    xpQuizMultiplier: number;
  };
}

export class UpdateGamificationSettingsUseCase {
  constructor(private systemSettingRepository: SystemSettingRepository) {}

  async execute({
    xpPerLesson,
    xpPerProject,
    xpQuizMultiplier,
  }: UpdateGamificationSettingsUseCaseRequest): Promise<UpdateGamificationSettingsUseCaseResponse> {
    if (xpPerLesson !== undefined) {
      await this.systemSettingRepository.setByKey("GAMIFICATION_XP_LESSON", String(xpPerLesson));
    }
    if (xpPerProject !== undefined) {
      await this.systemSettingRepository.setByKey("GAMIFICATION_XP_PROJECT", String(xpPerProject));
    }
    if (xpQuizMultiplier !== undefined) {
      await this.systemSettingRepository.setByKey("GAMIFICATION_XP_QUIZ_MULTIPLIER", String(xpQuizMultiplier));
    }

    const keys = ["GAMIFICATION_XP_LESSON", "GAMIFICATION_XP_PROJECT", "GAMIFICATION_XP_QUIZ_MULTIPLIER"];
    const values = await this.systemSettingRepository.getMultiple(keys);

    const map = values.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    return {
      settings: {
        xpPerLesson: Number(map["GAMIFICATION_XP_LESSON"] || "15"),
        xpPerProject: Number(map["GAMIFICATION_XP_PROJECT"] || "50"),
        xpQuizMultiplier: Number(map["GAMIFICATION_XP_QUIZ_MULTIPLIER"] || "1.5"),
      },
    };
  }
}
