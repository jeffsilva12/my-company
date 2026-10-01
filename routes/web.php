<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SolicitationController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::resource('solicitations', SolicitationController::class);
    Route::patch('solicitations/{solicitation}/status', [SolicitationController::class, 'updateStatus'])
        ->name('solicitations.status.update');
});

require __DIR__.'/settings.php';
