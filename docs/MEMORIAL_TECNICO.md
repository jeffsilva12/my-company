# Memorial Técnico

**Projeto:** My Company — Sistema de Solicitações Internas  
**Tipo:** Aplicação web corporativa (CRUD + dashboard + RBAC + branding)  
**Data de referência:** Outubro/2026  

---

## 1. Objetivo

Disponibilizar um sistema interno para que colaboradores registrem e acompanhem solicitações por área (TI, RH, Compras, Financeiro e Infraestrutura), com controle de status, filtros, indicadores gerenciais, **perfis de acesso** e **identidade visual** configurável.

O memorial descreve requisitos, arquitetura, decisões técnicas, estrutura do código, segurança, testes e operação.

---

## 2. Escopo funcional

### 2.1 Autenticação

| Item | Descrição |
|------|-----------|
| Login | E-mail e senha |
| Sessão | Persistida no servidor (guard `web`) |
| Logout | Invalidação de sessão |
| Restrição | Usuário autenticado, e-mail verificado **e** com a permissão exigida pela rota |

Implementação: **Laravel Fortify** (login, registro, reset, verificação, 2FA/passkeys conforme features habilitadas no starter kit).

### 2.2 Cadastro de solicitações

**Campos informados pelo usuário**

- Título  
- Descrição  
- Categoria (`TI`, `RH`, `Compras`, `Financeiro`, `Infraestrutura`)

**Campos automáticos**

- Data de criação (`created_at`)  
- Usuário solicitante (`user_id`)  
- Status inicial = **Aberto**  
- Código sequencial `SOL-00001`, `SOL-00002`, …

**Ações**

- Criar solicitação (permissão `solicitations.create`)  
- Editar solicitação **aberta** (dono + `solicitations.update`)  
- Excluir solicitação **aberta** (dono + `solicitations.delete`)

### 2.3 Gerenciamento

Listagem com: código, título, categoria, solicitante, data de abertura, status.

Status possíveis:

1. Aberto (`open`)  
2. Em Atendimento (`in_progress`)  
3. Concluído (`completed`)

Ações: consultar detalhes (`solicitations.view`) e alterar status (`solicitations.update_status`).

### 2.4 Consulta e filtros

- Período (`from` / `to` sobre `created_at`)  
- Categoria  
- Status  
- Texto livre no título (`search`)

### 2.5 Dashboard

Indicadores (permissão `dashboard.view`):

- Quantidade total  
- Abertas  
- Em atendimento  
- Concluídas  

### 2.6 Usuários e perfis (RBAC)

| Recurso de UI | URI | Permissão |
|---------------|-----|-----------|
| Usuários | `/admin/users` | `users.manage` |
| Perfis | `/admin/roles` | `roles.manage` |

- **Perfis** (model `Role`): nome, slug, descrição e conjunto de **recursos** (`Permission`)  
- **Usuários**: criação/edição com vínculo a um ou mais perfis (`role_user`)  
- Recursos agrupados na UI (Dashboard, Solicitações, Configurações, Administração)  
- O perfil `admin` não pode ser excluído  

Perfis seedados:

| Slug | Nome | Escopo típico |
|------|------|---------------|
| `admin` | Administrador | Todos os recursos |
| `atendente` | Atendente | Dashboard, ver solicitações, alterar status |
| `solicitante` | Solicitante | Dashboard, ver/criar/editar/excluir próprias abertas |

### 2.7 Identidade visual (branding)

Em **Configurações → Identidade** (`branding.manage`):

- Título da aplicação  
- Ícone, favicon e imagem (upload em `storage`, disco `public`)  

Compartilhado via Inertia (`HandleInertiaRequests`) e refletido no logo/favicon.

### 2.8 Interface do painel

Tema visual com identidade **teal/ciano**, sidebar escura, gradientes suaves nas páginas e cards coloridos por status. Tokens CSS em `resources/css/app.css`.

---

## 3. Arquitetura da solução

### 3.1 Visão geral

Arquitetura **monolítica modular** com front React e back Laravel no mesmo deploy, usando:

1. **Inertia.js** — navegação entre páginas, layouts e autenticação por sessão  
2. **API JSON `/api/v1`** — contrato de dados e mutações do domínio de solicitações  
3. **RBAC próprio** — middleware `permission`, Gate::before e props `auth.permissions` / `auth.roles`

