import { Form, Head, Link, setLayoutProps } from '@inertiajs/react';
import RoleController from '@/actions/App/Http/Controllers/Admin/RoleController';
import InputError from '@/components/input-error';
import { PageHeader } from '@/components/page-header';
import { PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    PermissionPicker,
    type PermissionGroup,
} from '@/components/permission-picker';
import { edit, index } from '@/routes/admin/roles';

type EditableRole = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    permission_ids: number[];
};

export default function RolesEdit({
    role,
    permissionGroups,
}: {
    role: EditableRole;
    permissionGroups: PermissionGroup[];
}) {
    setLayoutProps({
        breadcrumbs: [
            { title: 'Perfis', href: index() },
            { title: role.name, href: edit(role.id) },
        ],
    });

    return (
        <>
            <Head title={`Editar ${role.name}`} />
            <PageShell>
                <PageHeader
                    title={`Editar ${role.name}`}
                    description="Atualize o perfil e os recursos liberados."
                />

                <Form
                    {...RoleController.update.form(role.id)}
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
                                    defaultValue={role.name}
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    name="slug"
                                    required
                                    defaultValue={role.slug}
                                />
                                <InputError message={errors.slug} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Descrição</Label>
                                <Input
                                    id="description"
                                    name="description"
                                    defaultValue={role.description ?? ''}
                                />
                                <InputError message={errors.description} />
                            </div>

                            <PermissionPicker
                                permissionGroups={permissionGroups}
                                selectedIds={role.permission_ids}
                            />
                            <InputError message={errors.permission_ids} />

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
