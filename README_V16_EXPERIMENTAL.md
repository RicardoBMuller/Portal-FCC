# Portal FCC — V16 Experimental

Esta versão é uma experiência visual criada sobre a base funcional estável da **V15.6**.

## O que foi preservado

- Google Login pelo Supabase Auth;
- BIO profissional;
- projetos e participantes;
- diretórios por período;
- OCR.Space;
- calculadora pública e vinculada aos diretórios;
- salas, cartões e checklist;
- projetos ativos e concluídos;
- banco de dados e regras da V15.6.

## Nova experiência visual

- navegação inferior flutuante;
- cabeçalho compacto em glassmorphism;
- cards claros em estilo ficha/ticket;
- telas internas com composição editorial;
- menus laterais redesenhados;
- modais no formato bottom sheet em celulares;
- movimentos suaves na troca de telas;
- animações de entrada, ripple e elevação de cards;
- layout mobile-first com adaptação para desktop;
- suporte a `prefers-reduced-motion`.

## Banco de dados

Esta versão **não exige SQL novo**. Ela utiliza exatamente as tabelas e funções da V15.6.

## Publicação

1. Copie suas chaves atuais para `config.js`.
2. Substitua os arquivos do GitHub Pages pelos desta pasta.
3. Aguarde a publicação.
4. Abra o portal novamente em uma aba anônima ou limpe o cache.

A V15.6 deve permanecer guardada como ponto de restauração.
