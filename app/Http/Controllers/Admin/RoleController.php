<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRoleRequest;
use App\Http\Requests\Admin\UpdateRoleRequest;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    public function index(): Response
    {
        $roles = Role::query()
            ->withCount(['permissions', 'users'])
            ->with('permissions:id,name,slug,group')
            ->orderBy('name')
            ->get()
            ->map(fn (Role $role): array => [
                'id' => $role->id,
                'name' => $role->name,
                'slug' => $role->slug,
                'description' => $role->description,
                'permissions_count' => $role->permissions_count,
                'users_count' => $role->users_count,
                'permissions' => $role->permissions->map(fn (Permission $permission): array => [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'slug' => $permission->slug,
                    'group' => $permission->group,
                ])->values(),
            ]);

        return Inertia::render('admin/roles/index', [
            'roles' => $roles,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/roles/create', [
            'permissionGroups' => $this->permissionGroups(),
        ]);
    }

    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $role = Role::query()->create($request->safe()->only(['name', 'slug', 'description']));
        $role->permissions()->sync($request->validated('permission_ids', []));

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Perfil criado com sucesso.',
        ]);

        return to_route('admin.roles.index');
    }

    public function edit(Role $role): Response
    {
        $role->load('permissions:id');

        return Inertia::render('admin/roles/edit', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'slug' => $role->slug,
                'description' => $role->description,
                'permission_ids' => $role->permissions->pluck('id')->values(),
            ],
            'permissionGroups' => $this->permissionGroups(),
        ]);
    }

    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        $role->update($request->safe()->only(['name', 'slug', 'description']));
        $role->permissions()->sync($request->validated('permission_ids', []));

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Perfil atualizado com sucesso.',
        ]);

        return to_route('admin.roles.index');
    }

    public function destroy(Role $role): RedirectResponse
    {
        abort_unless(request()->user()?->hasPermission('roles.manage'), 403);

        if ($role->slug === 'admin') {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'O perfil Administrador não pode ser excluído.',
            ]);

            return back();
        }

        $role->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Perfil excluído com sucesso.',
        ]);

        return to_route('admin.roles.index');
    }

    /**
     * @return array<int, array{group: string, permissions: array<int, array{id: int, name: string, slug: string, description: string|null}>}>
     */
    private function permissionGroups(): array
    {
        return Permission::query()
            ->orderBy('group')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'group', 'description'])
            ->groupBy('group')
            ->map(fn ($permissions, $group): array => [
                'group' => (string) $group,
                'permissions' => $permissions->map(fn (Permission $permission): array => [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'slug' => $permission->slug,
                    'description' => $permission->description,
                ])->values()->all(),
            ])
            ->values()
            ->all();
    }
}
