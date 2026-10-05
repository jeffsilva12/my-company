<?php

use App\Enums\SolicitationStatus;
use App\Models\Solicitation;

test('status can be updated through the api endpoint', function () {
    $user = adminUser();
    $solicitation = Solicitation::factory()->for($user)->open()->create();

    $this->actingAs($user)
        ->patchJson("/api/v1/solicitations/{$solicitation->id}/status", [
            'status' => SolicitationStatus::Completed->value,
        ])
        ->assertOk()
        ->assertJsonPath('data.status', SolicitationStatus::Completed->value);
});
