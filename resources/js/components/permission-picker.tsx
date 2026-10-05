import { Label } from '@/components/ui/label';

export type PermissionOption = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
};

export type PermissionGroup = {
    group: string;
    permissions: PermissionOption[];
};

export function PermissionPicker({
    permissionGroups,
    selectedIds = [],
}: {
    permissionGroups: PermissionGroup[];
    selectedIds?: number[];
}) {
    return (
        <div className="space-y-4">
            <Label>Recursos do perfil</Label>
            {permissionGroups.map((group) => (
                <div
                    key={group.group}
                    className="rounded-xl border border-border/70 p-4"
                >
                    <h3 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                        {group.group}
                    </h3>
                    <div className="space-y-2">
                        {group.permissions.map((permission) => (
                            <label
                                key={permission.id}
                                className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-muted/50"
                            >
                                <input
                                    type="checkbox"
                                    name="permission_ids[]"
                                    value={permission.id}
                                    defaultChecked={selectedIds.includes(
                                        permission.id,
                                    )}
                                    className="mt-1 size-4 rounded border"
                                />
                                <span>
                                    <span className="block font-medium">
                                        {permission.name}
                                    </span>
                                    <span className="block font-mono text-[11px] text-muted-foreground">
                                        {permission.slug}
                                    </span>
                                    {permission.description && (
                                        <span className="text-xs text-muted-foreground">
                                            {permission.description}
                                        </span>
                                    )}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
