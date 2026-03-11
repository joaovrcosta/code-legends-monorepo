"use server";

export type NotificationType =
  | "NEW_COURSE_AVAILABLE"
  | "CERTIFICATE_GENERATED"
  | "LEVEL_UP"
  | "REQUEST_STATUS_CHANGED"
  | "COURSE_COMPLETED"
  | "NEW_EVENT";

export type TargetPlan = "FREE" | "PRO" | "PREMIUM" | "ALL";

export interface BroadcastPayload {
  title: string;
  message: string;
  type: NotificationType;
  targetPlan: TargetPlan;
}

export async function sendBroadcastNotification(
  token: string,
  payload: BroadcastPayload
): Promise<{ notificationsSent: number }> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/system-settings/broadcast`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro ao enviar broadcast: ${error}`);
  }

  return response.json();
}
