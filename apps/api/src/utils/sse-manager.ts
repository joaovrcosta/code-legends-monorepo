import { FastifyReply } from "fastify";

interface SSEClient {
  userId: string;
  reply: FastifyReply;
  lastHeartbeat: number;
}

class SSEManager {
  private clients = new Map<string, SSEClient>();

  /**
   * Adiciona um cliente SSE
   */
  addClient(userId: string, reply: FastifyReply): void {
    this.clients.set(userId, {
      userId,
      reply,
      lastHeartbeat: Date.now(),
    });
  }

  /**
   * Remove um cliente SSE
   */
  removeClient(userId: string): void {
    this.clients.delete(userId);
  }

  /**
   * Envia evento para um usuário específico
   */
  sendToUser(userId: string, event: string, data: unknown): boolean {
    const client = this.clients.get(userId);
    if (!client) {
      console.log(`[SSE] Cliente não encontrado para userId: ${userId}. Clientes conectados: ${this.clients.size}`);
      return false;
    }

    // Verificar se a conexão ainda está válida
    if (client.reply.raw.destroyed || client.reply.raw.closed) {
      console.log(`[SSE] Conexão inválida para userId: ${userId}`);
      this.removeClient(userId);
      return false;
    }

    try {
      const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      client.reply.raw.write(message);
      client.lastHeartbeat = Date.now();
      console.log(`[SSE] Mensagem enviada para userId: ${userId}, event: ${event}, data:`, data);
      return true;
    } catch (error) {
      // Cliente desconectado
      console.error(`[SSE] Erro ao enviar mensagem para userId: ${userId}:`, error);
      this.removeClient(userId);
      return false;
    }
  }

  /**
   * Envia heartbeat para todos os clientes
   */
  sendHeartbeat(): void {
    const now = Date.now();

    this.clients.forEach((client, userId) => {
      // Verificar se a conexão ainda está válida
      if (client.reply.raw.destroyed || client.reply.raw.closed) {
        this.removeClient(userId);
        return;
      }

      try {
        // Envia heartbeat
        client.reply.raw.write(": heartbeat\n\n");
        client.lastHeartbeat = now;
      } catch (error) {
        // Cliente desconectado, remove
        this.removeClient(userId);
      }
    });
  }

  /**
   * Limpa clientes desconectados
   */
  cleanup(): void {
    const now = Date.now();
    const timeout = 120000; // 2 minutos sem heartbeat

    this.clients.forEach((client, userId) => {
      if (now - client.lastHeartbeat > timeout) {
        this.removeClient(userId);
      }
    });
  }

  /**
   * Retorna número de clientes conectados
   */
  getClientCount(): number {
    return this.clients.size;
  }
}

export const sseManager = new SSEManager();

// Limpa clientes desconectados a cada 30 segundos
setInterval(() => {
  sseManager.cleanup();
}, 30000);

// Envia heartbeat a cada 30 segundos
setInterval(() => {
  sseManager.sendHeartbeat();
}, 30000);
