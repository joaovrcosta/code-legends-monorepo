import { FastifyRequest, FastifyReply } from "fastify";
import { makeGetUnreadCountUseCase } from "../../../utils/factories/make-get-unread-count-use-case";
import { env } from "../../../env/index";
import { sseManager } from "../../../utils/sse-manager";

export async function notificationSSE(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const userId = request.user.id;

    const origin = request.headers.origin;
    const devOrigins = [
        "http://localhost:3000",
        "http://localhost:3001",
    ];

    const prodOrigins = [
        "https://www.codelegends.com.br",
        "https://codelegends.com.br",
    ];

    const allowedOrigins = env.NODE_ENV === "production"
        ? prodOrigins
        : [...devOrigins, ...prodOrigins];

    const corsOrigin = origin && allowedOrigins.includes(origin)
        ? origin
        : (env.NODE_ENV === "production" ? prodOrigins[0] : devOrigins[0]);

    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache, no-transform");
    reply.raw.setHeader("Connection", "keep-alive");
    reply.raw.setHeader("X-Accel-Buffering", "no");
    reply.raw.setHeader("Access-Control-Allow-Origin", corsOrigin);
    reply.raw.setHeader("Access-Control-Allow-Credentials", "true");
    reply.raw.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, Accept");

    reply.hijack();
    try {
        const getUnreadCountUseCase = makeGetUnreadCountUseCase();
        const { count } = await getUnreadCountUseCase.execute({ userId });

        const initialMessage = `data: ${JSON.stringify({ count, type: "initial" })}\n\n`;
        reply.raw.write(initialMessage);
    } catch (error) {
        console.error(`[SSE] Erro ao buscar contagem inicial para usuário ${userId}:`, error);
        reply.raw.write(`data: ${JSON.stringify({ count: 0, type: "initial" })}\n\n`);
    }

    sseManager.addClient(userId, reply);
    console.log(`[SSE] Cliente conectado: userId=${userId}, total de clientes: ${sseManager.getClientCount()}`);

    const cleanup = () => {
        console.log(`[SSE] Cliente desconectado: userId=${userId}`);
        sseManager.removeClient(userId);
        if (!reply.raw.destroyed && !reply.raw.closed) {
            try {
                reply.raw.end();
            } catch (error) {
            }
        }
    };

    request.raw.on("close", cleanup);
    request.raw.on("aborted", cleanup);
    request.raw.on("error", (error) => {
        console.error(`[SSE] Erro na conexão SSE para usuário ${userId}:`, error);
        cleanup();
    });
}
