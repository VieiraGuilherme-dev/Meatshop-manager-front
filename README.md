# MeatShop Manager - Frontend

Interface web do MeatShop Manager, um sistema de gestão financeira para açougues.
Construído em React com Vite, consome a [API REST em Spring Boot](https://github.com/VieiraGuilherme-dev/Meatshop-manager).

**Acesse:** https://meatshop-manager.vercel.app

```
Email: demo@meatshop.com
Senha: demo123
```

Esse acesso usa o perfil FUNCIONARIO, com permissão de consulta em todas as telas
e exportação de relatórios. As operações de criação, edição e exclusão são exclusivas
do perfil ADMIN.

> O backend está hospedado no plano gratuito do Render, que hiberna após 15 minutos
> sem acesso. O primeiro carregamento pode levar até 1 minuto enquanto o serviço sobe.

---

## Funcionalidades

**Dashboard**
Cards de receitas, despesas, lucro e equipe, com variação percentual em relação ao
mês anterior e margem de lucro. Gráficos de despesas por mês e por categoria, e um
bloco de insights gerado a partir dos indicadores do período.

**Lançamentos**
CRUD completo de receitas e despesas, com paginação, seleção de categoria e
vínculo opcional com funcionário nas despesas.

**Funcionários**
Cadastro da equipe e fluxo de demissão via endpoint dedicado, com as mensagens
de validação do backend exibidas diretamente no formulário.

**Categorias**
Gestão das categorias de receita e despesa usadas nos lançamentos.

**Relatórios**
Exportação do relatório financeiro em PDF e Excel por período.

**Transversais**
Autenticação com JWT, rotas protegidas, controle de ações por perfil
(ADMIN e FUNCIONARIO), tema claro e escuro, e logout automático quando o token expira.

---

### Decisões que valem nota

**Interceptors do Axios.** O de request injeta o token JWT em toda chamada, evitando
repetir o header em cada serviço. O de response captura respostas 401, limpa o
`localStorage` e redireciona para o login — o que resolve o caso de token expirado
no meio do uso, que antes deixava o usuário preso em telas de erro.

**Hook `useCrud`.** As quatro telas de CRUD compartilham a mesma lógica de listar,
criar, editar, excluir e paginar. Extrair isso para um hook reduziu as telas ao que
é específico de cada uma: colunas da tabela e campos do formulário.

**Mensagens vindas do backend.** Os blocos `catch` priorizam
`error.response?.data?.message` e só caem em texto genérico quando a resposta não
traz mensagem. Isso faz com que validações de domínio (como tentar demitir um
funcionário com data anterior à admissão cheguem ao usuário com a explicação real).

**Controle por perfil no front.** Botões de criação, edição e exclusão são ocultados
para usuários com perfil FUNCIONARIO, que tem acesso apenas de consulta. É
conveniência de interface, não segurança: a autorização real é garantida no backend
com `@PreAuthorize`, que libera os endpoints de leitura para ambos os perfis e
restringe os de escrita ao ADMIN.

---

## Rodando localmente

Requer Node.js 18 ou superior e a [API](https://github.com/VieiraGuilherme-dev/Meatshop-manager) em execução.

```bash
git clone git@github.com:VieiraGuilherme-dev/Meatshop-manager-front.git
cd Meatshop-manager-front
npm install
```

Crie um arquivo `.env` na raiz apontando para a API local:

```
VITE_API_URL=http://localhost:8081
```

```bash
npm run dev
```

A aplicação sobe em `http://localhost:5173`.

### Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL base da API. Em desenvolvimento, `http://localhost:8081` |

O arquivo `.env.production` versionado no repositório aponta para a API publicada
no Render e é usado automaticamente pelo Vite durante o build de produção.

---

## Deploy

Hospedado na Vercel com deploy automático a cada push na branch `main`.

O arquivo `vercel.json` configura o rewrite de todas as rotas para `index.html`,
necessário porque o React Router resolve as rotas no cliente — sem ele, recarregar
a página em qualquer caminho diferente da raiz retornaria 404.

---

## Repositório relacionado

[**Meatshop-manager**](https://github.com/VieiraGuilherme-dev/Meatshop-manager) - API REST em Java com Spring Boot, PostgreSQL, Flyway e documentação Swagger.