```
┌─────────────────────────────────────────────┐
│                 Browser                      │
│  React (TSX) + Tailwind + componentes UI     │
└───────────────┬───────────────┬─────────────┘
                │ Inertia       │ fetch JSON
                │ (páginas)     │ (/api/v1)
┌───────────────▼───────────────▼─────────────┐
│                 Laravel                      │
│  Fortify · permission middleware · Policies  │
│  Controllers web/admin · Controllers API     │
│  Eloquent · Enums · Resources · AppSetting   │
└───────────────────────┬─────────────────────┘
                        │
                   ┌────▼────┐
                   │   DB    │
                   └─────────┘
```

### 3.2 Justificativa do modelo híbrido

| Abordagem | Uso neste projeto |
|-----------|-------------------|
| Inertia puro (props server-side) | Shell de páginas, auth, admin de usuários/perfis, branding |
| API JSON consumida pelo React | Domínio de solicitações (listagem, CRUD, status, stats) |
| RBAC custom (sem Spatie) | Controle fino de menu, rotas e API sem dependência extra |

**Motivos**

- Separação clara entre apresentação e contrato de dados  
- Facilidade de testar endpoints de forma isolada  
- Possibilidade futura de outros clientes sobre a mesma API  
- Manutenção do fluxo Fortify + sessão do starter kit  
- RBAC enxuto alinhado aos recursos reais do produto  

### 3.3 Fluxo de uma operação típica

**Exemplo: criar solicitação**

1. Usuário autenticado com `solicitations.create` acessa `/solicitations/create`  
2. React carrega categorias via `GET /api/v1/solicitations/meta`  
3. Submit envia `POST /api/v1/solicitations` com JSON + CSRF  
4. Middleware de permissão + Form Request validam; Model persiste; Resource devolve JSON `201`  
5. Front exibe toast e navega para `/solicitations/{id}` via Inertia  
6. Página de detalhe busca `GET /api/v1/solicitations/{id}`

**Exemplo: vincular perfil a usuário**

1. Admin com `users.manage` acessa `/admin/users/{id}/edit`  
2. Inertia envia lista de perfis e `role_ids` atuais  
3. Submit sincroniza `role_user`  
4. Nas próximas requisições, `permissionSlugs()` e o menu refletem os novos recursos  

---

## 4. Stack tecnológica

### 4.1 Backend

| Tecnologia | Função |
|------------|--------|
| PHP 8.4 | Runtime |
| Laravel 13 | Framework HTTP, ORM, filas, config |
| Fortify | Autenticação headless |
| Eloquent | Persistência e relacionamentos |
| Enums PHP | Status e categorias tipados |
| API Resources | Serialização JSON estável |
| Policies | Autorização por ação de domínio |
| Middleware `permission` | Gate de recursos por rota |
| Form Requests | Validação + authorize |
| Pest | Testes automatizados |
| Pint | Formatação de código |
| Larastan | Análise estática |

### 4.2 Frontend

| Tecnologia | Função |
|------------|--------|
| React 19 | UI |
| TypeScript / TSX | Tipagem estática |
| Inertia React v3 | Bridge página ↔ Laravel |
| Tailwind CSS v4 | Estilização (tokens em `@theme` / CSS vars) |
| Radix / shadcn-style | Componentes acessíveis |
| Lucide | Ícones |
| Vite 8 | Bundler |
| Wayfinder | Helpers tipados de rotas web/admin |
| Sonner | Toasts |
| `use-can` | Checagem de permissão no menu/UI |

### 4.3 Infraestrutura de desenvolvimento

- Laravel Herd (servir o site em `*.test`)  
- Composer / npm  
- SQLite ou outro SGBD via `.env`

---

## 5. Organização do código

### 5.1 Backend

