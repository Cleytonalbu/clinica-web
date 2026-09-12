# Clínica Web — Entre Afetos

Sistema web de gestão clínica desenvolvido com React, TypeScript e Vite.

## Executar localmente

Requisitos: Node.js 20 ou superior e npm.

```bash
npm install
npm run dev
```

## Validação

```bash
npm run lint
npm run build
```

O build de produção do Vite também pode ser validado isoladamente com `npx vite build`.

## Configurações e acesso

- Gestor: acesso integral e permanente às configurações, permissões e logins.
- Administrativo: acesso às configurações operacionais, sem acesso à administração de logins e permissões.
- Recepção e Profissional: acesso conforme a matriz de permissões definida pelo Gestor.
- Os perfis aceitos pelo login são Gestor, Administrativo, Recepção e Profissional.
- A Central de Configurações contém apenas cadastros e regras com finalidade operacional no sistema.
- Evoluções usam tipos padronizados no fluxo clínico; não há criação de modelos globais.
- O lembrete financeiro é configurado em Notificações, sem duplicação no Financeiro.

Consulte `RELATORIO_CORRECOES.md` para entender as correções feitas na Central de Configurações.
