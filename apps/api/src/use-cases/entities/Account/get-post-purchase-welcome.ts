import { IUsersRepository } from "../../../repositories/users-repository";
import { IPaymentsRepository } from "../../../repositories/payments-repository";
import { IPlansRepository } from "../../../repositories/plans-repository";
import { ISubscriptionsRepository } from "../../../repositories/subscriptions-repository";
import { UserNotFoundError } from "../../errors/user-not-found";

export type PostPurchaseWelcomeKind = "subscription" | "course" | "generic";

export type PostPurchaseWelcomeReason = "no_payment" | "already_acked";

interface GetPostPurchaseWelcomeRequestDTO {
  userId: string;
}

export interface GetPostPurchaseWelcomeResponse {
  /** Alias determinístico; igual a `showPostPurchaseWelcome`. */
  showModal: boolean;
  showPostPurchaseWelcome: boolean;
  reason: PostPurchaseWelcomeReason | null;
  paymentId: string | null;
  kind: PostPurchaseWelcomeKind | null;
  planSlug: string | null;
  planName: string | null;
  planImageUrl: string | null;
  planColorHex: string | null;
  subscriptionId: string | null;
  endsAt: string | null;
  title: string | null;
  subtitle: string | null;
}

function emptyResponse(
  reason: PostPurchaseWelcomeReason
): GetPostPurchaseWelcomeResponse {
  return {
    showModal: false,
    showPostPurchaseWelcome: false,
    reason,
    paymentId: null,
    kind: null,
    planSlug: null,
    planName: null,
    planImageUrl: null,
    planColorHex: null,
    subscriptionId: null,
    endsAt: null,
    title: null,
    subtitle: null,
  };
}

export class GetPostPurchaseWelcomeUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private paymentsRepository: IPaymentsRepository,
    private plansRepository: IPlansRepository,
    private subscriptionsRepository: ISubscriptionsRepository
  ) {}

  async execute({
    userId,
  }: GetPostPurchaseWelcomeRequestDTO): Promise<GetPostPurchaseWelcomeResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    const latestPaid = await this.paymentsRepository.findLatestPaidByUserId(
      userId
    );

    if (!latestPaid) {
      return emptyResponse("no_payment");
    }

    const ackId = user.postPurchaseWelcomeAckPaymentId ?? null;
    if (latestPaid.id === ackId) {
      return emptyResponse("already_acked");
    }

    const metadata = (latestPaid.metadata ?? null) as Record<
      string,
      unknown
    > | null;
    const metaKind =
      metadata && typeof metadata.kind === "string" ? metadata.kind : null;

    let kind: PostPurchaseWelcomeKind = "generic";
    if (metaKind === "course") {
      kind = "course";
    } else if (latestPaid.plan === "PRO" || latestPaid.plan === "PREMIUM") {
      kind = "subscription";
    }

    const planRow = await this.plansRepository.findFirstActiveBySlug(
      latestPaid.plan
    );

    const planSlug = planRow?.slug ?? latestPaid.plan;
    const planName =
      (metadata?.title as string | undefined) ??
      planRow?.name ??
      (kind === "subscription" ? planSlug : null);
    const planImageUrl =
      (metadata?.imageUrl as string | undefined) ?? planRow?.imageUrl ?? null;
    const planColorHex =
      (metadata?.colorHex as string | undefined) ?? planRow?.colorHex ?? null;

    const subscription =
      await this.subscriptionsRepository.findLatestByUserIdOrderedByEndsAt(
        userId
      );

    const title = "Bem-vindo!";
    let subtitle: string;
    if (kind === "course" && typeof metadata?.title === "string") {
      subtitle = `Seu acesso a "${metadata.title}" foi liberado.`;
    } else if (kind === "subscription" && planName) {
      subtitle = `Seu acesso ${planName} foi liberado.`;
    } else {
      subtitle = "Seu pagamento foi confirmado e seu acesso foi liberado.";
    }

    return {
      showModal: true,
      showPostPurchaseWelcome: true,
      reason: null,
      paymentId: latestPaid.id,
      kind,
      planSlug,
      planName: planName ?? null,
      planImageUrl,
      planColorHex,
      subscriptionId: subscription?.id ?? null,
      endsAt: subscription?.endsAt?.toISOString() ?? null,
      title,
      subtitle,
    };
  }
}
