"use server";

/**
 * Resposta da API ViaCEP (apenas campos que usamos).
 * @see https://viacep.com.br/
 */
export interface ViaCepResponse {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

export interface AddressByCepResult {
  success: true;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface AddressByCepError {
  success: false;
  message: string;
}

/**
 * Busca endereço pelo CEP na API ViaCEP.
 * CEP deve ter 8 dígitos (apenas números).
 */
export async function fetchAddressByCep(
  cep: string
): Promise<AddressByCepResult | AddressByCepError> {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) {
    return { success: false, message: "CEP deve ter 8 dígitos." };
  }

  try {
    const res = await fetch(
      `https://viacep.com.br/ws/${digits}/json/`,
      { next: { revalidate: 0 } }
    );
    if (!res.ok) {
      return { success: false, message: "CEP não encontrado." };
    }
    const data: ViaCepResponse = await res.json();
    if (data.erro) {
      return { success: false, message: "CEP não encontrado." };
    }
    return {
      success: true,
      street: data.logradouro ?? "",
      neighborhood: data.bairro ?? "",
      city: data.localidade ?? "",
      state: data.uf ?? "",
    };
  } catch {
    return { success: false, message: "Erro ao buscar CEP. Tente novamente." };
  }
}
