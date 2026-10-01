<?php

use App\Enums\SolicitationStatus;
use App\Models\Solicitation;
use App\Models\User;

test('authenticated users can update solicitation status', function () {
    $user = User::factory()->create();
    $solicitation = Solicitation::factory()->for($user)->open()->create();

    $this->actingAs($user)
        ->patch(route('solicitations.status.update', $solicitation), [
            'status' => SolicitationStatus::InProgress->value,
        ])
        ->assertRedirect();

    expect($solicitation->fresh()->status)->toBe(SolicitationStatus::InProgress);
});

test('status update requires a valid status', function () {
    $user = User::factory()->create();
    $solicitation = Solicitation::factory()->for($user)->open()->create();

    $this->actingAs($user)
        ->patch(route('solicitations.status.update', $solicitation), [
            'status' => 'invalid',
        ])
        ->assertSessionHasErrors(['status']);
});

test('guests cannot update solicitation status', function () {
    $solicitation = Solicitation::factory()->open()->create();

    $this->patch(route('solicitations.status.update', $solicitation), [
        'status' => SolicitationStatus::Completed->value,
    ])->assertRedirect(route('login'));
});
