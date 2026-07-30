# Portal FCC V18 — PWA e notificações

Versão derivada do ponto de restauração **V17.3**.

## Recursos adicionados

- instalação como aplicativo no celular e desktop;
- funcionamento em modo standalone;
- cache da interface e tela offline;
- notificações push mesmo com o Portal fechado;
- alertas de projetos, diretórios, salas, cartões de prova e checklist;
- alertas do Kanban, menções, atribuições e prazos;
- notificações de novas mensagens do chat;
- assinatura separada por usuário e dispositivo.

## Instalação

Siga o arquivo `PASSO_A_PASSO_V18_PWA_NOTIFICACOES.txt`.

## Segurança

A VAPID Private Key e a Service Role permanecem exclusivamente no Supabase.
O frontend contém apenas a Publishable Key e a VAPID Public Key.
