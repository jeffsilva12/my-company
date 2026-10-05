<?php

use App\Enums\SolicitationCategory;
use App\Enums\SolicitationStatus;
use App\Models\Solicitation;

test('guests cannot access solicitations api', function () {
    $this->getJson('/api/v1/solicitations')->assertUnauthorized();
});

test('authenticated users can list solicitations via api', function () {
    $user = adminUser();
    Solicitation::factory()->for($user)->create(['title' => 'Troca de monitor']);

    $this->actingAs($user)
        ->getJson('/api/v1/solicitations')
        ->assertOk()
        ->assertJsonPath('data.0.title', 'Troca de monitor')
        ->assertJsonStructure([
            'data',
            'meta' => ['filters', 'categories', 'statuses', 'current_page', 'total'],
        ]);
});

test('authenticated users can create a solicitation via api', function () {
    $user = adminUser();

    $response = $this->actingAs($user)->postJson('/api/v1/solicitations', [
        'title' => 'Acesso ao sistema',
        'description' => 'Preciso de acesso ao ERP.',
        'category' => SolicitationCategory::It->value,
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.title', 'Acesso ao sistema')
        ->assertJsonPath('data.status', SolicitationStatus::Open->value);

    $this->assertDatabaseHas('solicitations', [
        'title' => 'Acesso ao sistema',
        'user_id' => $user->id,
    ]);
});

test('api validates required fields when creating solicitations', function () {
    $user = adminUser();

    $this->actingAs($user)
        ->postJson('/api/v1/solicitations', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['title', 'description', 'category']);
});

test('owner can update an open solicitation via api', function () {
    $user = adminUser();
    $solicitation = Solicitation::factory()->for($user)->open()->create();

    $this->actingAs($user)
        ->putJson("/api/v1/solicitations/{$solicitation->id}", [
            'title' => 'Título atualizado',
            'description' => 'Descrição atualizada',
            'category' => SolicitationCategory::Hr->value,
        ])
        ->assertOk()
        ->assertJsonPath('data.title', 'Título atualizado');
});

test('owner cannot update a non open solicitation via api', function () {
    $user = adminUser();
    $solicitation = Solicitation::factory()->for($user)->inProgress()->create();

    $this->actingAs($user)
        ->putJson("/api/v1/solicitations/{$solicitation->id}", [
            'title' => 'Título atualizado',
            'description' => 'Descrição atualizada',
            'category' => SolicitationCategory::Hr->value,
        ])
        ->assertForbidden();
});

test('owner can delete an open solicitation via api', function () {
    $user = adminUser();
    $solicitation = Solicitation::factory()->for($user)->open()->create();

    $this->actingAs($user)
        ->deleteJson("/api/v1/solicitations/{$solicitation->id}")
        ->assertOk();

    $this->assertDatabaseMissing('solicitations', ['id' => $solicitation->id]);
});

test('users can update solicitation status via api', function () {
    $user = adminUser();
    $solicitation = Solicitation::factory()->for($user)->open()->create();

    $this->actingAs($user)
        ->patchJson("/api/v1/solicitations/{$solicitation->id}/status", [
            'status' => SolicitationStatus::InProgress->value,
        ])
        ->assertOk()
        ->assertJsonPath('data.status', SolicitationStatus::InProgress->value);
});

test('users can filter solicitations via api', function () {
    $user = adminUser();

    Solicitation::factory()->for($user)->open()->create([
        'title' => 'Notebook quebrado',
        'category' => SolicitationCategory::It,
    ]);

    Solicitation::factory()->for($user)->completed()->create([
        'title' => 'Pedido de férias',
        'category' => SolicitationCategory::Hr,
    ]);

    $this->actingAs($user)
        ->getJson('/api/v1/solicitations?search=Notebook&category=it&status=open')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.title', 'Notebook quebrado');
});

test('inertia solicitation pages render shells', function () {
    $user = adminUser();
    $solicitation = Solicitation::factory()->for($user)->create();

    $this->actingAs($user)
        ->get(route('solicitations.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('solicitations/index'));

    $this->actingAs($user)
        ->get(route('solicitations.show', $solicitation))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('solicitations/show')
            ->where('solicitationId', $solicitation->id));
});
