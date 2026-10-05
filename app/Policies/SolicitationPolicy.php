<?php

namespace App\Policies;

use App\Models\Solicitation;
use App\Models\User;

class SolicitationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('solicitations.view');
    }

    public function view(User $user, Solicitation $solicitation): bool
    {
        return $user->hasPermission('solicitations.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('solicitations.create');
    }

    public function update(User $user, Solicitation $solicitation): bool
    {
        return $user->hasPermission('solicitations.update')
            && $solicitation->isOpen()
            && $solicitation->user_id === $user->id;
    }

    public function delete(User $user, Solicitation $solicitation): bool
    {
        return $user->hasPermission('solicitations.delete')
            && $solicitation->isOpen()
            && $solicitation->user_id === $user->id;
    }

    public function updateStatus(User $user, Solicitation $solicitation): bool
    {
        return $user->hasPermission('solicitations.update_status');
    }
}
