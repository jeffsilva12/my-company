<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\SolicitationStatus;
use App\Http\Controllers\Controller;
use App\Models\Solicitation;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Return dashboard solicitation indicators.
     */
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'data' => [
                'total' => Solicitation::query()->count(),
                'open' => Solicitation::query()->where('status', SolicitationStatus::Open)->count(),
                'in_progress' => Solicitation::query()->where('status', SolicitationStatus::InProgress)->count(),
                'completed' => Solicitation::query()->where('status', SolicitationStatus::Completed)->count(),
            ],
        ]);
    }
}
