<?php

use App\Models\Solicitation;

test('guests cannot access dashboard stats api', function () {
    $this->getJson('/api/v1/dashboard/stats')->assertUnauthorized();
});

test('dashboard stats api returns indicators', function () {
    $user = adminUser();

    Solicitation::factory()->for($user)->open()->count(2)->create();
    Solicitation::factory()->for($user)->inProgress()->create();
    Solicitation::factory()->for($user)->completed()->count(3)->create();

    $this->actingAs($user)
        ->getJson('/api/v1/dashboard/stats')
        ->assertOk()
        ->assertJsonPath('data.total', 6)
        ->assertJsonPath('data.open', 2)
        ->assertJsonPath('data.in_progress', 1)
        ->assertJsonPath('data.completed', 3);
});

test('dashboard page shell renders without server stats', function () {
    $user = adminUser();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->missing('stats'));
});
