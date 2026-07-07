import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";

const bodySchema = z.object({
  email: z.string().email().optional().or(z.literal("")),
  fullname: z.string().optional(),
  document: z.string().optional(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  livingAbroad: z.boolean().optional(),
  address: z
    .object({
      cep: z.string().optional(),
      street: z.string().optional(),
      number: z.string().optional(),
      complement: z.string().optional(),
      noNumber: z.boolean().optional(),
      neighborhood: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
    })
    .optional(),
});

export async function updateCheckoutDados(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = (request.user as { id: string }).id;
  const parsed = bodySchema.safeParse(request.body);

  if (!parsed.success) {
    return reply.status(400).send({ message: "Dados inválidos", issues: parsed.error.format() });
  }

  const {
    fullname,
    document,
    birthDate,
    phone,
    livingAbroad,
    address: addressData,
  } = parsed.data;

  await prisma.$transaction(async (tx) => {
    const current = await tx.user.findUnique({
      where: { id: userId },
      select: { fullname: true, document: true, birth_date: true },
    });

    const userUpdate: {
      email?: string;
      fullname?: string;
      document?: string;
      birth_date?: Date;
      phone?: string;
    } = {};

    if (phone !== undefined) userUpdate.phone = phone;

    if (fullname !== undefined && fullname !== "" && !current?.fullname) {
      userUpdate.fullname = fullname;
    }
    if (document !== undefined && document !== "" && !current?.document) {
      userUpdate.document = document;
    }
    if (birthDate !== undefined && birthDate !== "" && !current?.birth_date) {
      userUpdate.birth_date = new Date(`${birthDate}T12:00:00.000Z`);
    }

    if (Object.keys(userUpdate).length > 0) {
      await tx.user.update({
        where: { id: userId },
        data: userUpdate,
      });
    }

    if (addressData) {
      const number =
        addressData.noNumber === true ? "" : (addressData.number ?? undefined);
      await tx.address.upsert({
        where: { userId },
        create: {
          userId,
          foreign_country: livingAbroad ?? false,
          postal_code: addressData.cep ?? null,
          street_name: addressData.street ?? null,
          number: number ?? null,
          complement: addressData.complement ?? null,
          neighborhood: addressData.neighborhood ?? null,
          city: addressData.city ?? null,
          state: addressData.state ?? null,
        },
        update: {
          ...(livingAbroad !== undefined && { foreign_country: livingAbroad }),
          ...(addressData.cep !== undefined && { postal_code: addressData.cep || null }),
          ...(addressData.street !== undefined && { street_name: addressData.street || null }),
          ...((addressData.number !== undefined || addressData.noNumber !== undefined) && {
            number: addressData.noNumber ? "" : (addressData.number ?? null),
          }),
          ...(addressData.complement !== undefined && {
            complement: addressData.complement || null,
          }),
          ...(addressData.neighborhood !== undefined && {
            neighborhood: addressData.neighborhood || null,
          }),
          ...(addressData.city !== undefined && { city: addressData.city || null }),
          ...(addressData.state !== undefined && { state: addressData.state || null }),
        },
      });
    } else if (livingAbroad !== undefined) {
      await tx.address.upsert({
        where: { userId },
        create: { userId, foreign_country: livingAbroad },
        update: { foreign_country: livingAbroad },
      });
    }
  });

  return reply.status(200).send({ message: "Dados salvos" });
}
