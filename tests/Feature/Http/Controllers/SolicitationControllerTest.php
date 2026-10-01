<?php

use App\Enums\SolicitationCategory;
use App\Enums\SolicitationStatus;
use App\Models\Solicitation;
use App\Models\User;

test('guests cannot access solicitations', function () {
    $this->get(route('solicitations.index'))->assertRedirect(route('login'));
});

test('authenticated users can view solicitations list', function () {
    $user = User::factory()->create();
    Solicitation::factory()->for($user)->create(['title' => 'Troca de monitor']);

    $this->actingAs($user)
        ->get(route('solicitations.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('solicitations/index')
            ->has('solicitations.data', 1)
            ->where('solicitations.data.0.title', 'Troca de monitor'));
});

test('authenticated users can create a solicitation', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('solicitations.store'), [
        'title' => 'Acesso ao sistema',
        'description' => 'Preciso de acesso ao ERP.',
        'category' => SolicitationCategory::It->value,
    ]);

    $solicitation = Solicitation::query()->first();

    expect($solicitation)->not->toBeNull()
        ->and($solicitation->user_id)->toBe($user->id)
        ->and($solicitation->status)->toBe(SolicitationStatus::Open)
        ->and($solicitation->code)->toBe('SOL-00001');

    $response->assertRedirect(route('solicitations.show', $solicitation));
});

test('solicitation creation requires title description and category', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('solicitations.store'), [])
        ->assertSessionHasErrors(['title', 'description', 'category']);
});

test('owner can update an open solicitation', function () {
    $user = User::factory()->create();
    $solicitation = Solicitation::factory()->for($user)->open()->create();

    $this->actingAs($user)
        ->put(route('solicitations.update', $solicitation), [
            'title' => 'Título atualizado',
            'description' => 'Descrição atualizada',
            'category' => SolicitationCategory::Hr->value,
        ])
        ->assertRedirect(route('solicitations.show', $solicitation));

    expect($solicitation->fresh())
        ->title->toBe('Título atualizado')
        ->category->toBe(SolicitationCategory::Hr);
});

test('owner cannot update a non open solicitation', function () {
    $user = User::factory()->create();
    $solicitation = Solicitation::factory()->for($user)->inProgress()->create();

    $this->actingAs($user)
        ->put(route('solicitations.update', $solicitation), [
            'title' => 'Título atualizado',
            'description' => 'Descrição atualizada',
            'category' => SolicitationCategory::Hr->value,
        ])
        ->assertForbidden();
});

test('another user cannot update an open solicitation', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $solicitation = Solicitation::factory()->for($owner)->open()->create();

    $this->actingAs($other)
        ->put(route('solicitations.update', $solicitation), [
            'title' => 'Título atualizado',
            'description' => 'Descrição atualizada',
            'category' => SolicitationCategory::Hr->value,
        ])
        ->assertForbidden();
});

test('owner can delete an open solicitation', function () {
    $user = User::factory()->create();
    $solicitation = Solicitation::factory()->for($user)->open()->create();

    $this->actingAs($user)
        ->delete(route('solicitations.destroy', $solicitation))
        ->assertRedirect(route('solicitations.index'));

    $this->assertDatabaseMissing('solicitations', ['id' => $solicitation->id]);
});

test('owner cannot delete a completed solicitation', function () {
    $user = User::factory()->create();
    $solicitation = Solicitation::factory()->for($user)->completed()->create();

    $this->actingAs($user)
        ->delete(route('solicitations.destroy', $solicitation))
        ->assertForbidden();
});

test('users can filter solicitations', function () {
    $user = User::factory()->create();

    Solicitation::factory()->for($user)->open()->create([
        'title' => 'Notebook quebrado',
        'category' => SolicitationCategory::It,
        'created_at' => now()->subDays(2),
    ]);

    Solicitation::factory()->for($user)->completed()->create([
        'title' => 'Pedido de férias',
        'category' => SolicitationCategory::Hr,
        'created_at' => now(),
    ]);

    $this->actingAs($user)
        ->get(route('solicitations.index', [
            'search' => 'Notebook',
            'category' => SolicitationCategory::It->value,
            'status' => SolicitationStatus::Open->value,
            'from' => now()->subDays(3)->toDateString(),
            'to' => now()->toDateString(),
        ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('solicitations.data', 1)
            ->where('solicitations.data.0.title', 'Notebook quebrado'));
});

test('users can view solicitation details', function () {
    $user = User::factory()->create();
    $solicitation = Solicitation::factory()->for($user)->create([
        'title' => 'Detalhe da solicitação',
    ]);

    $this->actingAs($user)
        ->get(route('solicitations.show', $solicitation))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('solicitations/show')
            ->where('solicitation.title', 'Detalhe da solicitação')
            ->where('can.update', true)
            ->where('can.delete', true));
});
