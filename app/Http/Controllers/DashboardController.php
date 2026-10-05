<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard page shell.
     */
    public function __invoke(): Response
    {
        return Inertia::render('dashboard');
    }
}
