"use server";

import { listCourses } from "@/actions/course";
import { listPayments, type PaymentItem } from "@/actions/payment/list-payments";
import { listRequests, type Request } from "@/actions/requests";
import { listSkills } from "@/actions/skill/list-skills";
import { listUsers } from "@/actions/user";

type ChartDatum = {
  key: string;
  name: string;
  value: number;
  fill: string;
};

export type RevenueRangePreset = "7d" | "30d" | "90d" | "6m" | "12m" | "custom";

export type RevenueRange = {
  preset: RevenueRangePreset;
  from?: string;
  to?: string;
};

export type DashboardSummary = {
  totalUsers: number;
  publishedCourses: number;
  pendingRequests: number;
  paidRevenueAmount: number;
};

export type DashboardRevenuePoint = {
  label: string;
  revenue: number;
};

export type DashboardRevenueMeta = {
  preset: RevenueRangePreset;
  label: string;
  description: string;
  from?: string;
  to?: string;
};

export type DashboardRecentRequest = Pick<
  Request,
  "id" | "type" | "status" | "title" | "createdAt"
> & {
  userName: string;
  userEmail: string;
};

export type DashboardRecentPayment = Pick<
  PaymentItem,
  "id" | "userId" | "userName" | "userEmail" | "status" | "plan" | "currency" | "createdAt"
> & {
  amount: number;
};

export interface DashboardOverview {
  summary: DashboardSummary;
  usersByPlan: ChartDatum[];
  coursesByStatus: ChartDatum[];
  requestsByStatus: ChartDatum[];
  revenueByMonth: DashboardRevenuePoint[];
  revenueMeta: DashboardRevenueMeta;
  topSkills: ChartDatum[];
  recentRequests: DashboardRecentRequest[];
  recentPayments: DashboardRecentPayment[];
}

const PLAN_LABELS: Record<string, string> = {
  FREE: "Free",
  PRO: "Pro",
  PREMIUM: "Premium",
};

const PLAN_COLORS: Record<string, string> = {
  FREE: "hsl(var(--chart-1))",
  PRO: "hsl(var(--chart-2))",
  PREMIUM: "hsl(var(--chart-4))",
};

const COURSE_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Rascunho",
  PUBLISHED: "Publicado",
};

const COURSE_STATUS_COLORS: Record<string, string> = {
  DRAFT: "hsl(var(--chart-5))",
  PUBLISHED: "hsl(var(--chart-3))",
};

const REQUEST_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  APPROVED: "Concluida",
  REJECTED: "Rejeitada",
};

const REQUEST_STATUS_COLORS: Record<string, string> = {
  PENDING: "hsl(var(--chart-5))",
  APPROVED: "hsl(var(--chart-3))",
  REJECTED: "hsl(var(--chart-2))",
};

function buildChartData(
  counts: Record<string, number>,
  order: string[],
  labels: Record<string, string>,
  colors: Record<string, string>
): ChartDatum[] {
  return order.map((key) => ({
    key,
    name: labels[key] ?? key,
    value: counts[key] ?? 0,
    fill: colors[key] ?? "hsl(var(--chart-1))",
  }));
}

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function endOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date: Date, amount: number) {
  const value = new Date(date);
  value.setDate(value.getDate() + amount);
  return value;
}

function addMonths(date: Date, amount: number) {
  const value = new Date(date);
  value.setMonth(value.getMonth() + amount);
  return value;
}

function startOfWeek(date: Date) {
  const value = startOfDay(date);
  const day = value.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + diff);
  return value;
}

function differenceInDays(start: Date, end: Date) {
  return Math.floor((end.getTime() - start.getTime()) / 86_400_000);
}

function getPresetLabel(preset: RevenueRangePreset) {
  switch (preset) {
    case "7d":
      return "7 dias";
    case "30d":
      return "30 dias";
    case "90d":
      return "90 dias";
    case "6m":
      return "6 meses";
    case "12m":
      return "12 meses";
    case "custom":
      return "Período personalizado";
  }
}

