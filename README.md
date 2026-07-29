# Portal FCC — V16.2 Experimental

Versão experimental do Portal de Provas, construída sobre a linha visual V16 e mantendo a V15.6 como ponto de restauração estável.

## Correções desta versão

- o criador do projeto é cadastrado automaticamente como **PO do Projeto**;
- corrigido o erro `PROJECT_TEAM_DENIED` ao salvar participantes logo após criar um projeto;
- projetos existentes sem PO são reparados pelo SQL de atualização;
- adicionada a opção **Editar projeto**;
- somente o PO pode editar nome, data, texto do card, órgão e imagem de fundo;
- a troca do PO é processada por último para que os outros cargos sejam salvos antes da transferência de permissão;
- introdução e animação de atualização da V16.1 foram preservadas.

## Atualização de um ambiente existente

Execute no Supabase:

```text
SUPABASE_HOTFIX_V16_2.sql
```

Depois copie suas chaves atuais para `config.js` e publique todos os arquivos no GitHub Pages.

## Instalação nova

Use:

```text
SUPABASE_SETUP_V16_2_COMPLETO.sql
```

Leia `PASSO_A_PASSO_V16_2.txt` antes de publicar.