```
app/
  Enums/
    SolicitationStatus.php
    SolicitationCategory.php
  Http/
    Controllers/
      DashboardController.php
      SolicitationController.php
      Admin/
        UserController.php
        RoleController.php
      Settings/
        BrandingController.php
        ...
      Api/V1/
        DashboardController.php
        SolicitationController.php
    Middleware/
      EnsureUserHasPermission.php
      HandleInertiaRequests.php      # branding + auth.permissions/roles
    Requests/
      StoreSolicitationRequest.php
      UpdateSolicitationRequest.php
      UpdateSolicitationStatusRequest.php
      Admin/
      StoreUserRequest.php / UpdateUserRequest.php
      StoreRoleRequest.php / UpdateRoleRequest.php
      Settings/
        UpdateBrandingRequest.php
    Resources/Api/V1/
      SolicitationResource.php
  Models/
    User.php
    Solicitation.php
    Role.php
    Permission.php
    AppSetting.php
  Policies/
    SolicitationPolicy.php
  Providers/
    AppServiceProvider.php           # Gate::before por slug de permissão
routes/
  web.php
  api.php
  settings.php
database/
  migrations/                        # solicitations, roles, permissions, pivots, app_settings
  factories/
  seeders/
    DatabaseSeeder.php
    RolePermissionSeeder.php
    SolicitationSeeder.php
```

### 5.2 Frontend

```
resources/js/
  pages/
    dashboard.tsx
    solicitations/
    admin/
      users/
      roles/                 # UI rotulada como "Perfis"
    settings/
      branding.tsx
  lib/
    api.ts
    solicitation-api.ts
  types/
    solicitation.ts
    auth.ts                  # permissions[], roles[]
    branding.ts
  components/
    permission-picker.tsx
    page-shell.tsx / page-header.tsx / stat-card.tsx
    branding-sync.tsx
    ui/
  hooks/
    use-can.ts
  layouts/
resources/css/
  app.css                    # tokens de tema (teal/ciano)
```

### 5.3 Responsabilidades

| Camada | Responsabilidade |
|--------|------------------|
| Middleware `permission` | Bloqueia rota sem o recurso exigido |
| Policy | Regras de domínio (dono, status aberto, etc.) |
| Form Request | Validação + authorize da operação |
| Controller API | Orquestra query/persistência e resposta JSON |
| Controller Web/Admin | `Inertia::render` e mutações de admin/branding |
| Resource | Formato estável do JSON |
| Model / Scope | Filtros, geração de código, `hasPermission` |
| React pages | UX, estado local, chamadas à API, menus por permissão |

---

## 6. Modelo de dados

### 6.1 Tabela `solicitations`

| Coluna | Tipo | Observação |
|--------|------|------------|
| id | bigint PK | |
| code | string unique nullable | Preenchido após create (`SOL-XXXXX`) |
| title | string | |
| description | text | |
| category | string | Enum backed |
| status | string | Default `open` |
| user_id | FK users | Cascade on delete |
| created_at / updated_at | timestamps | |
| índices | category, status, created_at | Apoiam filtros |

### 6.2 RBAC

| Tabela | Função |
|--------|--------|
| `roles` | Perfis (`name`, `slug`, `description`) |
| `permissions` | Recursos (`name`, `slug`, `group`, `description`) |
| `permission_role` | N:N perfil ↔ recurso |
| `role_user` | N:N usuário ↔ perfil |

### 6.3 Branding

Tabela `app_settings`: `title`, `icon_path`, `favicon_path`, `image_path`.

Model `AppSetting::current()` devolve o registro (ou cria default com `config('app.name')`).

### 6.4 Relacionamentos

- `User` hasMany `Solicitation`  
- `Solicitation` belongsTo `User`  
- `User` belongsToMany `Role`  
- `Role` belongsToMany `Permission`  
- `Role` belongsToMany `User`

### 6.5 Enums

**Status**

| Valor | Label |
|-------|-------|
| `open` | Aberto |
| `in_progress` | Em Atendimento |
| `completed` | Concluído |

**Categoria**

| Valor | Label |
|-------|-------|
| `it` | TI |
| `hr` | RH |
| `purchasing` | Compras |
| `finance` | Financeiro |
| `infrastructure` | Infraestrutura |

---

## 7. API REST (v1)

### 7.1 Convenções

- Prefixo: `/api/v1`  
- Middleware: `web`, `auth`, `verified` + `permission:...`  
- Content negotiation: `Accept: application/json`  
- Erros de validação: HTTP `422` com `errors`  
- Autorização negada: HTTP `403`  
- Não autenticado: HTTP `401` (requisições JSON)

### 7.2 Endpoints

