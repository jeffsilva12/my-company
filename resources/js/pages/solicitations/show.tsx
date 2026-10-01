import { Form, Head, Link, router, setLayoutProps } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import SolicitationController from '@/actions/App/Http/Controllers/SolicitationController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { SolicitationStatusBadge } from '@/components/solicitation-status-badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { edit, index, show } from '@/routes/solicitations';
import type { SolicitationDetail, SolicitationOption } from '@/types';

export default function SolicitationsShow({
    solicitation,
    statuses,
    can,
}: {
    solicitation: SolicitationDetail;
    statuses: SolicitationOption[];
    can: {
        update: boolean;
        delete: boolean;
        updateStatus: boolean;
    };
}) {
    setLayoutProps({
        breadcrumbs: [
            {
                title: 'Solicitações',
                href: index(),
            },
            {
                title: solicitation.code ?? 'Detalhes',
                href: show(solicitation.id),
            },
        ],
    });

    function destroySolicitation() {
        if (
            !confirm(
                'Tem certeza que deseja excluir esta solicitação? Esta ação não pode ser desfeita.',
            )
        ) {
            return;
        }

        router.delete(SolicitationController.destroy.url(solicitation.id));
    }

    return (
        <>
            <Head title={solicitation.code ?? 'Solicitação'} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <Heading title={solicitation.title} />
                            <SolicitationStatusBadge
                                status={solicitation.status}
                                label={solicitation.status_label}
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Código{' '}
                            <span className="font-mono">
                                {solicitation.code}
                            </span>
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {can.update && (
                            <Button variant="outline" asChild>
                                <Link href={edit(solicitation.id)}>
                                    <Pencil className="size-4" />
                                    Editar
                                </Link>
                            </Button>
                        )}
                        {can.delete && (
                            <Button
                                variant="destructive"
                                type="button"
                                onClick={destroySolicitation}
                            >
                                <Trash2 className="size-4" />
                                Excluir
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-4 rounded-xl border p-6 lg:col-span-2">
                        <h3 className="font-medium">Descrição</h3>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                            {solicitation.description}
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-4 rounded-xl border p-6">
                            <h3 className="font-medium">Informações</h3>
                            <dl className="space-y-3 text-sm">
                                <div>
                                    <dt className="text-muted-foreground">
                                        Categoria
                                    </dt>
                                    <dd className="font-medium">
                                        {solicitation.category_label}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">
                                        Solicitante
                                    </dt>
                                    <dd className="font-medium">
                                        {solicitation.requester}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">
                                        Data de abertura
                                    </dt>
                                    <dd className="font-medium">
                                        {solicitation.opened_at}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {can.updateStatus && (
                            <Form
                                {...SolicitationController.updateStatus.form(
                                    solicitation.id,
                                )}
                                options={{ preserveScroll: true }}
                                className="space-y-4 rounded-xl border p-6"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <h3 className="font-medium">
                                            Alterar status
                                        </h3>
                                        <div className="grid gap-2">
                                            <Label htmlFor="status">
                                                Status
                                            </Label>
                                            <select
                                                id="status"
                                                name="status"
                                                defaultValue={
                                                    solicitation.status
                                                }
                                                className="border-input bg-transparent h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                            >
                                                {statuses.map((status) => (
                                                    <option
                                                        key={status.value}
                                                        value={status.value}
                                                    >
                                                        {status.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError
                                                message={errors.status}
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full"
                                        >
                                            Atualizar status
                                        </Button>
                                    </>
                                )}
                            </Form>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
