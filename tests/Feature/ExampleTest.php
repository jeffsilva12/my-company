<?php

test('home redirects guests to the login page', function () {
    $this->get(route('home'))
        ->assertRedirect('/dashboard');

    $this->get('/dashboard')
        ->assertRedirect(route('login'));
});
