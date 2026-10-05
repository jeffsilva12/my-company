import { Form, Head, Link } from '@inertiajs/react';
import UserController from '@/actions/App/Http/Controllers/Admin/UserController';
import InputError from '@/components/input-error';
import { PageHeader } from '@/components/page-header';
import { PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { create, index } from '@/routes/admin/users';

type RoleOption = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
};

export default function UsersCreate({ roles }: { roles: RoleOption[] }) {
    return (
        <>
            <Head title="Novo usuário" />
            <PageShell>
                <PageHeader
                    title="Novo usuário"
                    description="Crie a conta e vincule um ou mais perfis."
                />

                <Form
                    {...UserController.store.form()}
                    className="max-w-2xl space-y-6 rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nome</Label>
                                <Input id="name" name="name" required />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                />
                                <InputError message={errors.email} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Senha</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                />
                                <InputError message={errors.password} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirmar senha
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type="password"
                                    required
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
                                    Criar usuário
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

UsersCreate.layout = {
    breadcrumbs: [
        { title: 'Usuários', href: index() },
        { title: 'Novo', href: create() },
    ],
};
