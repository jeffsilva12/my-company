<?php

use App\Models\Solicitation;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('dashboard shows solicitation indicators', function () {
    $user = User::factory()->create();

    Solicitation::factory()->for($user)->open()->count(2)->create();
    Solicitation::factory()->for($user)->inProgress()->create();
    Solicitation::factory()->for($user)->completed()->count(3)->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('stats.total', 6)
            ->where('stats.open', 2)
            ->where('stats.in_progress', 1)
            ->where('stats.completed', 3));
});

test('dashboard counts start at zero', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('stats.total', 0)
            ->where('stats.open', 0)
            ->where('stats.in_progress', 0)
            ->where('stats.completed', 0));
});
