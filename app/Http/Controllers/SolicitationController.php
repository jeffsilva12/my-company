<?php

namespace App\Http\Controllers;

use App\Models\Solicitation;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class SolicitationController extends Controller
{
    /**
     * Display the solicitations index page shell.
     */
    public function index(): Response
    {
        Gate::authorize('viewAny', Solicitation::class);

        return Inertia::render('solicitations/index');
    }

    /**
     * Display the create solicitation page shell.
     */
    public function create(): Response
    {
        Gate::authorize('create', Solicitation::class);

        return Inertia::render('solicitations/create');
    }

    /**
     * Display the solicitation details page shell.
     */
    public function show(Solicitation $solicitation): Response
    {
        Gate::authorize('view', $solicitation);

        return Inertia::render('solicitations/show', [
            'solicitationId' => $solicitation->id,
        ]);
    }

    /**
     * Display the edit solicitation page shell.
     */
    public function edit(Solicitation $solicitation): Response
    {
        Gate::authorize('update', $solicitation);

        return Inertia::render('solicitations/edit', [
            'solicitationId' => $solicitation->id,
        ]);
    }
}
