<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail, PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * @return HasMany<Solicitation, $this>
     */
    public function solicitations(): HasMany
    {
        return $this->hasMany(Solicitation::class);
    }

    /**
     * @return BelongsToMany<Role, $this>
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class)->withTimestamps();
    }

    public function hasRole(string $role): bool
    {
        return $this->roles->contains(fn (Role $item): bool => $item->slug === $role || $item->name === $role);
    }

    public function hasPermission(string $permission): bool
    {
        return $this->permissionSlugs()->contains($permission);
    }

    public function hasAnyPermission(string ...$permissions): bool
    {
        $slugs = $this->permissionSlugs();

        foreach ($permissions as $permission) {
            if ($slugs->contains($permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return Collection<int, string>
     */
    public function permissionSlugs(): Collection
    {
        if ($this->relationLoaded('roles')) {
            return $this->roles
                ->flatMap(fn (Role $role) => $role->relationLoaded('permissions')
                    ? $role->permissions
                    : $role->permissions()->get())
                ->pluck('slug')
                ->unique()
                ->values();
        }

        return Permission::query()
            ->whereHas('roles.users', fn ($query) => $query->whereKey($this->id))
            ->pluck('slug');
    }

    public function assignRole(Role|string $role): void
    {
        $roleModel = $role instanceof Role
            ? $role
            : Role::query()->where('slug', $role)->firstOrFail();

        $this->roles()->syncWithoutDetaching([$roleModel->id]);
        $this->unsetRelation('roles');
    }
}
