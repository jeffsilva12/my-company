<?php

namespace App\Http\Controllers;

use App\Enums\SolicitationCategory;
use App\Enums\SolicitationStatus;
use App\Http\Requests\StoreSolicitationRequest;
use App\Http\Requests\UpdateSolicitationRequest;
use App\Http\Requests\UpdateSolicitationStatusRequest;
use App\Models\Solicitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class SolicitationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Solicitation::class);

        $filters = $request->only(['search', 'category', 'status', 'from', 'to']);

        $solicitations = Solicitation::query()
            ->with('user:id,name')
            ->filter($filters)
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Solicitation $solicitation): array => $this->toListItem($solicitation));

        return Inertia::render('solicitations/index', [
            'solicitations' => $solicitations,
            'filters' => [
                'search' => $filters['search'] ?? '',
                'category' => $filters['category'] ?? '',
                'status' => $filters['status'] ?? '',
                'from' => $filters['from'] ?? '',
                'to' => $filters['to'] ?? '',
            ],
            'categories' => SolicitationCategory::options(),
            'statuses' => SolicitationStatus::options(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        Gate::authorize('create', Solicitation::class);

        return Inertia::render('solicitations/create', [
            'categories' => SolicitationCategory::options(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSolicitationRequest $request): RedirectResponse
    {
        $solicitation = $request->user()->solicitations()->create(
            $request->safe()->only(['title', 'description', 'category']),
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Solicitação criada com sucesso.',
        ]);

        return to_route('solicitations.show', $solicitation);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Solicitation $solicitation): Response
    {
        Gate::authorize('view', $solicitation);

        $solicitation->load('user:id,name');

        return Inertia::render('solicitations/show', [
            'solicitation' => $this->toDetail($solicitation, $request),
            'statuses' => SolicitationStatus::options(),
            'can' => [
                'update' => $request->user()?->can('update', $solicitation) ?? false,
                'delete' => $request->user()?->can('delete', $solicitation) ?? false,
                'updateStatus' => $request->user()?->can('updateStatus', $solicitation) ?? false,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Solicitation $solicitation): Response
    {
        Gate::authorize('update', $solicitation);

        return Inertia::render('solicitations/edit', [
            'solicitation' => [
                'id' => $solicitation->id,
                'code' => $solicitation->code,
                'title' => $solicitation->title,
                'description' => $solicitation->description,
                'category' => $solicitation->category->value,
            ],
            'categories' => SolicitationCategory::options(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSolicitationRequest $request, Solicitation $solicitation): RedirectResponse
    {
        $solicitation->update(
            $request->safe()->only(['title', 'description', 'category']),
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Solicitação atualizada com sucesso.',
        ]);

        return to_route('solicitations.show', $solicitation);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Solicitation $solicitation): RedirectResponse
    {
        Gate::authorize('delete', $solicitation);

        $solicitation->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Solicitação excluída com sucesso.',
        ]);

        return to_route('solicitations.index');
    }

    /**
     * Update the status of the specified resource.
     */
    public function updateStatus(UpdateSolicitationStatusRequest $request, Solicitation $solicitation): RedirectResponse
    {
        $solicitation->update(
            $request->safe()->only(['status']),
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Status atualizado com sucesso.',
        ]);

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    private function toListItem(Solicitation $solicitation): array
    {
        return [
            'id' => $solicitation->id,
            'code' => $solicitation->code,
            'title' => $solicitation->title,
            'category' => $solicitation->category->value,
            'category_label' => $solicitation->category->label(),
            'status' => $solicitation->status->value,
            'status_label' => $solicitation->status->label(),
            'requester' => $solicitation->user->name,
            'opened_at' => $solicitation->created_at?->timezone(config('app.timezone'))->format('d/m/Y H:i'),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function toDetail(Solicitation $solicitation, Request $request): array
    {
        return [
            ...$this->toListItem($solicitation),
            'description' => $solicitation->description,
            'user_id' => $solicitation->user_id,
            'is_owner' => $solicitation->user_id === $request->user()?->id,
        ];
    }
}
