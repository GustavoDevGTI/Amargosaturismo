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

## Integracao da galeria

A galeria usa:

- projeto Supabase `yfrsruueklqbpycflgmh`
- Edge Function `tourism-gallery`
- chave publica anon no `script.js`

Para a galeria funcionar em producao, a funcao precisa estar publicada e com o secret `FLICKR_API_KEY` configurado no Supabase. Os detalhes estao em `supabase/DEPLOY.md`.
