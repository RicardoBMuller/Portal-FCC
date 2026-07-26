# Portal FCC v13 — Diretórios de Salas

Versão do Portal FCC com navegação por diretórios de salas.

## Fluxo

1. Escolher ou criar o Projeto.
2. Selecionar Manhã ou Tarde.
3. Usar a calculadora/OCR para ler os cartões.
4. Os cartões validados são armazenados no Supabase.
5. Em **Diretório de salas**, cada sala aparece como uma pasta fechada.
6. Toque na pasta para entrar na sala; use **Voltar para salas** para retornar à raiz.
7. Dentro da sala também é possível navegar diretamente para a sala anterior ou seguinte.

## Menu principal

O botão ☰ no topo abre o menu com:

- **Início / Projetos** — volta para a seleção/criação do projeto e período.
- **Calculadora** — abre cálculo manual e OCR.
- **Diretório de salas** — abre a raiz das pastas de salas.

## Banco

Esta versão não altera a estrutura do banco da v12.1. Se o Supabase já está funcionando, não é necessário recriar as tabelas.

Para uma instalação nova, execute `SUPABASE_SETUP_V13.sql` no SQL Editor do Supabase.

## Configuração

Preencha `config.js` com:

- `OCRSPACE_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`

Depois publique os arquivos na raiz do GitHub Pages.
