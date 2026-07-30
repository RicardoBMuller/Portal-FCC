# Portal FCC V19

Portal de provas instalável (PWA), derivado do ponto de restauração **V18 com notificações push funcionando**.

## Principais módulos

- login Google pelo Supabase Auth;
- projetos, participantes e BIO profissional;
- diretórios, salas, cartões de prova e checklist;
- OCR.Space e calculadora pública;
- leitura do cartão tradicional por módulo;
- leitura do novo cartaz vertical de horário;
- validação do término informado contra o cálculo oficial;
- Kanban completo por projeto;
- chat direto entre profissionais;
- central interna e notificações push no celular;
- instalação como PWA.

## Novo cartaz vertical

O OCR identifica:

- tempo de prova;
- permanência mínima;
- sala;
- horário de início;
- horário de término.

O término oficial é sempre calculado por `início + tempo de prova`. Caso o valor escrito esteja diferente, a divergência é destacada e preservada para conferência.

## Atualização da V18

Leia `PASSO_A_PASSO_V19.txt` e execute apenas:

`SUPABASE_HOTFIX_V19_NOVO_CARTAZ.sql`

Não é necessário gerar novas chaves VAPID, recriar a Edge Function, o webhook ou o login Google.


## V19.2
A captura OCR é automática e aceita documentos horizontais ou verticais, sem seleção manual de modelo.