function resolveRevenueRange(range?: RevenueRange) {
  const now = new Date();
  const preset = range?.preset ?? "30d";

  if (preset === "custom") {
    const fallbackFrom = startOfMonth(addMonths(now, -5));
    const fallbackTo = endOfDay(now);
    const parsedFrom = range?.from ? startOfDay(new Date(range.from)) : fallbackFrom;
    const parsedTo = range?.to ? endOfDay(new Date(range.to)) : fallbackTo;

    const from = Number.isNaN(parsedFrom.getTime()) ? fallbackFrom : parsedFrom;
    const to = Number.isNaN(parsedTo.getTime()) ? fallbackTo : parsedTo;

    if (from.getTime() > to.getTime()) {
      return {
        preset,
        from: fallbackFrom,
        to: fallbackTo,
        label: getPresetLabel("6m"),
      };
    }

    return {
      preset,
      from,
      to,
      label: getPresetLabel(preset),
    };
  }

  const to = endOfDay(now);
  let from = startOfMonth(addMonths(now, -5));

  switch (preset) {
    case "7d":
      from = startOfDay(addDays(now, -6));
      break;
    case "30d":
      from = startOfDay(addDays(now, -29));
      break;
    case "90d":
      from = startOfDay(addDays(now, -89));
      break;
    case "6m":
      from = startOfMonth(addMonths(now, -5));
      break;
    case "12m":
      from = startOfMonth(addMonths(now, -11));
      break;
  }

  return {
    preset,
    from,
    to,
    label: getPresetLabel(preset),
  };
}

type RevenueBucket = {
  key: string;
  label: string;
  start: Date;
  end: Date;
};

function buildRevenueBuckets(range: RevenueRange): RevenueBucket[] {
  const resolved = resolveRevenueRange(range);
  const formatterDay = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
  const formatterMonth = new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "2-digit",
  });
  const buckets: RevenueBucket[] = [];
  const diffDays = differenceInDays(resolved.from, resolved.to);

  if (resolved.preset === "7d" || resolved.preset === "30d" || diffDays <= 31) {
    let cursor = startOfDay(resolved.from);

    while (cursor.getTime() <= resolved.to.getTime()) {
      const bucketStart = startOfDay(cursor);
      const bucketEnd = endOfDay(cursor);
      buckets.push({
        key: bucketStart.toISOString(),
        label: formatterDay.format(bucketStart),
        start: bucketStart,
        end: bucketEnd,
      });
      cursor = addDays(cursor, 1);
    }

    return buckets;
  }

  if (resolved.preset === "90d" || diffDays <= 120) {
    let cursor = startOfWeek(resolved.from);

    while (cursor.getTime() <= resolved.to.getTime()) {
      const bucketStart = startOfDay(cursor);
      const bucketEnd = endOfDay(addDays(cursor, 6));
      buckets.push({
        key: bucketStart.toISOString(),
        label: formatterDay.format(bucketStart),
        start: bucketStart,
        end: bucketEnd,
      });
      cursor = addDays(cursor, 7);
    }

    return buckets.filter((bucket) => bucket.end.getTime() >= resolved.from.getTime());
  }

  let cursor = startOfMonth(resolved.from);

  while (cursor.getTime() <= resolved.to.getTime()) {
    const bucketStart = startOfMonth(cursor);
    const nextMonth = startOfMonth(addMonths(cursor, 1));
    const bucketEnd = endOfDay(addDays(nextMonth, -1));
    buckets.push({
      key: bucketStart.toISOString(),
      label: formatterMonth.format(bucketStart).replace(".", ""),
      start: bucketStart,
      end: bucketEnd,
    });
    cursor = nextMonth;
  }

  return buckets;
}

function buildRevenueMeta(range: RevenueRange): DashboardRevenueMeta {
  const resolved = resolveRevenueRange(range);
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return {
    preset: resolved.preset,
    label: resolved.label,
    description:
      resolved.preset === "custom"
        ? `Pagamentos com status pago entre ${formatter.format(resolved.from)} e ${formatter.format(resolved.to)}`
        : `Pagamentos com status pago nos últimos ${resolved.label.toLowerCase()}`,
    from: resolved.from.toISOString().slice(0, 10),
    to: resolved.to.toISOString().slice(0, 10),
  };
}

