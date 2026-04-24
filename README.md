# Amargosaturismo

Portal turistico de Amargosa com frontend estatico, API Node.js e banco MySQL para cadastros de estabelecimentos.

## Estrutura principal

- `index.html`: pagina principal do portal
- `guia-do-turista.html`: guia com mapa, cards e filtros
- `styles.css`: estilos globais do portal
- `script.js`: interacoes, acessibilidade, carrossel e integracao da galeria
- `formulario/`: formulario publico de novos estabelecimentos
- `adminformulario/`: painel de validacao dos cadastros e edicao dos cards oficiais
- `api/`: backend Express + MySQL para formulario/admin
- `api/sql/init.sql`: schema inicial do banco com `tourism_submissions` e `tourism_cards`
- `public/images/`: imagens locais usadas no layout
- `supabase/functions/tourism-gallery/`: Edge Function usada para carregar galerias externas
- `supabase/DEPLOY.md`: passos para publicar a funcao no Supabase

## Fluxo atual de cadastro

1. O visitante envia um novo estabelecimento pelo formulario publico.
2. A API salva o cadastro no MySQL com status `pending`.
3. O painel admin lista, edita, valida ou recusa os cadastros.
4. O guia publico consome os registros `approved` pela API e adiciona os cards aprovados.
5. Os cards fixos do guia tambem sao servidos pela API a partir da tabela `tourism_cards`, com fallback seguro para o HTML.
6. O admin consegue editar os cards oficiais de pontos turisticos, gastronomia e hoteis/pousadas sem alterar o HTML.
7. Os marcadores oficiais do mapa usam a mesma tabela `tourism_cards`, alinhando exibicao do mapa com ativo/inativo dos cards.
8. Os marcadores dinamicos continuam desativados no mapa por enquanto (`SHOW_SUBMITTED_GUIDE_POINTS_ON_MAP = false`).

## Variaveis de ambiente da API

Crie um arquivo `api/.env` com base em `api/.env.example`:

- `API_PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `UPLOAD_DIR`
- `MAX_UPLOAD_MB`

## Como executar com Docker Compose

O `docker-compose.yml` sobe tres servicos:

- `amargosaturismo`: site em Nginx
- `amargosaturismo-api`: API Express
- `amargosaturismo-db`: banco MariaDB/MySQL

Passo a passo:

1. Ajuste as variaveis do compose se quiser trocar porta, banco ou senha.
2. Rode `docker compose up --build`.
3. Acesse o portal em `http://localhost:8080`.
4. A API ficara disponivel por proxy em `/api` e os uploads em `/uploads`.

## Como executar sem Docker

1. Crie o banco MySQL e execute `api/sql/init.sql`.
2. Configure `api/.env`.
3. Na pasta `api`, rode `npm install` e depois `npm start`.
4. Sirva a raiz do projeto com um servidor web simples ou Nginx.

## Publicacao no servidor local via Portainer

O projeto esta preparado para deploy em stack com site, API e banco.

Arquivos principais para essa subida:

- `Dockerfile`: empacota o frontend no `nginx:alpine`
- `api/Dockerfile`: empacota a API Node.js
- `nginx.conf`: entrega o frontend e encaminha `/api` e `/uploads` para a API
- `docker-compose.yml`: sobe frontend, API e banco
- `.dockerignore`: reduz o contexto de build

## Sincronizacao com o clone Portainer

Este repositorio possui um workflow para espelhar automaticamente alteracoes do site para `GustavoDevGTI/Amargosaturismo-Portainer`, preservando os arquivos especificos de infraestrutura do clone Portainer.

Para ativar a sincronizacao automatica no GitHub Actions, adicione neste repositorio o secret:

- `PORTAINER_SYNC_TOKEN`

Esse token precisa ter permissao de escrita no repositorio `GustavoDevGTI/Amargosaturismo-Portainer`.

## Integracao da galeria

A galeria usa:

- projeto Supabase `yfrsruueklqbpycflgmh`
- Edge Function `tourism-gallery`
- chave publica anon no `script.js`

Para a galeria funcionar em producao, a funcao precisa estar publicada e com o secret `FLICKR_API_KEY` configurado no Supabase. Os detalhes estao em `supabase/DEPLOY.md`.
