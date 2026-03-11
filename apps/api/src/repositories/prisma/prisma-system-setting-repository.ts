import { prisma } from "../../lib/prisma";
import { SystemSettingRepository } from "../system-setting-repository";


export class PrismaSystemSettingRepository implements SystemSettingRepository {
  async findByKey(key: string) {
    const setting = await prisma.systemSetting.findUnique({
      where: { key },
    });

    if (!setting) return null;

    return {
      key: setting.key,
      value: setting.value,
    };
  }

  async setByKey(key: string, value: string) {
    const setting = await prisma.systemSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });

    return {
      key: setting.key,
      value: setting.value,
    };
  }

  async getMultiple(keys: string[]) {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: keys,
        },
      },
    });

    return settings.map((s) => ({
      key: s.key,
      value: s.value,
    }));
  }
}
