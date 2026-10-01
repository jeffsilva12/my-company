<?php

namespace App\Models;

use App\Enums\SolicitationCategory;
use App\Enums\SolicitationStatus;
use Database\Factories\SolicitationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string|null $code
 * @property string $title
 * @property string $description
 * @property SolicitationCategory $category
 * @property SolicitationStatus $status
 * @property int $user_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $user
 */
#[Fillable(['title', 'description', 'category', 'status', 'user_id', 'code'])]
class Solicitation extends Model
{
    /** @use HasFactory<SolicitationFactory> */
    use HasFactory;

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'status' => SolicitationStatus::Open->value,
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'category' => SolicitationCategory::class,
            'status' => SolicitationStatus::class,
        ];
    }

    protected static function booted(): void
    {
        static::created(function (Solicitation $solicitation): void {
            $solicitation->updateQuietly([
                'code' => sprintf('SOL-%05d', $solicitation->id),
            ]);
        });
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isOpen(): bool
    {
        return $this->status === SolicitationStatus::Open;
    }

    /**
     * @param  Builder<Solicitation>  $query
     * @return Builder<Solicitation>
     */
    #[Scope]
    protected function filter(Builder $query, array $filters): Builder
    {
        return $query
            ->when($filters['search'] ?? null, function (Builder $query, string $search): void {
                $query->where('title', 'like', '%'.$search.'%');
            })
            ->when($filters['category'] ?? null, function (Builder $query, string $category): void {
                $query->where('category', $category);
            })
            ->when($filters['status'] ?? null, function (Builder $query, string $status): void {
                $query->where('status', $status);
            })
            ->when($filters['from'] ?? null, function (Builder $query, string $from): void {
                $query->whereDate('created_at', '>=', $from);
            })
            ->when($filters['to'] ?? null, function (Builder $query, string $to): void {
                $query->whereDate('created_at', '<=', $to);
            });
    }
}
