<?php

namespace App\Policies;

use App\Models\Solicitation;
use App\Models\User;

class SolicitationPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Solicitation $solicitation): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Solicitation $solicitation): bool
    {
        return $solicitation->isOpen() && $solicitation->user_id === $user->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Solicitation $solicitation): bool
    {
        return $solicitation->isOpen() && $solicitation->user_id === $user->id;
    }

    /**
     * Determine whether the user can update the status.
     */
    public function updateStatus(User $user, Solicitation $solicitation): bool
    {
        return true;
    }
}
