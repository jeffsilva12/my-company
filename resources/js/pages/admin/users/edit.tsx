import { Form, Head, Link, setLayoutProps } from '@inertiajs/react';
import UserController from '@/actions/App/Http/Controllers/Admin/UserController';
import InputError from '@/components/input-error';
import { PageHeader } from '@/components/page-header';
import { PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit, index } from '@/routes/admin/users';

type RoleOption = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
};

type EditableUser = {
    id: number;
    name: string;
    email: string;
    role_ids: number[];
};

export default function UsersEdit({
    user,
    roles,
}: {
    user: EditableUser;
    roles: RoleOption[];
}) {
    setLayoutProps({
        breadcrumbs: [
            { title: 'Usuários', href: index() },
            { title: user.name, href: edit(user.id) },
        ],
    });

    return (
        <>
            <Head title={`Editar ${user.name}`} />
            <PageShell>
                <PageHeader
                    title={`Editar ${user.name}`}
                    description="Atualize dados e vínculos de perfis."
                />

                <Form
                    {...UserController.update.form(user.id)}
                    className="max-w-2xl space-y-6 rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nome</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    defaultValue={user.name}
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    defaultValue={user.email}
                                />
                                <InputError message={errors.email} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">
                                    Nova senha (opcional)
                                </Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                />
                                <InputError message={errors.password} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirmar nova senha
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type="password"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label>Perfis</Label>
                                <div className="space-y-2 rounded-xl border p-4">
                                    {roles.map((role) => (
                                        <label
                                            key={role.id}
                                            className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-muted/50"
                                        >
                                            <input
                                                type="checkbox"
                                                name="role_ids[]"
                                                value={role.id}
                                                defaultChecked={user.role_ids.includes(
                                                    role.id,
                                                )}
                                                className="mt-1 size-4 rounded border"
                                            />
                                            <span>
                                                <span className="block font-medium">
                                                    {role.name}
                                                </span>
                                                {role.description && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {role.description}
                                                    </span>
                                                )}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                <InputError message={errors.role_ids} />
                            </div>

                            <div className="flex gap-2 border-t pt-4">
                                <Button type="submit" disabled={processing}>
                                    Salvar
                                </Button>
                                <Button variant="ghost" asChild>
                                    <Link href={index()}>Cancelar</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </PageShell>
        </>
    );
}
