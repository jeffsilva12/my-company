<?php

namespace App\Enums;

enum SolicitationCategory: string
{
    case It = 'it';
    case Hr = 'hr';
    case Purchasing = 'purchasing';
    case Finance = 'finance';
    case Infrastructure = 'infrastructure';

    public function label(): string
    {
        return match ($this) {
            self::It => 'TI',
            self::Hr => 'RH',
            self::Purchasing => 'Compras',
            self::Finance => 'Financeiro',
            self::Infrastructure => 'Infraestrutura',
        };
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $category): array => [
                'value' => $category->value,
                'label' => $category->label(),
            ],
            self::cases(),
        );
    }
}
