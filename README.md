# My Company — Sistema de Solicitações Internas

Sistema web para registro, acompanhamento e gestão de solicitações internas de uma empresa (TI, RH, Compras, Financeiro e Infraestrutura), com controle de acesso por perfis e identidade visual configurável.

## Funcionalidades

- **Autenticação** — login, sessão, logout, verificação de e-mail (Laravel Fortify)
- **Cadastro de solicitações** — título, descrição, categoria; criação com status *Aberto*
- **Gestão** — listagem, detalhes, alteração de status (*Aberto* → *Em Atendimento* → *Concluído*)
- **Edição / exclusão** — permitidas apenas para o solicitante, enquanto estiver aberta e com a permissão correspondente
- **Filtros** — período, categoria, status e texto livre no título
- **Dashboard** — indicadores: total, abertas, em atendimento e concluídas
- **Usuários e perfis** — CRUD de usuários, vínculo a perfis e seleção de recursos (permissions) por perfil
- **Identidade visual** — título, ícone, favicon e imagem configuráveis em Configurações

## Stack

| Camada | Tecnologias |
|--------|-------------|
| Backend | PHP 8.4, Laravel 13, Fortify, Eloquent, API Resources |
| Frontend | React 19, TypeScript (TSX), Inertia.js v3, Tailwind CSS v4 |
| UI | Radix UI / componentes estilo shadcn, Lucide Icons |
| Build | Vite 8, Wayfinder (rotas tipadas) |
| Qualidade | Pest, Pint, Larastan (PHPStan) |

## Arquitetura (resumo)

O projeto usa um modelo **híbrido**:

1. **Inertia** entrega as páginas (shell + layout + autenticação)
2. O **React consome APIs JSON** (`/api/v1/...`) para dados e mutações do domínio de solicitações
3. **RBAC próprio** (roles/permissions, sem Spatie) protege rotas web, API e menus

```
Browser (React)
    │  navegação/layout → Inertia
    │  dados/CRUD       → fetch /api/v1
    ▼
Laravel (sessão + middleware permission + policies + Eloquent)
    ▼
Banco de dados
```

Documentação técnica detalhada: [docs/MEMORIAL_TECNICO.md](docs/MEMORIAL_TECNICO.md)

## Requisitos

