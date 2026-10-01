<?php

namespace Database\Factories;

use App\Enums\SolicitationCategory;
use App\Enums\SolicitationStatus;
use App\Models\Solicitation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Solicitation>
 */
class SolicitationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'category' => fake()->randomElement(SolicitationCategory::cases()),
            'status' => SolicitationStatus::Open,
            'user_id' => User::factory(),
        ];
    }

    public function open(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => SolicitationStatus::Open,
        ]);
    }

    public function inProgress(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => SolicitationStatus::InProgress,
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => SolicitationStatus::Completed,
        ]);
    }
}
