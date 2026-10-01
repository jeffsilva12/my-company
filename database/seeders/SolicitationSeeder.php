<?php

namespace Database\Seeders;

use App\Enums\SolicitationCategory;
use App\Enums\SolicitationStatus;
use App\Models\Solicitation;
use App\Models\User;
use Illuminate\Database\Seeder;

class SolicitationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::query()->where('email', 'test@example.com')->first()
            ?? User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);

        foreach (SolicitationCategory::cases() as $category) {
            Solicitation::factory()->open()->create([
                'user_id' => $user->id,
                'category' => $category,
                'title' => 'Solicitação de '.$category->label(),
            ]);
        }

        Solicitation::factory()->inProgress()->create([
            'user_id' => $user->id,
            'category' => SolicitationCategory::It,
            'title' => 'Notebook com defeito',
        ]);

        Solicitation::factory()->completed()->create([
            'user_id' => $user->id,
            'category' => SolicitationCategory::Hr,
            'title' => 'Atualização de dados cadastrais',
            'status' => SolicitationStatus::Completed,
        ]);
    }
}
