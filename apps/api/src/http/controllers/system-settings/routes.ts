import { FastifyInstance } from "fastify";
import { getGamificationSettings } from "./get-gamification-settings.controller";
import { updateGamificationSettings } from "./update-gamification-settings.controller";
import { sendBroadcast } from "./send-broadcast.controller";
import { getPaymentSettings } from "./get-payment-settings.controller";
import { bootstrapPaymentSettings } from "./bootstrap-payment-settings.controller";
import { verifyAdmin } from "../../middlewares/verify-admin";

export async function systemSettingsRoutes(app: FastifyInstance) {
  // Gamification Settings
  app.get("/system-settings/gamification", { onRequest: [verifyAdmin] }, getGamificationSettings);
  app.put("/system-settings/gamification", { onRequest: [verifyAdmin] }, updateGamificationSettings);

  // Payment Settings (global)
  app.get("/system-settings/payments", { onRequest: [verifyAdmin] }, getPaymentSettings);
  app.post(
    "/system-settings/payments/bootstrap",
    { onRequest: [verifyAdmin] },
    bootstrapPaymentSettings,
  );

  // Broadcaster
  app.post("/system-settings/broadcast", { onRequest: [verifyAdmin] }, sendBroadcast);
}
