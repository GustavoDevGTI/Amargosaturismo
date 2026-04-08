# Publicacao da galeria no Supabase

## 1. Criar o secret do Flickr

No painel do Supabase:

1. Abra o projeto `yfrsruueklqbpycflgmh`
2. Entre em `Edge Functions`
3. Abra `Secrets`
4. Crie um secret chamado `FLICKR_API_KEY`
5. Cole a chave da API do Flickr

## 2. Criar a Edge Function

Crie uma funcao chamada `tourism-gallery` e use o arquivo:

- `supabase/functions/tourism-gallery/index.ts`

Se voce preferir usar a CLI no futuro, a estrutura ja esta pronta.

## 3. Publicar

Depois de salvar a funcao, publique e confirme que a URL fica neste formato:

- `https://yfrsruueklqbpycflgmh.supabase.co/functions/v1/tourism-gallery`

## 4. Testar

Depois da publicacao:

1. Abra o site
2. Clique em `Carnaval Cultural`
3. O modal deve carregar as fotos do Flickr em blocos de 24
4. Clique em uma foto para ver a imagem maior e o titulo

## 5. Se algo falhar

Confira estes pontos:

- o secret `FLICKR_API_KEY` foi salvo corretamente
- a funcao publicada tem o nome `tourism-gallery`
- os albuns do Flickr continuam publicos
- a URL do projeto no `script.js` continua sendo `https://yfrsruueklqbpycflgmh.supabase.co`

## 6. Como adicionar um novo ano

Agora as galerias ja podem ser organizadas por ano dentro de:

- `galleries["carnaval-cultural"].collections`
- `galleries["festival-de-forro"].collections`
- `galleries["sao-joao"].collections`

Para incluir um novo ano:

1. Crie um novo bloco dentro de `collections`
2. Defina `key`, `yearLabel`, `title` e `subtitle`
3. Adicione os links do Flickr convertidos em `id` dentro de `albums`
4. Publique novamente a funcao `tourism-gallery`

Exemplo de ideia:

- `2024` com seus albuns
- `2026` com seus albuns
- `2027` quando voce quiser publicar o proximo Carnaval
