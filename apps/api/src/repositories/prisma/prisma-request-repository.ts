import { Request } from "@prisma/client";
import { IRequestRepository } from "../request-repository";
import { prisma } from "../../lib/prisma";

interface CreateRequestData {
  userId: string;
  type: string;
  title?: string | null;
  description?: string | null;
  data?: string | null;
  status?: string;
}

interface UpdateRequestData {
  status?: string;
  title?: string | null;
  description?: string | null;
  data?: string | null;
  response?: string | null;
  respondedBy?: string | null;
  respondedAt?: Date | null;
}

export class PrismaRequestRepository implements IRequestRepository {
  async create(data: CreateRequestData): Promise<Request> {
    const request = await prisma.request.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title ?? null,
        description: data.description ?? null,
        data: data.data ?? null,
        status: data.status ?? "PENDING",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return request;
  }

  async findAll(): Promise<Request[]> {
    const requests = await prisma.request.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return requests;
  }

  async findById(id: string): Promise<Request | null> {
    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return request;
  }

  async findByUserId(userId: string): Promise<Request[]> {
    const requests = await prisma.request.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return requests;
  }

  async findByUserIdAndStatus(userId: string, status: string): Promise<Request[]> {
    const requests = await prisma.request.findMany({
      where: {
        userId,
        status: status as any,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return requests;
  }

  async findByStatus(status: string): Promise<Request[]> {
    const requests = await prisma.request.findMany({
      where: { status: status as any },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return requests;
  }

  async update(id: string, data: UpdateRequestData): Promise<Request> {
    const request = await prisma.request.update({
      where: { id },
      data: {
        status: data.status ? (data.status as any) : undefined,
        title: data.title,
        description: data.description,
        data: data.data,
        response: data.response,
        respondedBy: data.respondedBy,
        respondedAt: data.respondedAt,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return request;
  }

  async delete(id: string): Promise<void> {
    await prisma.request.delete({
      where: { id },
    });
  }
}
