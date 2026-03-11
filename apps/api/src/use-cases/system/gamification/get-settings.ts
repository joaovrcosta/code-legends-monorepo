import { SystemSettingRepository } from "../../../repositories/system-setting-repository";

interface GetGamificationSettingsUseCaseRequest {}

interface GetGamificationSettingsUseCaseResponse {
  settings: {
    xpPerLesson: number;
    xpPerProject: number;
    xpQuizMultiplier: number;
  };
}

export class GetGamificationSettingsUseCase {
  constructor(private systemSettingRepository: SystemSettingRepository) {}

  async execute(): Promise<GetGamificationSettingsUseCaseResponse> {
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
