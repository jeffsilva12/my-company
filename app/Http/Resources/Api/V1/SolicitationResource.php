<?php

namespace App\Http\Resources\Api\V1;

use App\Models\Solicitation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Solicitation
 */
class SolicitationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'title' => $this->title,
            'description' => $this->description,
            'category' => $this->category->value,
            'category_label' => $this->category->label(),
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'requester' => $this->whenLoaded('user', fn () => $this->user->name),
            'user_id' => $this->user_id,
            'is_owner' => $this->user_id === $request->user()?->id,
            'opened_at' => $this->created_at?->timezone(config('app.timezone'))->format('d/m/Y H:i'),
            'can' => [
                'update' => $request->user()?->can('update', $this->resource) ?? false,
                'delete' => $request->user()?->can('delete', $this->resource) ?? false,
                'update_status' => $request->user()?->can('updateStatus', $this->resource) ?? false,
            ],
        ];
    }
}