- PHP 8.4+
- Composer 2
- Node.js 22.12+ (recomendado; versões próximas podem exigir binding nativo do Rolldown)
- npm
- Banco configurado no `.env` (SQLite, MySQL ou PostgreSQL)
- Ambiente local sugerido: [Laravel Herd](https://herd.laravel.com/)

## Instalação

```bash
# Dependências PHP
composer install

# Ambiente
cp .env.example .env
php artisan key:generate

# Banco
php artisan migrate
php artisan db:seed

# Frontend
npm install
npm run build
```

Em desenvolvimento com hot reload:

```bash
composer run dev
# ou, em terminais separados:
php artisan serve   # se não usar Herd
npm run dev
```

Com Herd, o app costuma ficar em:

`http://my-company.test`

## Credenciais de demonstração

Após o seed:

| Campo | Valor |
|-------|--------|
| E-mail | `test@example.com` |
| Senha | `password` |
| Perfil | Administrador (todos os recursos) |

Perfis seedados: **Administrador**, **Atendente**, **Solicitante**.

## Uso rápido

1. Acesse a URL do projeto (raiz redireciona para `/dashboard`)
2. Faça login com o usuário demo
3. Use o menu conforme permissões: **Dashboard**, **Solicitações**, **Usuários**, **Perfis**
4. Em **Perfis**, selecione os recursos de cada papel; em **Usuários**, vincule os perfis
5. Em **Configurações → Identidade**, ajuste título e imagens (requer `branding.manage`)

## Controle de acesso (RBAC)

Modelo próprio: tabelas `roles`, `permissions`, `permission_role`, `role_user`.

| Recurso (slug) | Uso |
|----------------|-----|
| `dashboard.view` | Dashboard e stats API |
| `solicitations.view` | Listar / ver solicitações |
| `solicitations.create` | Criar |
| `solicitations.update` | Editar (ainda exige dono + aberta na policy) |
| `solicitations.delete` | Excluir (ainda exige dono + aberta na policy) |
| `solicitations.update_status` | Alterar status |
| `branding.manage` | Identidade visual |
| `users.manage` | CRUD de usuários e vínculo a perfis |
| `roles.manage` | CRUD de perfis e seleção de recursos |

Rotas web/API usam middleware `permission:...`. O menu lateral só exibe itens liberados.

Telas admin (Inertia):

| URI | Descrição |
|-----|-----------|
| `/admin/users` | Usuários |
| `/admin/roles` | Perfis e recursos |

## API (v1)

Base: `/api/v1`  
Autenticação: sessão web (mesmo domínio, usuário autenticado e e-mail verificado)  
Autorização: middleware de permissão + policies  
CSRF: cookie `XSRF-TOKEN` + header `X-XSRF-TOKEN`

| Método | Endpoint | Permissão |
|--------|----------|-----------|
| GET | `/api/v1/dashboard/stats` | `dashboard.view` |
| GET | `/api/v1/solicitations` | `solicitations.view` |
| GET | `/api/v1/solicitations/meta` | `solicitations.view` |
| POST | `/api/v1/solicitations` | `solicitations.create` |
| GET | `/api/v1/solicitations/{id}` | `solicitations.view` |
| PUT/PATCH | `/api/v1/solicitations/{id}` | `solicitations.update` |
| DELETE | `/api/v1/solicitations/{id}` | `solicitations.delete` |
| PATCH | `/api/v1/solicitations/{id}/status` | `solicitations.update_status` |

### Query params da listagem

- `search` — texto no título
- `category` — `it`, `hr`, `purchasing`, `finance`, `infrastructure`
- `status` — `open`, `in_progress`, `completed`
- `from` / `to` — datas (`Y-m-d`)
- `page` — página da paginação

### Exemplo de criação

```http
POST /api/v1/solicitations
Accept: application/json
Content-Type: application/json
X-XSRF-TOKEN: <token>
X-Requested-With: XMLHttpRequest

{
  "title": "Notebook com defeito",
  "description": "Tela piscando ao ligar",
  "category": "it"
}
```

Cliente frontend: `resources/js/lib/api.ts` e `resources/js/lib/solicitation-api.ts`.

## Estrutura relevante

```
app/
  Enums/                         # Status e categorias
  Http/Controllers/              # Shells Inertia + Api/V1 + Admin + Settings
  Http/Middleware/               # EnsureUserHasPermission
  Http/Requests/                 # Validação (domínio, admin, branding)
  Http/Resources/Api/V1/         # Transformação JSON
  Models/                        # User, Solicitation, Role, Permission, AppSetting
  Policies/
resources/js/
  pages/                         # dashboard, solicitations, admin, settings
  lib/                           # Cliente HTTP e APIs de domínio
  components/                    # UI, page-shell, permission-picker
  hooks/use-can.ts               # Checagem de permissão no front
  types/
routes/
  web.php                        # Páginas + admin
  api.php                        # API v1
  settings.php                   # Perfil, segurança, aparência, branding
tests/Feature/                   # Pest (API, admin, branding, páginas)
docs/
  MEMORIAL_TECNICO.md
```

## Scripts úteis

```bash
# Testes
php artisan test --compact

# Formatação PHP
vendor/bin/pint

# Análise estática PHP
composer types:check

# Checagens frontend
npm run check
npm run types:check

# Build de produção
npm run build
```

## Regras de negócio principais

- Toda solicitação nasce com status **Aberto** e código `SOL-XXXXX`
- Editar/excluir: **dono** + status **Aberto** + permissão correspondente
- Alterar status: permissão `solicitations.update_status`
- Acesso às telas/API: permissões do perfil vinculado ao usuário
- Categorias: TI, RH, Compras, Financeiro, Infraestrutura
- O perfil **Administrador** não pode ser excluído

## Licença

MIT (base Laravel React Starter Kit).

## Deployment

Foi utilizado a plataforma do oracle cloud para hospedar a aplicação e o banco de dados MySQL
Disponível em: http://my-company.onefast.site/login

## Memorial Técnico

[MEMORIAL_TECNICO.md](docs/MEMORIAL_TECNICO.md)
