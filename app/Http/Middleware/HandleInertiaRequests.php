<?php

namespace App\Http\Middleware;

use App\Models\AppSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $branding = AppSetting::current()->toBrandingArray();
        $user = $request->user();

        if ($user !== null) {
            $user->loadMissing(['roles.permissions']);
        }

        View::share('branding', $branding);

        return [
            ...parent::share($request),
            'name' => $branding['title'],
            'branding' => $branding,
            'auth' => [
                'user' => $user,
                'permissions' => $user?->permissionSlugs()->values()->all() ?? [],
                'roles' => $user?->roles->pluck('slug')->values()->all() ?? [],
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
