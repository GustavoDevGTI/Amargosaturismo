# Configuracao do calendario online

1. Crie um projeto no Supabase.
2. No SQL Editor, execute o conteudo de `supabase-setup.sql`.
3. Em `Authentication`, crie ou convide a conta administrativa `admincalendarioamargosa@gmail.com`.
4. Desative novos cadastros publicos se quiser que so essa conta consiga entrar.
5. Copie a `Project URL` e a `anon public key`.
6. O arquivo `config.js` deste projeto ja foi preenchido com os dados que voce enviou.
7. Publique estes arquivos no Netlify.

## Observacoes

- Use a chave `anon`, nao a `service_role`.
- As policies atuais ja restringem edicao para o e-mail `admincalendarioamargosa@gmail.com`.
- O arquivo `supabase-setup.sql` tambem cria o bucket publico `calendar-event-images` para upload das imagens dos eventos.
- Para limpeza automatica de imagens antigas, publique a Edge Function `calendar-image-cleanup` (arquivo em `supabase/functions/calendar-image-cleanup/index.ts`).
- Salve no Vault os secrets `project_url` e `anon_key` antes de executar o `supabase-setup.sql`.
- O `supabase-setup.sql` cria/atualiza o job diario `calendar-image-cleanup-daily` no `pg_cron`.
- O horario do job esta em UTC (`03:15 UTC`).
- Para testar manualmente, invoque a funcao publicada: `POST /functions/v1/calendar-image-cleanup` com `Authorization: Bearer <anon_key>`.
- Se o projeto ja estava em uso antes dos campos de imagem, tipo de acesso e visual no calendario, execute novamente o `supabase-setup.sql` no SQL Editor para criar as colunas `image_url`, `access_type` e `display_style`, ajustar a descricao para 200 caracteres e liberar a classificacao `Gratuito/Pago` e `Ponto/Barra`.
- Se este navegador ja tinha eventos no `localStorage`, entre como admin e use o botao `Importar eventos locais`.

## Publicacao no Netlify

1. Crie um novo site no Netlify.
2. Publique a pasta deste projeto inteira.
3. Como o projeto e estatico, o diretorio de publicacao e a raiz do projeto.
4. Depois da publicacao, acesse o site, entre com a conta administrativa e teste criar um evento.
