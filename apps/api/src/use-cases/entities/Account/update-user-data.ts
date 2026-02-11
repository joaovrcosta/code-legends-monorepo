import { User } from "@prisma/client";
import { IUsersRepository } from "../../../repositories/users-repository";
import { UserNotFoundError } from "../../errors/user-not-found";

interface UpdateUserDataRequest {
  userId: string;
  onboardingCompleted?: boolean;
  onboardingGoal?: string | null;
  onboardingCareer?: string | null;
  name?: string;
  bio?: string | null;
  expertise?: string[];
  totalXp?: number;
  level?: number;
  xpToNextLevel?: number;
}

interface UpdateUserDataResponse {
  user: User;
}

export class UpdateUserDataUseCase {
  constructor(private userRepository: IUsersRepository) {}

  async execute(data: UpdateUserDataRequest): Promise<UpdateUserDataResponse> {
    const user = await this.userRepository.findById(data.userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    const updateData: Partial<User> = {};

    if (data.onboardingCompleted !== undefined) {
      updateData.onboardingCompleted = data.onboardingCompleted;
    }
    if (data.onboardingGoal !== undefined) {
      updateData.onboardingGoal = data.onboardingGoal;
    }
    if (data.onboardingCareer !== undefined) {
      updateData.onboardingCareer = data.onboardingCareer;
    }
    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.bio !== undefined) {
      updateData.bio = data.bio;
    }
    if (data.expertise !== undefined) {
      updateData.expertise = data.expertise;
    }
    if (data.totalXp !== undefined) {
      updateData.totalXp = data.totalXp;
    }
    if (data.level !== undefined) {
      updateData.level = data.level;
    }
    if (data.xpToNextLevel !== undefined) {
      updateData.xpToNextLevel = data.xpToNextLevel;
    }

    const updatedUser = await this.userRepository.update(data.userId, updateData);

    return {
      user: updatedUser,
    };
  }
}
