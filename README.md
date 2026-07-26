# Portal FCC v12

Portal mobile-first para leitura de cartões de horário, cálculo de encerramento e organização de salas de prova.

## Fluxo

**Projeto → Período → OCR → Sala → Cartão**

Ao abrir o site, o usuário primeiro escolhe ou cria um projeto. Depois seleciona um dos dois períodos fixos do sistema: **Manhã** ou **Tarde**. Somente então entra no portal com calculadora e leitura por câmera.

## Leitura do cartão

O OCR procura:

- Sala
- Módulo(s)
- Horário de início
- Duração da prova
- Permanência mínima

O campo **Término** do cartão não é usado. O encerramento é sempre calculado pelo navegador a partir de **início + duração**.

## Organização no Supabase

A V12 usa:

- `fcc_projects`
- `fcc_rooms`
- `fcc_exam_cards`

Os períodos são uma regra fixa (`manha` ou `tarde`) e ficam associados à sala. Não é necessário criar uma tabela de períodos.

Estrutura lógica:

```text
Projeto
├── Manhã
│   ├── Sala 0017
│   └── Sala 0020
└── Tarde
    ├── Sala 0017
    └── Sala 0031
```

## Arquivos principais

- `index.html` — interface
- `styles.css` — identidade visual e responsividade
- `app.js` — OCR, cálculo, portal e Supabase
- `config.js` — chaves/configuração
- `SUPABASE_SETUP_V12_1.sql` — banco de dados
- `logo-fcc-avatar.png` — versão circular preparada para os avatares do portal

Consulte `PASSO_A_PASSO.txt` antes de publicar.
