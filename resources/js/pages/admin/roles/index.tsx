import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Shield, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import { create, destroy, edit, index } from '@/routes/admin/roles';

type PermissionSummary = {
    id: number;
    name: string;
    slug: string;
    group: string;
};

type RoleRow = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    permissions_count: number;
    users_count: number;
    permissions: PermissionSummary[];
};

export default function RolesIndex({ roles }: { roles: RoleRow[] }) {
    function deleteRole(role: RoleRow) {
        if (!confirm(`Excluir o perfil ${role.name}?`)) {
            return;
        }

        router.delete(destroy.url(role.id));
    }

    return (
        <>
            <Head title="Perfis" />
            <PageShell>
                <PageHeader
                    title="Perfis e recursos"
                    description="Defina perfis e selecione os recursos que cada um pode acessar."
                    actions={
                        <Button asChild>
                            <Link href={create()}>
                                <Plus className="size-4" />
                                Novo perfil
                            </Link>
                        </Button>
                    }
                />

                <div className="grid gap-4">
                    {roles.length === 0 ? (
                        <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
                            <Shield className="mx-auto mb-2 size-8 opacity-50" />
                            Nenhum perfil cadastrado.
                        </div>
                    ) : (
                        roles.map((role) => (
                            <div
                                key={role.id}
                                className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm"
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="text-lg font-semibold">
                                                {role.name}
                                            </h2>
                                            <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs">
                                                {role.slug}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {role.description ||
                                                'Sem descrição'}
                                        </p>
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            {role.permissions_count} recurso
                                            {role.permissions_count === 1
                                                ? ''
                                                : 's'}{' '}
                                            · {role.users_count} usuário
                                            {role.users_count === 1 ? '' : 's'}
                                        </p>
                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                            {role.permissions
                                                .slice(0, 8)
                                                .map((permission) => (
                                                    <span
                                                        key={permission.id}
                                                        className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                                                    >
                                                        {permission.name}
                                                    </span>
                                                ))}
                                            {role.permissions.length > 8 && (
                                                <span className="text-xs text-muted-foreground">
                                                    +
                                                    {role.permissions.length -
                                                        8}{' '}
                                                    mais
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={edit(role.id)}>
                                                <Pencil className="size-3.5" />
                                                Editar
                                            </Link>
                                        </Button>
                                        {role.slug !== 'admin' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    deleteRole(role)
                                                }
                                            >
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </PageShell>
        </>
    );
}

RolesIndex.layout = {
    breadcrumbs: [{ title: 'Perfis', href: index() }],
};