| Método | URI | Permissão | Controller |
|--------|-----|-----------|------------|
| GET | `/api/v1/dashboard/stats` | `dashboard.view` | `Api\V1\DashboardController` |
| GET | `/api/v1/solicitations` | `solicitations.view` | `index` |
| GET | `/api/v1/solicitations/meta` | `solicitations.view` | `meta` |
| POST | `/api/v1/solicitations` | `solicitations.create` | `store` |
| GET | `/api/v1/solicitations/{solicitation}` | `solicitations.view` | `show` |
| PUT/PATCH | `/api/v1/solicitations/{solicitation}` | `solicitations.update` | `update` |
| DELETE | `/api/v1/solicitations/{solicitation}` | `solicitations.delete` | `destroy` |
| PATCH | `/api/v1/solicitations/{solicitation}/status` | `solicitations.update_status` | `updateStatus` |

### 7.3 Rotas web (shells Inertia)

| Método | URI | Página | Permissão |
|--------|-----|--------|-----------|
| GET | `/` | redirect → `/dashboard` | — |
| GET | `/dashboard` | `dashboard` | `dashboard.view` |
| GET | `/solicitations` | `solicitations/index` | `solicitations.view` |
| GET | `/solicitations/create` | `solicitations/create` | `solicitations.create` |
| GET | `/solicitations/{id}` | `solicitations/show` | `solicitations.view` |
| GET | `/solicitations/{id}/edit` | `solicitations/edit` | `solicitations.update` |
| * | `/admin/users` | `admin/users/*` | `users.manage` |
| * | `/admin/roles` | `admin/roles/*` | `roles.manage` |
| GET/POST | `/settings/branding` | `settings/branding` | `branding.manage` |

> Na interface, o módulo `/admin/roles` é apresentado como **Perfis**.

---

## 8. Autorização e segurança

### 8.1 Camadas

1. **Middleware `permission:slug`** — exige o recurso na rota (web e API)  
2. **Policy `SolicitationPolicy`** — regras de domínio além do recurso  
3. **Form Requests / abort_unless** — mutações admin e branding  
4. **Gate::before** — se o usuário possui o slug igual à ability, libera  

### 8.2 Policy `SolicitationPolicy`

| Ability | Regra |
|---------|-------|
| viewAny / view | `solicitations.view` |
| create | `solicitations.create` |
| update | `solicitations.update` **e** dono **e** status aberto |
| delete | `solicitations.delete` **e** dono **e** status aberto |
| updateStatus | `solicitations.update_status` |

### 8.3 Controles adicionais

- Mass assignment via `#[Fillable]` / `validated()` / `safe()->only()`  
- CSRF em mutações (`X-XSRF-TOKEN`)  
- Middleware `auth` + `verified` nas rotas protegidas  
- Senhas com hash; regras de senha reforçadas em produção (`AppServiceProvider`)  
- Enums evitam valores inválidos de status/categoria (`Rule::enum`)  
- Props Inertia `auth.permissions` e `auth.roles` para UI (menu, settings)

### 8.4 Autenticação da API

A API v1 é **first-party** (mesmo domínio): autenticação por **sessão web**, não por token Bearer obrigatório.

> Observação: a implementação atual das rotas API utiliza middleware de sessão (`web` + `auth`), adequado ao consumo pelo React hospedado no mesmo app.

---

## 9. Frontend — boas práticas aplicadas

1. **TSX + tipos de domínio** em `resources/js/types`  
2. **Cliente HTTP centralizado** (`api.ts`) com tratamento de `ApiError` e 422  
3. **Módulo de API de domínio** (`solicitation-api.ts`) isolando URLs e payloads  
4. **Estados de loading/erro** nas páginas que consomem a API  
5. **Navegação Inertia** (`Link` / `router.visit`) para troca de telas  
6. **Componentes UI reutilizáveis** separados de componentes de domínio  
7. **Wayfinder** para rotas web tipadas (`@/routes`, `@/actions`)  
8. **Menu e settings filtrados por permissão** (`useCan` / `auth.permissions`)  
9. **BrandingSync** dentro dos layouts (contexto Inertia), não em `withApp`  
10. **Tema** via variáveis CSS + utilitários Tailwind (evita tema genérico monócromo)

---

## 10. Backend — boas práticas aplicadas

1. Controllers finos; validação em Form Requests  
2. Autorização em middleware de permissão + Policies / `authorize()`  
3. Resource controllers / rotas nomeadas  
4. Scopes Eloquent para filtros (`Solicitation::filter`)  
5. Eager loading (`with('user:id,name')`, `roles.permissions`) para evitar N+1  
6. Enums com `label()` e `options()` compartilhados com o front via API  
7. Factories e seeders (`RolePermissionSeeder`, `SolicitationSeeder`)  
8. Feature tests Pest cobrindo API, shells, admin e branding  

