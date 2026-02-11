// Tipo base do usuário retornado pela API
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

// Tipo da resposta da API /me
export interface UserMeResponse {
  user: User;
}

// Tipo para o usuário autenticado (alias para User)
export type AuthenticatedUser = User;

// Tipo para dados de registro
export interface UserRegisterData {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

// Tipo para dados de login
export interface UserLoginData {
  email: string;
  password: string;
}

// Tipo para atualização de perfil
export interface UserUpdateData {
  name?: string;
  avatar?: string;
  email?: string;
}
