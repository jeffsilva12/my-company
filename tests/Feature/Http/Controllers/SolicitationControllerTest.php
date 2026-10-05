<?php

test('guests cannot access solicitations pages', function () {
    $this->get(route('solicitations.index'))->assertRedirect(route('login'));
});

test('authenticated users can visit solicitations index shell', function () {
    $user = adminUser();

    $this->actingAs($user)
        ->get(route('solicitations.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('solicitations/index'));
});
