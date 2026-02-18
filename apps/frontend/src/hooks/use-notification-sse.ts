import { useEffect, useState, useRef } from "react";
import { getAuthToken } from "@/actions/auth/session";

interface NotificationSSEData {
    count: number;
    type: string;
}

export function useNotificationSSE() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const mountedRef = useRef(true);
    const bufferRef = useRef("");

    useEffect(() => {
        mountedRef.current = true;

        const connectSSE = async () => {
            // Limpar conexão anterior se existir
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
            }

            // Limpar timeout de reconexão
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }

            const token = await getAuthToken();
            if (!token || !mountedRef.current) {
                return;
            }

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
                const fullUrl = `${apiUrl}/notifications/sse`;
                const abortController = new AbortController();
                abortControllerRef.current = abortController;

                const response = await fetch(fullUrl, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "text/event-stream",
                    },
                    credentials: "include",
                    signal: abortController.signal,
                });

                if (!response.ok) {
                    const errorText = await response.text().catch(() => "Unknown error");
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                }

                // Verificar se o content-type está correto
                const contentType = response.headers.get("content-type");
                if (contentType && !contentType.includes("text/event-stream")) {
                    console.warn(`Unexpected content-type: ${contentType}`);
                }

                const reader = response.body?.getReader();
                const decoder = new TextDecoder();

                if (!reader) {
                    throw new Error("Response body is not readable");
                }

                if (mountedRef.current) {
                    setIsConnected(true);
                    console.log("[SSE] Conectado ao servidor SSE");
                }

                const readStream = async () => {
                    try {
                        while (mountedRef.current && !abortController.signal.aborted) {
                            const { done, value } = await reader.read();

                            if (done) {
                                if (mountedRef.current) {
                                    setIsConnected(false);
                                    // Reconectar após 3 segundos
                                    reconnectTimeoutRef.current = setTimeout(connectSSE, 3000);
                                }
                                break;
                            }

                            // Decodificar chunk e adicionar ao buffer
                            bufferRef.current += decoder.decode(value, { stream: true });

                            // Processar mensagens SSE completas (separadas por linha vazia)
                            const messages = bufferRef.current.split("\n\n");
                            // Manter última mensagem incompleta no buffer
                            bufferRef.current = messages.pop() || "";

                            for (const message of messages) {
                                if (message.trim() === "") continue;

                                let eventType = "message";
                                let dataLine = "";

                                // Processar linhas da mensagem
                                const lines = message.split("\n");
                                for (const line of lines) {
                                    if (line.startsWith("event: ")) {
                                        eventType = line.slice(7).trim();
                                    } else if (line.startsWith("data: ")) {
                                        dataLine = line.slice(6).trim();
                                    } else if (line.startsWith(": heartbeat")) {
                                        // Heartbeat recebido, conexão está viva
                                        continue;
                                    }
                                }

                                // Processar dados se encontrados
                                if (dataLine) {
                                    try {
                                        const data = JSON.parse(dataLine) as NotificationSSEData;
                                        console.log("[SSE] Mensagem recebida:", { eventType, data });
                                        if (mountedRef.current && data.count !== undefined) {
                                            console.log(`[SSE] Atualizando contador para: ${data.count}`);
                                            setUnreadCount(data.count);
                                        }
                                    } catch (parseError) {
                                        // Ignorar erros de parse
                                        console.warn("[SSE] Erro ao parsear mensagem SSE:", parseError, "dataLine:", dataLine);
                                    }
                                } else {
                                    console.log("[SSE] Mensagem sem dataLine:", message);
                                }
                            }
                        }
                    } catch (error) {
                        if (error instanceof Error && error.name === "AbortError") {
                            // Abortado intencionalmente, não reconectar
                            return;
                        }

                        if (mountedRef.current) {
                            setIsConnected(false);
                            // Reconectar após 3 segundos
                            reconnectTimeoutRef.current = setTimeout(connectSSE, 3000);
                        }
                    }
                };

                readStream();
            } catch (error) {
                if (error instanceof Error && error.name === "AbortError") {
                    // Abortado intencionalmente, não reconectar
                    console.log("[SSE] Conexão abortada intencionalmente");
                    return;
                }

                console.error("[SSE] Erro na conexão:", error);
                if (mountedRef.current) {
                    setIsConnected(false);
                    // Tentar reconectar após 3 segundos
                    reconnectTimeoutRef.current = setTimeout(connectSSE, 3000);
                }
            }
        };

        connectSSE();

        return () => {
            mountedRef.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
        };
    }, []);

    return { unreadCount, isConnected };
}
