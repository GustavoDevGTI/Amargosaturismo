# Amargosaturismo

Site turistico de Amargosa preparado para hospedagem estatica no GitHub.

## Estrutura

- `index.html`: pagina principal
- `styles.css`: estilos do site
- `script.js`: interacoes, acessibilidade, carrossel e integracao da galeria
- `public/images/`: imagens locais usadas no layout
- `supabase/functions/tourism-gallery/`: Edge Function usada para carregar galerias externas
- `supabase/DEPLOY.md`: passos para publicar a funcao no Supabase

## Como executar localmente

Como o projeto e estatico, basta abrir `index.html` no navegador. Se preferir, rode um servidor local simples para testar melhor links e carregamentos.

## Publicacao no GitHub

Este repositorio foi estruturado para subir diretamente ao GitHub no repositorio `GustavoDevGTI/Amargosaturismo`.

## Publicacao no servidor local via Portainer

O projeto agora tambem esta pronto para deploy em container via Portainer usando o proprio repositorio GitHub.

Arquivos adicionados para essa subida:

- `Dockerfile`: empacota o site em `nginx:alpine`
- `nginx.conf`: configura a entrega estatica e um endpoint de healthcheck
- `docker-compose.yml`: sobe o container expondo a porta `80`
- `.dockerignore`: reduz o contexto de build

Passo a passo sugerido no Portainer:

1. Criar um stack apontando para este repositorio
2. Usar o arquivo `docker-compose.yml`
3. Publicar a porta do host desejada para a porta `80` do container
4. Fazer o deploy da stack

Observacoes importantes:

- o site e estatico, mas depende de acesso externo para Google Maps, Google Fonts e servicos do Supabase
- a galeria continua dependendo da Edge Function descrita em `supabase/DEPLOY.md`

## Sincronizacao com o clone Portainer

Este repositorio agora possui um workflow para espelhar automaticamente as alteracoes do site para `GustavoDevGTI/Amargosaturismo-Portainer`, preservando os arquivos especificos de infraestrutura do clone Portainer.

Para ativar a sincronizacao automatica no GitHub Actions, adicione neste repositorio o secret:

- `PORTAINER_SYNC_TOKEN`

Esse token precisa ter permissao de escrita no repositorio `GustavoDevGTI/Amargosaturismo-Portainer`.

## Integracao da galeria

A galeria usa:

- projeto Supabase `yfrsruueklqbpycflgmh`
- Edge Function `tourism-gallery`
- chave publica anon no `script.js`

Para a galeria funcionar em producao, a funcao precisa estar publicada e com o secret `FLICKR_API_KEY` configurado no Supabase. Os detalhes estao em `supabase/DEPLOY.md`.
