<?php

namespace App\Models;

use Database\Factories\AppSettingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property string $title
 * @property string|null $icon_path
 * @property string|null $favicon_path
 * @property string|null $image_path
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['title', 'icon_path', 'favicon_path', 'image_path'])]
class AppSetting extends Model
{
    /** @use HasFactory<AppSettingFactory> */
    use HasFactory;

    public const CACHE_KEY = 'app_settings.current';

    public static function current(): self
    {
        // Evita cache de Model serializado (causa __PHP_Incomplete_Class).
        Cache::forget(self::CACHE_KEY);

        return self::query()->first() ?? self::query()->create([
            'title' => (string) config('app.name', 'My Company'),
        ]);
    }

    public static function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    public function iconUrl(): ?string
    {
        return $this->publicUrl($this->icon_path);
    }

    public function faviconUrl(): ?string
    {
        return $this->publicUrl($this->favicon_path);
    }

    public function imageUrl(): ?string
    {
        return $this->publicUrl($this->image_path);
    }

    /**
     * @return array{
     *     title: string,
     *     icon_url: string|null,
     *     favicon_url: string|null,
     *     image_url: string|null
     * }
     */
    public function toBrandingArray(): array
    {
        return [
            'title' => $this->title,
            'icon_url' => $this->iconUrl(),
            'favicon_url' => $this->faviconUrl(),
            'image_url' => $this->imageUrl(),
        ];
    }

    private function publicUrl(?string $path): ?string
    {
        if ($path === null || $path === '') {
            return null;
        }

        return Storage::disk('public')->url($path);
    }
}
