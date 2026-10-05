import { Form, Head, Link } from '@inertiajs/react';
import RoleController from '@/actions/App/Http/Controllers/Admin/RoleController';
import InputError from '@/components/input-error';
import { PageHeader } from '@/components/page-header';
import { PageShell } from '@/components/page-shell';
import {
    PermissionPicker,
    type PermissionGroup,
} from '@/components/permission-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { create, index } from '@/routes/admin/roles';

export default function RolesCreate({
    permissionGroups,
}: {
    permissionGroups: PermissionGroup[];
}) {
    return (
        <>
            <Head title="Novo perfil" />
            <PageShell>
                <PageHeader
                    title="Novo perfil"
                    description="Crie um perfil e selecione os recursos liberados."
                />

                <Form
                    {...RoleController.store.form()}
                    className="max-w-3xl space-y-6 rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nome</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    placeholder="Ex: Financeiro"
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug (opcional)</Label>
                                <Input
                                    id="slug"
                                    name="slug"
                                    placeholder="financeiro"
                                />
                                <InputError message={errors.slug} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Descrição</Label>
                                <Input
                                    id="description"
                                    name="description"
                                    placeholder="O que este perfil pode fazer"
                                />
                                <InputError message={errors.description} />
                            </div>

                            <PermissionPicker
                                permissionGroups={permissionGroups}
                            />
                            <InputError message={errors.permission_ids} />

                            <div className="flex gap-2 border-t pt-4">
                                <Button type="submit" disabled={processing}>
                                    Criar perfil
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

RolesCreate.layout = {
    breadcrumbs: [
        { title: 'Perfis', href: index() },
        { title: 'Novo', href: create() },
    ],
};
