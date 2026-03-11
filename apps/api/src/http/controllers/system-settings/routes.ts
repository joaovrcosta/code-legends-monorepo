import { FastifyInstance } from "fastify";
import { getGamificationSettings } from "./get-gamification-settings.controller";
import { updateGamificationSettings } from "./update-gamification-settings.controller";
import { sendBroadcast } from "./send-broadcast.controller";
import { verifyAdmin } from "../../middlewares/verify-admin";

export async function systemSettingsRoutes(app: FastifyInstance) {
  // Gamification Settings
  app.get("/system-settings/gamification", { onRequest: [verifyAdmin] }, getGamificationSettings);
  app.put("/system-settings/gamification", { onRequest: [verifyAdmin] }, updateGamificationSettings);

  // Broadcaster
  app.post("/system-settings/broadcast", { onRequest: [verifyAdmin] }, sendBroadcast);
}
