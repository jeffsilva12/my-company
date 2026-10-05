<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        $users = User::query()
            ->with('roles:id,name,slug')
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->map(fn (Role $role): array => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'slug' => $role->slug,
                ])->values(),
                'created_at' => $user->created_at?->timezone(config('app.timezone'))->format('d/m/Y H:i'),
            ]);

        return Inertia::render('admin/users/index', [
            'users' => $users,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/users/create', [
            'roles' => Role::query()->orderBy('name')->get(['id', 'name', 'slug', 'description']),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $user = User::query()->create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => $request->validated('password'),
            'email_verified_at' => now(),
        ]);

        $user->roles()->sync($request->validated('role_ids', []));

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Usuário criado com sucesso.',
        ]);

        return to_route('admin.users.index');
    }

    public function edit(User $user): Response
    {
        $user->load('roles:id');

        return Inertia::render('admin/users/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role_ids' => $user->roles->pluck('id')->values(),
            ],
            'roles' => Role::query()->orderBy('name')->get(['id', 'name', 'slug', 'description']),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $data = [
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
        ];

        if (filled($request->validated('password'))) {
            $data['password'] = $request->validated('password');
        }

        $user->update($data);
        $user->roles()->sync($request->validated('role_ids', []));

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Usuário atualizado com sucesso.',
        ]);

        return to_route('admin.users.index');
    }

    public function destroy(User $user): RedirectResponse
    {
        abort_unless(request()->user()?->hasPermission('users.manage'), 403);

        if ($user->is(request()->user())) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Você não pode excluir o próprio usuário.',
            ]);

            return back();
        }

        $user->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Usuário excluído com sucesso.',
        ]);

        return to_route('admin.users.index');
    }
}