---

## 11. Testes

Principais suítes:

- `tests/Feature/Api/V1/SolicitationApiTest.php` — CRUD, filtros, status, auth  
- `tests/Feature/Api/V1/DashboardApiTest.php` — stats e shell do dashboard  
- `tests/Feature/Http/Controllers/SolicitationControllerTest.php` — páginas Inertia  
- `tests/Feature/UserRolePermissionTest.php` — usuários, perfis, recursos e 403  
- `tests/Feature/BrandingSettingsTest.php` — identidade visual  
- Helpers em `tests/Pest.php`: `adminUser()`, `userWithPermissions(...)`  
- Testes de autenticação Fortify já existentes no starter kit  

Execução:

```bash
php artisan test --compact
```

Os testes HTTP Inertia utilizam `withoutVite()` no `TestCase` para não depender do manifest em CI/local sem build. Usuários de teste que acessam rotas protegidas precisam de perfil/permissões (via `adminUser()`).

---

## 12. Operação e deploy

### 12.1 Ambiente local

1. `composer install`  
2. Configurar `.env` e `php artisan key:generate`  
3. `php artisan migrate --seed`  
4. `npm install && npm run build` (ou `npm run dev`)  
5. Acessar via Herd (`http://my-company.test`) ou servidor configurado  
6. `php artisan storage:link` se for usar uploads de branding  

Usuário seed: `test@example.com` / `password` (perfil Administrador)

### 12.2 Produção (checklist)

- `APP_ENV=production`, `APP_DEBUG=false`  
- `php artisan migrate --force`  
- `php artisan db:seed --class=RolePermissionSeeder` (se necessário em ambiente novo)  
- `npm run build` e assets versionados  
- `php artisan config:cache`, `route:cache`, `view:cache`  
- HTTPS e cookies seguros  
- Disco `public` gravável para branding  
- Backup do banco  

Opção sugerida pelo ecossistema Laravel: [Laravel Cloud](https://cloud.laravel.com/).

---

## 13. Decisões técnicas registradas

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Página vs API | Híbrido Inertia + API v1 | UX moderna + contrato JSON explícito |
| RBAC | Custom (Role/Permission) | Escopo controlado sem Spatie |
| Nome na UI | “Perfis” para `roles` | Linguagem de negócio em PT-BR |
| Idioma do domínio no código | Inglês (`Solicitation`, `Role`) | Convenção Laravel; labels em PT-BR |
| Código da solicitação | Gerado no `created` (`SOL-%05d`) | Legível após persistência |
| Edição/exclusão | Aberta + dono + permissão | Regra de negócio reforçada |
| Branding | `AppSetting` sem cache de Model | Evita `__PHP_Incomplete_Class` |
| Tema | Tokens teal/ciano | Painel mais colorido sem sair do design system |
| Tipagem front | TypeScript | Padrão do starter kit |

---

## 14. Limitações e evoluções possíveis

**Limitações atuais**

- Sem anexos, comentários ou histórico de mudanças de status  
- API acoplada à sessão first-party (não é API pública multi-cliente)  
- Paginação fixa (10 itens)  
- Rotas admin de usuários/perfis ainda são Inertia (não há API v1 para RBAC)

**Evoluções sugeridas**

- Histórico de status / auditoria  
- Anexos e notificações  
- API v1 para usuários/perfis (se houver cliente externo)  
- Sanctum token/SPA stateful documentado para clientes externos  
- Versionamento formal OpenAPI/Swagger da API v1  
- Escopo por área/departamento além de perfil  

---

## 15. Referências internas

- README operacional: [`README.md`](../README.md)  
- Rotas: `routes/web.php`, `routes/api.php`, `routes/settings.php`  
- Policy: `app/Policies/SolicitationPolicy.php`  
- RBAC: `app/Models/Role.php`, `Permission.php`, `EnsureUserHasPermission`  
- Seed: `database/seeders/RolePermissionSeeder.php`  
- Cliente HTTP: `resources/js/lib/api.ts`  
- Diretrizes do projeto: `AGENTS.md`

---

*Documento gerado para fins de documentação técnica do sistema de solicitações internas.*
