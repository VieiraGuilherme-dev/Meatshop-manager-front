# MeatShop Manager - Frontend 🧑‍🍳

Interface web do MeatShop Manager, um sistema de gestão financeira para açougues.
Consome a API REST em Spring Boot

(https://github.com/VieiraGuilherme-dev/Meatshop-manager).

**Acesse:** https://meatshop-manager.vercel.app

```
Email: demo@meatshop.com
Senha: demo123
```

Esse acesso tem permissão de consulta em todas as telas. Criar, editar e excluir
são ações exclusivas do perfil administrador.

> O backend roda no plano gratuito do Render e hiberna após 15 minutos sem acesso.
> O primeiro carregamento pode levar até 1 minuto.

---

## O que tem aqui

- **Dashboard** com indicadores do mês, comparação com o mês anterior, gráficos e insights
- **Receitas e despesas** com cadastro, edição, exclusão e paginação
- **Funcionários** com cadastro e fluxo de demissão
- **Categorias** de receita e despesa
- **Relatórios** exportáveis em PDF e Excel
- Login com JWT, rotas protegidas, controle por perfil e tema claro/escuro

---

## Decisões que valem nota

Interceptors do Axios. O de request injeta o token JWT em toda chamada, evitando repetir o header em cada serviço. O de response captura respostas 401, limpa o localStorage e redireciona para o login — o que resolve o caso de token expirado no meio do uso, que antes deixava o usuário preso em telas de erro.

Hook useCrud. As quatro telas de CRUD compartilham a mesma lógica de listar, criar, editar, excluir e paginar. Extrair isso para um hook reduziu as telas ao que é específico de cada uma: colunas da tabela e campos do formulário.

Mensagens vindas do backend. Os blocos catch priorizam error.response?.data?.message e só caem em texto genérico quando a resposta não traz mensagem. Isso faz com que validações de domínio (como tentar demitir um funcionário com data anterior à admissão cheguem ao usuário com a explicação real).

Controle por perfil no front. Botões de criação, edição e exclusão são ocultados para usuários com perfil FUNCIONARIO. É conveniência de interface, não segurança: a autorização é garantida no backend com @PreAuthorize.

---

## Rodando localmente

Requer Node.js 18+ e a [API](https://github.com/VieiraGuilherme-dev/Meatshop-manager) em execução.

```bash
git clone git@github.com:VieiraGuilherme-dev/Meatshop-manager-front.git
cd Meatshop-manager-front
npm install
```

Crie um `.env` na raiz:

```
VITE_API_URL=http://localhost:8081
```

```bash
npm run dev
```

A aplicação abre em `http://localhost:5173`.

---

## Deploy

Hospedado na Vercel, com deploy automático a cada push na `main`.
O `vercel.json` redireciona todas as rotas para o `index.html`, necessário porque
o React Router resolve as rotas no cliente.
