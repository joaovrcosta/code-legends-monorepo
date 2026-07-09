import { User, MaritalStatus } from "@prisma/client";
import { IUsersRepository } from "../../../repositories/users-repository";
import { UserNotFoundError } from "../../errors/user-not-found";
import { prisma } from "../../../lib/prisma";

interface UpdateUserDataRequest {
  userId: string;
  planId?: string;
  onboardingCompleted?: boolean;
  onboardingGoal?: string | null;
  onboardingCareer?: string | null;
  name?: string;
  bio?: string | null;
  expertise?: string[];
  totalXp?: number;
  level?: number;
  xpToNextLevel?: number;
  birth_date?: string | null;
  born_in?: string | null;
  document?: string | null;
  foreign_phone?: string | null;
  fullname?: string | null;
  gender?: string | null;
  marital_status?: string | null;
  occupation?: string | null;
  phone?: string | null;
  rg?: string | null;
  address?: string | null;
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

    if (data.planId !== undefined) {
      const plan = await prisma.plan.findUnique({ where: { id: data.planId } });
      if (!plan) {
        throw new UserNotFoundError();
      }
      updateData.planId = data.planId;
    }
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
    if (data.birth_date !== undefined) {
      updateData.birth_date = data.birth_date
        ? new Date(`${data.birth_date}T12:00:00.000Z`)
        : null;
    }
    if (data.born_in !== undefined) {
      updateData.born_in = data.born_in;
    }
    if (data.document !== undefined) {
      updateData.document = data.document;
    }
    if (data.foreign_phone !== undefined) {
      updateData.foreign_phone = data.foreign_phone;
    }
    if (data.fullname !== undefined) {
      updateData.fullname = data.fullname;
    }
    if (data.gender !== undefined) {
      updateData.gender = data.gender;
    }
    if (data.marital_status !== undefined) {
      updateData.marital_status = data.marital_status
        ? (data.marital_status as MaritalStatus)
        : MaritalStatus.SINGLE;
    }
    if (data.occupation !== undefined) {
      updateData.occupation = data.occupation;
    }
    if (data.phone !== undefined) {
      updateData.phone = data.phone;
    }
    if (data.rg !== undefined) {
      updateData.rg = data.rg;
    }

    const updatedUser = await this.userRepository.update(data.userId, updateData);

    if (data.address !== undefined) {
      if (data.address) {
        await prisma.address.upsert({
          where: { userId: data.userId },
          create: {
            userId: data.userId,
            foreign_address: data.address,
          },
          update: {
            foreign_address: data.address,
          },
        });
      } else {
        await prisma.address.deleteMany({ where: { userId: data.userId } });
      }
    }

    const userWithAddress = await this.userRepository.findByIdWithAddress(data.userId);
    if (!userWithAddress) {
      throw new UserNotFoundError();
    }

    return {
      user: userWithAddress,
    };
  }
}