export async function getDashboardOverview(
  token?: string,
  revenueRange: RevenueRange = { preset: "30d" }
): Promise<DashboardOverview> {
  const [usersResponse, coursesResponse, paymentsResponse, requestsResponse, skillsResponse] =
    await Promise.all([
      listUsers(token),
      listCourses({ token }),
      listPayments(token),
      token ? listRequests(token) : Promise.resolve({ requests: [] }),
      listSkills(),
    ]);

  const users = usersResponse.users;
  const courses = coursesResponse.courses;
  const payments = paymentsResponse.payments;
  const requests = requestsResponse.requests;
  const skills = skillsResponse.skills;

  const planCounts = users.reduce<Record<string, number>>((acc, user) => {
    const plan = user.plan ?? "FREE";
    acc[plan] = (acc[plan] ?? 0) + 1;
    return acc;
  }, {});

  const courseStatusCounts = courses.reduce<Record<string, number>>((acc, course) => {
    acc[course.status] = (acc[course.status] ?? 0) + 1;
    return acc;
  }, {});

  const requestStatusCounts = requests.reduce<Record<string, number>>((acc, request) => {
    const bucket = request.status === "IN_PROGRESS" ? "PENDING" : request.status;
    acc[bucket] = (acc[bucket] ?? 0) + 1;
    return acc;
  }, {});

  const resolvedRevenueRange = resolveRevenueRange(revenueRange);
  const revenueBuckets = buildRevenueBuckets(revenueRange);
  const revenueMap = new Map(revenueBuckets.map((bucket) => [bucket.key, 0]));
  let paidRevenueAmount = 0;

  for (const payment of payments) {
    if (payment.status !== "PAID") {
      continue;
    }

    const paymentDate = new Date(payment.paidAt ?? payment.createdAt);
    if (Number.isNaN(paymentDate.getTime())) {
      continue;
    }

    const isInRange =
      paymentDate.getTime() >= resolvedRevenueRange.from.getTime() &&
      paymentDate.getTime() <= resolvedRevenueRange.to.getTime();

    if (!isInRange) {
      continue;
    }

    const amount = payment.amountCents / 100;
    paidRevenueAmount += amount;

    const bucket = revenueBuckets.find(
      (item) =>
        paymentDate.getTime() >= item.start.getTime() &&
        paymentDate.getTime() <= item.end.getTime()
    );

    if (bucket) {
      revenueMap.set(bucket.key, (revenueMap.get(bucket.key) ?? 0) + amount);
    }
  }

  const topSkills = skills
    .map((skill) => ({
      key: skill.slug,
      name: skill.name,
      value: skill.coursesCount ?? 0,
      fill: "hsl(var(--chart-2))",
    }))
    .filter((skill) => skill.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const recentRequests = [...requests]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 5)
    .map((request) => ({
      id: request.id,
      type: request.type,
      status: request.status,
      title: request.title,
      createdAt: request.createdAt,
      userName: request.user?.name ?? "Usuário desconhecido",
      userEmail: request.user?.email ?? "Sem e-mail",
    }));

  const recentPayments = [...payments]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 5)
    .map((payment) => ({
      id: payment.id,
      userId: payment.userId,
      userName: payment.userName,
      userEmail: payment.userEmail,
      status: payment.status,
      plan: payment.plan,
      currency: payment.currency,
      createdAt: payment.createdAt,
      amount: payment.amountCents / 100,
    }));

  return {
    summary: {
      totalUsers: users.length,
      publishedCourses: courses.filter((course) => course.status === "PUBLISHED").length,
      pendingRequests: requests.filter(
        (request) => request.status === "PENDING" || request.status === "IN_PROGRESS"
      ).length,
      paidRevenueAmount,
    },
    usersByPlan: buildChartData(
      planCounts,
      ["FREE", "PRO", "PREMIUM"],
      PLAN_LABELS,
      PLAN_COLORS
    ),
    coursesByStatus: buildChartData(
      courseStatusCounts,
      ["PUBLISHED", "DRAFT"],
      COURSE_STATUS_LABELS,
      COURSE_STATUS_COLORS
    ),
    requestsByStatus: buildChartData(
      requestStatusCounts,
      ["PENDING", "APPROVED", "REJECTED"],
      REQUEST_STATUS_LABELS,
      REQUEST_STATUS_COLORS
    ),
    revenueByMonth: revenueBuckets.map((bucket) => ({
      label: bucket.label,
      revenue: revenueMap.get(bucket.key) ?? 0,
    })),
    revenueMeta: buildRevenueMeta(revenueRange),
    topSkills,
    recentRequests,
    recentPayments,
  };
}
