<?php

use App\Models\AppSetting;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
    AppSetting::clearCache();
});

test('guests cannot visit branding settings', function () {
    $this->get(route('branding.edit'))->assertRedirect(route('login'));
});

test('authenticated users can visit branding settings', function () {
    $user = adminUser();

    $this->actingAs($user)
        ->get(route('branding.edit'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('settings/branding')
            ->has('branding.title'));
});

test('authenticated users can update branding title and assets', function () {
    $user = adminUser();

    $response = $this->actingAs($user)->post(route('branding.update'), [
        'title' => 'Empresa Demo',
        'icon' => UploadedFile::fake()->image('icon.png', 64, 64),
        'favicon' => UploadedFile::fake()->image('favicon.png', 32, 32),
        'image' => UploadedFile::fake()->image('cover.jpg', 1200, 800),
    ]);

    $response->assertRedirect(route('branding.edit'));

    $settings = AppSetting::query()->first();

    expect($settings)->not->toBeNull()
        ->and($settings->title)->toBe('Empresa Demo')
        ->and($settings->icon_path)->not->toBeNull()
        ->and($settings->favicon_path)->not->toBeNull()
        ->and($settings->image_path)->not->toBeNull();

    Storage::disk('public')->assertExists($settings->icon_path);
    Storage::disk('public')->assertExists($settings->favicon_path);
    Storage::disk('public')->assertExists($settings->image_path);
});

test('branding title is required', function () {
    $user = adminUser();

    $this->actingAs($user)
        ->post(route('branding.update'), [
            'title' => '',
        ])
        ->assertSessionHasErrors(['title']);
});

test('branding assets can be removed', function () {
    $user = adminUser();
    $settings = AppSetting::current();
    $path = UploadedFile::fake()->image('icon.png')->store('branding', 'public');
    $settings->update(['icon_path' => $path]);
    AppSetting::clearCache();

    $this->actingAs($user)
        ->post(route('branding.update'), [
            'title' => 'Empresa Demo',
            'remove_icon' => '1',
        ])
        ->assertRedirect(route('branding.edit'));

    expect(AppSetting::current()->fresh()->icon_path)->toBeNull();
    Storage::disk('public')->assertMissing($path);
});

test('shared inertia props include branding title', function () {
    $user = adminUser();
    AppSetting::current()->update(['title' => 'Marca Compartilhada']);
    AppSetting::clearCache();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('name', 'Marca Compartilhada')
            ->where('branding.title', 'Marca Compartilhada'));
});
