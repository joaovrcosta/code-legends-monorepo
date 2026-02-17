import { Request } from "@prisma/client";

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

export interface IRequestRepository {
  create(data: CreateRequestData): Promise<Request>;
  findAll(): Promise<Request[]>;
  findById(id: string): Promise<Request | null>;
  findByUserId(userId: string): Promise<Request[]>;
  findByUserIdAndStatus(userId: string, status: string): Promise<Request[]>;
  findByStatus(status: string): Promise<Request[]>;
  update(id: string, data: UpdateRequestData): Promise<Request>;
  delete(id: string): Promise<void>;
}
