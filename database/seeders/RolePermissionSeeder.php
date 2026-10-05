<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            ['name' => 'Ver dashboard', 'slug' => 'dashboard.view', 'group' => 'Dashboard', 'description' => 'Acessar o painel de indicadores'],
            ['name' => 'Ver solicitações', 'slug' => 'solicitations.view', 'group' => 'Solicitações', 'description' => 'Listar e consultar solicitações'],
            ['name' => 'Criar solicitações', 'slug' => 'solicitations.create', 'group' => 'Solicitações', 'description' => 'Abrir novas solicitações'],
            ['name' => 'Editar solicitações', 'slug' => 'solicitations.update', 'group' => 'Solicitações', 'description' => 'Editar solicitações abertas'],
            ['name' => 'Excluir solicitações', 'slug' => 'solicitations.delete', 'group' => 'Solicitações', 'description' => 'Excluir solicitações abertas'],
            ['name' => 'Alterar status', 'slug' => 'solicitations.update_status', 'group' => 'Solicitações', 'description' => 'Mudar status das solicitações'],
            ['name' => 'Identidade visual', 'slug' => 'branding.manage', 'group' => 'Configurações', 'description' => 'Alterar título, ícone, favicon e imagem'],
            ['name' => 'Gerenciar usuários', 'slug' => 'users.manage', 'group' => 'Administração', 'description' => 'Criar, editar e vincular perfis a usuários'],
            ['name' => 'Gerenciar perfis', 'slug' => 'roles.manage', 'group' => 'Administração', 'description' => 'Criar perfis e selecionar recursos'],
        ];

        foreach ($permissions as $permission) {
            Permission::query()->updateOrCreate(
                ['slug' => $permission['slug']],
                $permission,
            );
        }

        $allPermissionIds = Permission::query()->pluck('id');

        $admin = Role::query()->updateOrCreate(
            ['slug' => 'admin'],
            [
                'name' => 'Administrador',
                'description' => 'Acesso completo ao sistema',
            ],
        );
        $admin->permissions()->sync($allPermissionIds);

        $attendant = Role::query()->updateOrCreate(
            ['slug' => 'atendente'],
            [
                'name' => 'Atendente',
                'description' => 'Acompanha e atualiza status das solicitações',
            ],
        );
        $attendant->permissions()->sync(
            Permission::query()
                ->whereIn('slug', [
                    'dashboard.view',
                    'solicitations.view',
                    'solicitations.update_status',
                ])
                ->pluck('id'),
        );

        $requester = Role::query()->updateOrCreate(
            ['slug' => 'solicitante'],
            [
                'name' => 'Solicitante',
                'description' => 'Abre e acompanha suas solicitações',
            ],
        );
        $requester->permissions()->sync(
            Permission::query()
                ->whereIn('slug', [
                    'dashboard.view',
                    'solicitations.view',
                    'solicitations.create',
                    'solicitations.update',
                    'solicitations.delete',
                ])
                ->pluck('id'),
        );

        $testUser = User::query()->where('email', 'test@example.com')->first();

        if ($testUser !== null) {
            $testUser->roles()->sync([$admin->id]);
        }
    }
}
