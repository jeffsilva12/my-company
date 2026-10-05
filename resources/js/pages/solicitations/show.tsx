import { Head, Link, router, setLayoutProps } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { PageHeader } from '@/components/page-header';
import { PageShell } from '@/components/page-shell';
import { SolicitationStatusBadge } from '@/components/solicitation-status-badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/lib/api';
import { solicitationApi } from '@/lib/solicitation-api';
import { edit, index, show } from '@/routes/solicitations';
import type { SolicitationDetail, SolicitationOption } from '@/types';

const selectClassName =
    'border-input bg-background/80 h-10 w-full rounded-lg border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';

export default function SolicitationsShow({
    solicitationId,
}: {
    solicitationId: number;
}) {
    const [solicitation, setSolicitation] = useState<SolicitationDetail | null>(
        null,
    );
    const [statuses, setStatuses] = useState<SolicitationOption[]>([]);
    const [status, setStatus] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    async function load() {
        setLoading(true);

        try {
            const [item, meta] = await Promise.all([
                solicitationApi.show(solicitationId),
                solicitationApi.meta(),
            ]);

            setSolicitation(item);
            setStatus(item.status);
            setStatuses(meta.statuses);
        } catch (err) {
            toast.error(
                err instanceof ApiError
                    ? err.message
                    : 'Erro ao carregar solicitação.',
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void load();
    }, [solicitationId]);

    setLayoutProps({
        breadcrumbs: [
            {
                title: 'Solicitações',
                href: index(),
            },
            {
                title: solicitation?.code ?? 'Detalhes',
                href: show(solicitationId),
            },
        ],
    });

    async function destroySolicitation() {
        if (
            !confirm(
                'Tem certeza que deseja excluir esta solicitação? Esta ação não pode ser desfeita.',
            )
        ) {
            return;
        }

        try {
            await solicitationApi.destroy(solicitationId);
            toast.success('Solicitação excluída com sucesso.');
            router.visit(index.url());
        } catch (err) {
            toast.error(
                err instanceof ApiError
                    ? err.message
                    : 'Erro ao excluir solicitação.',
            );
        }
    }

    async function handleStatusSubmit(event: React.FormEvent) {
        event.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            const updated = await solicitationApi.updateStatus(
                solicitationId,
                status,
            );
            setSolicitation(updated);
            setStatus(updated.status);
            toast.success('Status atualizado com sucesso.');
        } catch (err) {
            if (err instanceof ApiError && err.status === 422) {
                setErrors({
                    status: err.errors.status?.[0] ?? 'Status inválido.',
                });
            } else {
                toast.error(
                    err instanceof ApiError
                        ? err.message
                        : 'Erro ao atualizar status.',
                );
            }
        } finally {
            setProcessing(false);
        }
    }

    if (loading || !solicitation) {
        return (
            <>
                <Head title="Solicitação" />
                <PageShell>
                    <div className="space-y-4">
                        <div className="h-8 w-64 animate-pulse rounded-lg bg-muted" />
                        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
                    </div>
                </PageShell>
            </>
        );
    }

    return (
        <>
            <Head title={solicitation.code ?? 'Solicitação'} />

            <PageShell>
                <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur-sm sm:flex-row sm:items-start sm:justify-between md:p-6">
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded-md bg-muted px-2.5 py-1 font-mono text-xs">
                                {solicitation.code}
                            </span>
                            <SolicitationStatusBadge
                                status={solicitation.status}
                                label={solicitation.status_label}
                            />
                        </div>
                        <PageHeader
                            title={solicitation.title}
                            description={`Aberta em ${solicitation.opened_at} por ${solicitation.requester}`}
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {solicitation.can.update && (
                            <Button variant="outline" asChild>
                                <Link href={edit(solicitation.id)}>
                                    <Pencil className="size-4" />
                                    Editar
                                </Link>
                            </Button>
                        )}
                        {solicitation.can.delete && (
                            <Button
                                variant="destructive"
                                type="button"
                                onClick={() => void destroySolicitation()}
                            >
                                <Trash2 className="size-4" />
                                Excluir
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-4 rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur-sm lg:col-span-2">
                        <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                            Descrição
                        </h3>
                        <p className="whitespace-pre-wrap text-sm leading-7 text-foreground/90 md:text-[15px]">
                            {solicitation.description}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-4 rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur-sm">
                            <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                                Informações
                            </h3>
                            <dl className="space-y-4 text-sm">
                                <div className="rounded-xl bg-muted/50 px-3 py-2.5">
                                    <dt className="text-xs text-muted-foreground">
                                        Categoria
                                    </dt>
                                    <dd className="mt-0.5 font-medium">
                                        {solicitation.category_label}
                                    </dd>
                                </div>
                                <div className="rounded-xl bg-muted/50 px-3 py-2.5">
                                    <dt className="text-xs text-muted-foreground">
                                        Solicitante
                                    </dt>
                                    <dd className="mt-0.5 font-medium">
                                        {solicitation.requester}
                                    </dd>
                                </div>
                                <div className="rounded-xl bg-muted/50 px-3 py-2.5">
                                    <dt className="text-xs text-muted-foreground">
                                        Data de abertura
                                    </dt>
                                    <dd className="mt-0.5 font-medium">
                                        {solicitation.opened_at}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {solicitation.can.update_status && (
                            <form
                                onSubmit={handleStatusSubmit}
                                className="space-y-4 rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur-sm"
                            >
                                <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                                    Alterar status
                                </h3>
                                <div className="grid gap-2">
                                    <Label htmlFor="status">Status</Label>
                                    <select
                                        id="status"
                                        value={status}
                                        onChange={(event) =>
                                            setStatus(event.target.value)
                                        }
                                        className={selectClassName}
                                    >
                                        {statuses.map((item) => (
                                            <option
                                                key={item.value}
                                                value={item.value}
                                            >
                                                {item.label}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.status} />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full"
                                >
                                    Atualizar status
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </PageShell>
        </>
    );
}
