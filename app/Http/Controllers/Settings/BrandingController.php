<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateBrandingRequest;
use App\Models\AppSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BrandingController extends Controller
{
    /**
     * Show the branding settings page.
     */
    public function edit(): Response
    {
        $settings = AppSetting::current();

        return Inertia::render('settings/branding', [
            'branding' => [
                ...$settings->toBrandingArray(),
                'icon_path' => $settings->icon_path,
                'favicon_path' => $settings->favicon_path,
                'image_path' => $settings->image_path,
            ],
        ]);
    }

    /**
     * Update branding settings.
     */
    public function update(UpdateBrandingRequest $request): RedirectResponse
    {
        $settings = AppSetting::current();
        $data = [
            'title' => $request->validated('title'),
        ];

        foreach (['icon', 'favicon', 'image'] as $field) {
            $pathAttribute = $field.'_path';
            $removeKey = 'remove_'.$field;

            if ($request->boolean($removeKey)) {
                $this->deleteFile($settings->{$pathAttribute});
                $data[$pathAttribute] = null;
            }

            if ($request->hasFile($field)) {
                /** @var UploadedFile $file */
                $file = $request->file($field);
                $this->deleteFile($settings->{$pathAttribute});
                $data[$pathAttribute] = $file->store('branding', 'public');
            }
        }

        $settings->update($data);
        AppSetting::clearCache();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Identidade visual atualizada com sucesso.',
        ]);

        return to_route('branding.edit');
    }

    private function deleteFile(?string $path): void
    {
        if ($path === null || $path === '') {
            return;
        }

        Storage::disk('public')->delete($path);
    }
}
