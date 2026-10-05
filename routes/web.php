<?php

use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SolicitationController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)
        ->middleware('permission:dashboard.view')
        ->name('dashboard');

    Route::get('solicitations', [SolicitationController::class, 'index'])
        ->middleware('permission:solicitations.view')
        ->name('solicitations.index');

    Route::get('solicitations/create', [SolicitationController::class, 'create'])
        ->middleware('permission:solicitations.create')
        ->name('solicitations.create');

    Route::get('solicitations/{solicitation}/edit', [SolicitationController::class, 'edit'])
        ->middleware('permission:solicitations.update')
        ->name('solicitations.edit');

    Route::get('solicitations/{solicitation}', [SolicitationController::class, 'show'])
        ->middleware('permission:solicitations.view')
        ->name('solicitations.show');

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::middleware('permission:users.manage')->group(function () {
            Route::resource('users', UserController::class)->except(['show']);
        });

        Route::middleware('permission:roles.manage')->group(function () {
            Route::resource('roles', RoleController::class)->except(['show']);
        });
    });
});

require __DIR__.'/settings.php';
