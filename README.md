# Portal FCC v14

Portal estático para GitHub Pages com Supabase + OCR.Space.

## Nova hierarquia

```text
Projeto
└── Diretórios (período escolhido individualmente: Manhã ou Tarde)
    ├── Calculadora / OCR
    ├── Salas
    │   └── Cartões e módulos
    └── Checklist
```

Ao criar um projeto, o formulário abre com **dois diretórios iniciais** e permite adicionar outros com o botão `+ Adicionar`.

Cada diretório possui seu próprio período, suas próprias salas e seu próprio checklist.

## Checklist

A estrutura inicial possui Item 1, Item 2, Item 3, Item 4 e Comentários. Os estados são persistidos no Supabase por diretório.

## OCR

A leitura busca Sala, Módulo(s), Início, Duração e Permanência mínima. O campo Término do cartão não é usado no cálculo.

Consulte `PASSO_A_PASSO.txt` antes da publicação.
