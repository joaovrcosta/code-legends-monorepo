"use server";

import { buildApiHeaders } from "@/actions/auth";
import type { User } from "./list-users";

export interface InstructorsListResponse {
    instructors: User[];
}

/**
 * Lista todos os instrutores (usuários com role INSTRUCTOR ou ADMIN)
 */
export async function listInstructors(token?: string): Promise<InstructorsListResponse> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/instructors`, {
            method: "GET",
            headers: await buildApiHeaders(undefined, token),
            cache: "no-store",
        });

        if (!response.ok) {
            console.error("Erro na resposta da API:", response.statusText);
            return { instructors: [] };
        }

        const data = await response.json();
        // Suporta tanto { instructors: User[] } quanto { users: User[] }
        if (data.instructors) {
            return { instructors: data.instructors };
        } else if (data.users) {
            return { instructors: data.users };
        }
        return { instructors: [] };
    } catch (error) {
        console.error("Erro ao listar instrutores:", error);
        return { instructors: [] };
    }
}
