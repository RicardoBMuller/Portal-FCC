# Portal FCC V17 — Kanban integrado

Versão experimental derivada da **V16.4**, mantida como ponto de restauração.

## Navegação inferior

`Projetos | Calcular | Kanban | Concluídos | Perfil`

O botão central não cria mais projetos. A criação permanece no botão **+ Criar projeto** da tela inicial.

## Kanban por projeto

Cada projeto do Portal FCC possui um quadro independente com as colunas:

- A Fazer
- Em Progresso
- Concluído

O quadro oferece cards, drag and drop, prioridade, prazo, tags, participantes, checklist, comentários, anexos, conclusão, reabertura e Realtime.

## Arquivos principais

- `index.html` — Portal e interface do Kanban
- `styles.css` — identidade visual do Portal V16.4
- `kanban.css` — camada visual isolada do Kanban
- `app.js` — regras existentes do Portal
- `kanban-module.js` — regras do Kanban integrado
- `SUPABASE_HOTFIX_V17_KANBAN.sql` — atualização para quem já usa a V16.4
- `SUPABASE_SETUP_V17_COMPLETO.sql` — instalação completa
- `PASSO_A_PASSO_V17.txt` — instruções de instalação

## Segurança

O frontend utiliza apenas a Publishable Key do Supabase. As permissões são controladas por RLS e pelo login Google.
