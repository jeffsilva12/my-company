<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\SolicitationCategory;
use App\Enums\SolicitationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSolicitationRequest;
use App\Http\Requests\UpdateSolicitationRequest;
use App\Http\Requests\UpdateSolicitationStatusRequest;
use App\Http\Resources\Api\V1\SolicitationResource;
use App\Models\Solicitation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class SolicitationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', Solicitation::class);

        $filters = $request->only(['search', 'category', 'status', 'from', 'to']);

        $solicitations = Solicitation::query()
            ->with('user:id,name')
            ->filter($filters)
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return SolicitationResource::collection($solicitations)->additional([
            'meta' => [
                'filters' => [
                    'search' => $filters['search'] ?? '',
                    'category' => $filters['category'] ?? '',
                    'status' => $filters['status'] ?? '',
                    'from' => $filters['from'] ?? '',
                    'to' => $filters['to'] ?? '',
                ],
                'categories' => SolicitationCategory::options(),
                'statuses' => SolicitationStatus::options(),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSolicitationRequest $request): JsonResponse
    {
        $solicitation = $request->user()->solicitations()->create(
            $request->safe()->only(['title', 'description', 'category']),
        );

        $solicitation->load('user:id,name');

        return (new SolicitationResource($solicitation))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Solicitation $solicitation): SolicitationResource
    {
        Gate::authorize('view', $solicitation);

        $solicitation->load('user:id,name');

        return new SolicitationResource($solicitation);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSolicitationRequest $request, Solicitation $solicitation): SolicitationResource
    {
        $solicitation->update(
            $request->safe()->only(['title', 'description', 'category']),
        );

        $solicitation->load('user:id,name');

        return new SolicitationResource($solicitation);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Solicitation $solicitation): JsonResponse
    {
        Gate::authorize('delete', $solicitation);

        $solicitation->delete();

        return response()->json([
            'message' => 'Solicitação excluída com sucesso.',
        ]);
    }

    /**
     * Update the status of the specified resource.
     */
    public function updateStatus(
        UpdateSolicitationStatusRequest $request,
        Solicitation $solicitation,
    ): SolicitationResource {
        $solicitation->update(
            $request->safe()->only(['status']),
        );

        $solicitation->load('user:id,name');

        return new SolicitationResource($solicitation);
    }

    /**
     * Return shared form options.
     */
    public function meta(): JsonResponse
    {
        Gate::authorize('viewAny', Solicitation::class);

        return response()->json([
            'categories' => SolicitationCategory::options(),
            'statuses' => SolicitationStatus::options(),
        ]);
    }
}
