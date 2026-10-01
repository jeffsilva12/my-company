<?php

namespace App\Http\Controllers;

use App\Enums\SolicitationStatus;
use App\Models\Solicitation;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard with solicitation indicators.
     */
    public function __invoke(): Response
    {
        $stats = [
            'total' => Solicitation::query()->count(),
            'open' => Solicitation::query()->where('status', SolicitationStatus::Open)->count(),
            'in_progress' => Solicitation::query()->where('status', SolicitationStatus::InProgress)->count(),
            'completed' => Solicitation::query()->where('status', SolicitationStatus::Completed)->count(),
        ];

        return Inertia::render('dashboard', [
            'stats' => $stats,
        ]);
    }
}
