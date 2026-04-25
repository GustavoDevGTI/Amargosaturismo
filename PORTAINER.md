# Deploy no Portainer

## Arquitetura da stack

Este projeto sobe o stack completo com tres servicos:

- `amargosaturismo`: frontend em Nginx
- `amargosaturismo-api`: API Node.js
- `amargosaturismo-db`: MariaDB/MySQL

## Portas

Apenas uma porta precisa ficar publica:

- host: `SITE_PORT`
- container do site: `80`

As outras portas ficam internas na rede Docker:

- API: `3000`
- banco: `3306`

Se voce quiser manter o padrao antigo do servidor, defina:

- `SITE_PORT=13013`

## Variaveis importantes

Use o `.env.example` como base para as variaveis do stack:

- `SITE_PORT`
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_ROOT_PASSWORD`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `ADMIN_SESSION_COOKIE_NAME`
- `ADMIN_SESSION_TTL_HOURS`
- `ADMIN_COOKIE_SECURE`

## Como subir

1. Abra o Portainer.
2. Va em `Stacks`.
3. Clique em `Add stack`.
4. Escolha a opcao de repositorio Git.
5. Aponte para o repositório `GustavoDevGTI/Amargosaturismo-Portainer`.
6. Use o arquivo `docker-compose.yml`.
7. Defina as variaveis do stack.
8. Faca o deploy.

## Testes depois do deploy

Depois do deploy, valide:

- `http://localhost:SITE_PORT/`
- `http://localhost:SITE_PORT/health`
- `http://localhost:SITE_PORT/api/health`

O endpoint `/health` deve responder `ok`.
O endpoint `/api/health` deve responder JSON com `ok: true` quando a API conseguir falar com o banco.

## Observacoes

- Nao exponha a porta da API nem do banco para fora do servidor, a menos que isso seja realmente necessario.
- O painel admin usa as credenciais configuradas por `ADMIN_USERNAME` e `ADMIN_PASSWORD`.
- Se o site estiver por HTTPS atras de proxy ou tunnel, ajuste `ADMIN_COOKIE_SECURE=true`.
