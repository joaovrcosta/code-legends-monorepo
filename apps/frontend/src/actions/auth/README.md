# Autenticação - Integração com API Externa

Este módulo gerencia a autenticação do sistema através de uma API externa.

## Configuração

Configure a URL da API no arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

## Endpoints da API

### 1. Criar Usuário

**POST** `/users`

```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "12345678",
  "avatar": "https://exemplo.com/avatar.jpg"
}
```

### 2. Autenticar

**POST** `/users/auth`

```json
{
  "email": "joao@example.com",
  "password": "12345678"
}
```

**Resposta:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Obter Usuário Atual (a ser implementado)

**GET** `/users/me`

**Headers:**

```
Authorization: Bearer {token}
```

## Funções Disponíveis

### `registerUser(formData: FormData)`

Registra um novo usuário na API externa.

### `loginUser(formData: FormData)`

Autentica um usuário e cria uma sessão com o token JWT retornado.

### `getCurrentSession()`

Retorna os dados do usuário autenticado a partir do token JWT armazenado nos cookies.
Atualmente decodifica o JWT localmente. Quando a rota `/me` estiver disponível, será atualizada para buscar os dados da API.

### `getUserFromAPI()` (em `src/actions/user/`)

Busca os dados completos do usuário através da rota `/users/me` (quando implementada).
Esta função está pronta para uso assim que a rota estiver disponível na API.

### `getAuthToken()`

Retorna o token JWT armazenado nos cookies.

### `destroySession()`

Remove o token de autenticação e encerra a sessão.

## Estrutura do Token JWT

O token contém as seguintes informações:

- `id`: ID do usuário
- `email`: Email do usuário
- `name`: Nome do usuário
- `role`: Papel do usuário (ex: "INSTRUCTOR")
- `iat`: Timestamp de criação
- `exp`: Timestamp de expiração

## Cookie de Autenticação

O token é armazenado em um cookie HTTP-only chamado `auth_token` com as seguintes configurações:

- HttpOnly: true
- Secure: true (em produção)
- SameSite: lax
- MaxAge: 7 dias
