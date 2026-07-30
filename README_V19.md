# Portal FCC V19

Versão derivada da V18 estável, adicionando leitura OCR de um segundo modelo de documento: o **cartaz vertical de horário**.

## Campos reconhecidos

- tempo de prova;
- permanência mínima;
- sala;
- horário de início;
- horário de término.

A validação usa sempre `início + tempo de prova`. O término escrito é comparado ao cálculo e preservado para auditoria quando houver divergência.

## Compatibilidade

A V19 mantém os cartões por módulo, projetos, diretórios, salas, Google Login, Kanban, chat, PWA e notificações push da V18.

Consulte `PASSO_A_PASSO_V19.txt` antes da publicação.
