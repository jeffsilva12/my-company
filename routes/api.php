<?php

use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\SolicitationController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'verified'])->prefix('v1')->name('api.v1.')->group(function () {
    Route::get('dashboard/stats', DashboardController::class)
        ->middleware('permission:dashboard.view')
        ->name('dashboard.stats');

    Route::middleware('permission:solicitations.view')->group(function () {
        Route::get('solicitations/meta', [SolicitationController::class, 'meta'])->name('solicitations.meta');
        Route::get('solicitations', [SolicitationController::class, 'index'])->name('solicitations.index');
        Route::get('solicitations/{solicitation}', [SolicitationController::class, 'show'])->name('solicitations.show');
    });

    Route::post('solicitations', [SolicitationController::class, 'store'])
        ->middleware('permission:solicitations.create')
        ->name('solicitations.store');

    Route::match(['put', 'patch'], 'solicitations/{solicitation}', [SolicitationController::class, 'update'])
        ->middleware('permission:solicitations.update')
        ->name('solicitations.update');

    Route::delete('solicitations/{solicitation}', [SolicitationController::class, 'destroy'])
        ->middleware('permission:solicitations.delete')
        ->name('solicitations.destroy');

    Route::patch('solicitations/{solicitation}/status', [SolicitationController::class, 'updateStatus'])
        ->middleware('permission:solicitations.update_status')
        ->name('solicitations.status.update');
});
