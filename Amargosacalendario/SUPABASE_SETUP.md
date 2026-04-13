# Configuração do calendário online

1. Crie um projeto no Supabase.
2. No SQL Editor, execute o conteúdo de `supabase-setup.sql`.
3. Em `Authentication`, crie ou convide a conta administrativa `admincalendarioamargosa@gmail.com`.
4. Desative novos cadastros públicos se quiser que só essa conta consiga entrar.
5. Copie a `Project URL` e a `anon public key`.
6. O arquivo `config.js` deste projeto já foi preenchido com os dados que você enviou.
7. Publique estes arquivos no Netlify.

## Observações

- Use a chave `anon`, não a `service_role`.
- As policies atuais já restringem edição para o e-mail `admincalendarioamargosa@gmail.com`.
- O arquivo `supabase-setup.sql` também cria o bucket público `calendar-event-images` para upload das imagens dos eventos.
- Se o projeto já estava em uso antes dos campos de imagem, tipo de acesso e visual no calendário, execute novamente o `supabase-setup.sql` no SQL Editor para criar as colunas `image_url`, `access_type` e `display_style`, ajustar a descrição para 200 caracteres e liberar a classificação `Gratuito/Pago` e `Ponto/Barra`.
- Se este navegador já tinha eventos no `localStorage`, entre como admin e use o botão `Importar eventos locais`.

## Publicação no Netlify

1. Crie um novo site no Netlify.
2. Publique a pasta deste projeto inteira.
3. Como o projeto é estático, o diretório de publicação é a raiz do projeto.
4. Depois da publicação, acesse o site, entre com a conta administrativa e teste criar um evento.
