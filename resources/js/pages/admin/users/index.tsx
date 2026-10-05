import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import { destroy, edit, index, create } from '@/routes/admin/users';

type RoleSummary = {
    id: number;
    name: string;
    slug: string;
};

type UserRow = {
    id: number;
    name: string;
    email: string;
    roles: RoleSummary[];
    created_at: string | null;
};

type PaginatedUsers = {
    data: UserRow[];
    current_page: number;
    last_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

export default function UsersIndex({ users }: { users: PaginatedUsers }) {
    function deleteUser(user: UserRow) {
        if (!confirm(`Excluir o usuário ${user.name}?`)) {
            return;
        }

        router.delete(destroy.url(user.id));
    }

    return (
        <>
            <Head title="Usuários" />
            <PageShell>
                <PageHeader
                    title="Usuários"
                    description="Gerencie contas e vincule perfis de acesso."
                    actions={
                        <Button asChild>
                            <Link href={create()}>
                                <Plus className="size-4" />
                                Novo usuário
                            </Link>
                        </Button>
                    }
                />

                <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-sm">
                    <table className="w-full min-w-[720px] text-left text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="px-5 py-3.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    Usuário
                                </th>
                                <th className="px-5 py-3.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    Perfis
                                </th>
                                <th className="px-5 py-3.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    Criado em
                                </th>
                                <th className="px-5 py-3.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-5 py-14 text-center text-muted-foreground"
                                    >
                                        <Users className="mx-auto mb-2 size-8 opacity-50" />
                                        Nenhum usuário cadastrado.
                                    </td>
                                </tr>
                            ) : (
                                users.data.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-b last:border-0 hover:bg-muted/40"
                                    >
                                        <td className="px-5 py-4">
                                            <p className="font-medium">
                                                {user.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {user.email}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-wrap gap-1.5">
                                                {user.roles.length === 0 ? (
                                                    <span className="text-xs text-muted-foreground">
                                                        Sem perfil
                                                    </span>
                                                ) : (
                                                    user.roles.map((role) => (
                                                        <span
                                                            key={role.id}
                                                            className="rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-800 dark:bg-sky-950 dark:text-sky-200"
                                                        >
                                                            {role.name}
                                                        </span>
                                                    ))
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-muted-foreground">
                                            {user.created_at}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link href={edit(user.id)}>
                                                        <Pencil className="size-3.5" />
                                                        Editar
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        deleteUser(user)
                                                    }
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </PageShell>
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: [{ title: 'Usuários', href: index() }],
};
