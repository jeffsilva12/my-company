<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

test('admin can manage users and assign roles', function () {
    $admin = adminUser();
    $role = Role::query()->where('slug', 'solicitante')->firstOrFail();

    $this->actingAs($admin)
        ->post(route('admin.users.store'), [
            'name' => 'Maria Silva',
            'email' => 'maria@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role_ids' => [$role->id],
        ])
        ->assertRedirect(route('admin.users.index'));

    $user = User::query()->where('email', 'maria@example.com')->first();

    expect($user)->not->toBeNull()
        ->and($user->hasRole('solicitante'))->toBeTrue()
        ->and($user->hasPermission('solicitations.create'))->toBeTrue();
});

test('users without permission cannot access user admin', function () {
    $user = userWithPermissions('dashboard.view');

    $this->actingAs($user)
        ->get(route('admin.users.index'))
        ->assertForbidden();
});

test('admin can create role with selected permissions', function () {
    $admin = adminUser();
    $permissionIds = Permission::query()
        ->whereIn('slug', ['dashboard.view', 'solicitations.view'])
        ->pluck('id')
        ->all();

    $this->actingAs($admin)
        ->post(route('admin.roles.store'), [
            'name' => 'Financeiro',
            'description' => 'Acesso financeiro limitado',
            'permission_ids' => $permissionIds,
        ])
        ->assertRedirect(route('admin.roles.index'));

    $role = Role::query()->where('slug', 'financeiro')->first();

    expect($role)->not->toBeNull()
        ->and($role->permissions)->toHaveCount(2)
        ->and($role->permissions->pluck('slug')->sort()->values()->all())
        ->toBe(['dashboard.view', 'solicitations.view']);
});

test('admin can update role permissions', function () {
    $admin = adminUser();
    $role = Role::query()->where('slug', 'atendente')->firstOrFail();
    $permissionIds = Permission::query()
        ->whereIn('slug', ['dashboard.view', 'solicitations.view', 'branding.manage'])
        ->pluck('id')
        ->all();

    $this->actingAs($admin)
        ->put(route('admin.roles.update', $role), [
            'name' => $role->name,
            'slug' => $role->slug,
            'description' => $role->description,
            'permission_ids' => $permissionIds,
        ])
        ->assertRedirect(route('admin.roles.index'));

    expect($role->fresh()->permissions->pluck('slug')->all())->toContain('branding.manage');
});

test('admin role cannot be deleted', function () {
    $admin = adminUser();
    $role = Role::query()->where('slug', 'admin')->firstOrFail();

    $this->actingAs($admin)
        ->delete(route('admin.roles.destroy', $role))
        ->assertRedirect();

    $this->assertDatabaseHas('roles', ['slug' => 'admin']);
});

test('user without roles is denied protected routes', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertForbidden();
});
