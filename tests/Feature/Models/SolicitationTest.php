<?php

use App\Enums\SolicitationStatus;
use App\Models\Solicitation;
use App\Models\User;

test('solicitation generates a code after creation', function () {
    $solicitation = Solicitation::factory()->create();

    expect($solicitation->fresh()->code)->toBe(sprintf('SOL-%05d', $solicitation->id));
});

test('solicitation defaults to open status', function () {
    $solicitation = Solicitation::factory()->create();

    expect($solicitation->status)->toBe(SolicitationStatus::Open)
        ->and($solicitation->isOpen())->toBeTrue();
});

test('user has many solicitations', function () {
    $user = User::factory()->create();
    Solicitation::factory()->for($user)->count(3)->create();

    expect($user->solicitations)->toHaveCount(3);
});
