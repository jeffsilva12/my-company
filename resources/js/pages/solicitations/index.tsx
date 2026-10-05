import { Head, Link } from '@inertiajs/react';
import { Filter, Plus, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { PageShell } from '@/components/page-shell';
import { SolicitationStatusBadge } from '@/components/solicitation-status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/lib/api';
import { solicitationApi } from '@/lib/solicitation-api';
import { create, index, show } from '@/routes/solicitations';
import type {
    PaginatedSolicitations,
    SolicitationFilters,
    SolicitationOption,
} from '@/types';

const emptyFilters: SolicitationFilters = {
    search: '',
    category: '',
    status: '',
    from: '',
    to: '',
};

const selectClassName =
    'border-input bg-background/80 h-10 w-full rounded-lg border px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';

export default function SolicitationsIndex() {
    const [solicitations, setSolicitations] =
        useState<PaginatedSolicitations | null>(null);
    const [filters, setFilters] = useState<SolicitationFilters>(emptyFilters);
    const [draftFilters, setDraftFilters] =
        useState<SolicitationFilters>(emptyFilters);
    const [categories, setCategories] = useState<SolicitationOption[]>([]);
    const [statuses, setStatuses] = useState<SolicitationOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function load(
        nextFilters: Partial<SolicitationFilters> & {
            page?: string | number;
        } = filters,
    ) {
        setLoading(true);
        setError(null);

        try {
            const response = await solicitationApi.list(nextFilters);
            setSolicitations(response.solicitations);
            setFilters(response.filters);
            setDraftFilters(response.filters);
            setCategories(response.categories);
            setStatuses(response.statuses);
        } catch (err) {
            setError(
                err instanceof ApiError
                    ? err.message
                    : 'Erro ao carregar solicitações.',
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void load(emptyFilters);
    }, []);

    async function handleFilterSubmit(event: React.FormEvent) {
        event.preventDefault();
        await load(draftFilters);
    }

    async function handlePageClick(url: string | null) {
        if (!url) {
            return;
        }

        const params = Object.fromEntries(
            new URL(url, window.location.origin).searchParams.entries(),
        );

        await load({
            ...filters,
            ...params,
        });
    }

    const hasActiveFilters = Object.values(filters).some(Boolean);

    return (
        <>
            <Head title="Solicitações" />

            <PageShell>
                <PageHeader
                    title="Solicitações"
                    description="Consulte, filtre e acompanhe todas as demandas internas da empresa."
                    actions={
                        <Button asChild size="lg" className="shadow-sm">
                            <Link href={create()}>
                                <Plus className="size-4" />
                                Nova solicitação
                            </Link>
                        </Button>
                    }
                />

                <form
                    onSubmit={handleFilterSubmit}
                    className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur-sm md:p-5"
                >
                    <div className="mb-4 flex items-center gap-2 text-sm font-medium">
                        <Filter className="size-4 text-muted-foreground" />
                        Filtros
                        {hasActiveFilters && (
                            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-800 dark:bg-sky-950 dark:text-sky-200">
                                ativos
                            </span>
                        )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                        <div className="grid gap-2 xl:col-span-2">
                            <Label htmlFor="search">Buscar título</Label>
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="search"
                                    value={draftFilters.search}
                                    onChange={(event) =>
                                        setDraftFilters((current) => ({
                                            ...current,
                                            search: event.target.value,
                                        }))
                                    }
                                    placeholder="Digite parte do título..."
                                    className="h-10 rounded-lg pl-9"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="category">Categoria</Label>
                            <select
                                id="category"
                                value={draftFilters.category}
                                onChange={(event) =>
                                    setDraftFilters((current) => ({
                                        ...current,
                                        category: event.target.value,
                                    }))
                                }
                                className={selectClassName}
                            >
                                <option value="">Todas</option>
                                {categories.map((category) => (
                                    <option
                                        key={category.value}
                                        value={category.value}
                                    >
                                        {category.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <select
                                id="status"
                                value={draftFilters.status}
                                onChange={(event) =>
                                    setDraftFilters((current) => ({
                                        ...current,
                                        status: event.target.value,
                                    }))
                                }
                                className={selectClassName}
                            >
                                <option value="">Todos</option>
                                {statuses.map((status) => (
                                    <option
                                        key={status.value}
                                        value={status.value}
                                    >
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="from">De</Label>
                            <Input
                                id="from"
                                type="date"
                                value={draftFilters.from}
                                onChange={(event) =>
                                    setDraftFilters((current) => ({
                                        ...current,
                                        from: event.target.value,
                                    }))
                                }
                                className="h-10 rounded-lg"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="to">Até</Label>
                            <Input
                                id="to"
                                type="date"
                                value={draftFilters.to}
                                onChange={(event) =>
                                    setDraftFilters((current) => ({
                                        ...current,
                                        to: event.target.value,
                                    }))
                                }
                                className="h-10 rounded-lg"
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Button type="submit" disabled={loading}>
                            Aplicar filtros
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            disabled={loading}
                            onClick={() => {
                                setDraftFilters(emptyFilters);
                                void load(emptyFilters);
                            }}
                        >
                            <X className="size-4" />
                            Limpar
                        </Button>
                        {solicitations && (
                            <span className="ml-auto text-sm text-muted-foreground">
                                {solicitations.total} resultado
                                {solicitations.total === 1 ? '' : 's'}
                            </span>
                        )}
                    </div>
                </form>

                {error && (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-sm backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="px-5 py-3.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        Código
                                    </th>
                                    <th className="px-5 py-3.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        Título
                                    </th>
                                    <th className="px-5 py-3.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        Categoria
                                    </th>
                                    <th className="px-5 py-3.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        Solicitante
                                    </th>
                                    <th className="px-5 py-3.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        Abertura
                                    </th>
                                    <th className="px-5 py-3.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && !solicitations ? (
                                    Array.from({ length: 5 }).map((_, row) => (
                                        <tr
                                            key={row}
                                            className="border-b last:border-0"
                                        >
                                            {Array.from({ length: 6 }).map(
                                                (__, col) => (
                                                    <td
                                                        key={col}
                                                        className="px-5 py-4"
                                                    >
                                                        <div className="h-4 w-full max-w-28 animate-pulse rounded bg-muted" />
                                                    </td>
                                                ),
                                            )}
                                        </tr>
                                    ))
                                ) : solicitations?.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-5 py-16 text-center"
                                        >
                                            <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                                                <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
                                                    <Search className="size-5 text-muted-foreground" />
                                                </div>
                                                <p className="font-medium">
                                                    Nenhuma solicitação
                                                    encontrada
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Ajuste os filtros ou crie
                                                    uma nova solicitação.
                                                </p>
                                                <Button asChild className="mt-1">
                                                    <Link href={create()}>
                                                        <Plus className="size-4" />
                                                        Nova solicitação
                                                    </Link>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    solicitations?.data.map((solicitation) => (
                                        <tr
                                            key={solicitation.id}
                                            className="border-b transition-colors last:border-0 hover:bg-muted/40"
                                        >
                                            <td className="px-5 py-4 font-mono text-xs">
                                                <Link
                                                    href={show(solicitation.id)}
                                                    className="rounded-md bg-muted px-2 py-1 text-foreground transition-colors hover:bg-sky-100 hover:text-sky-900 dark:hover:bg-sky-950 dark:hover:text-sky-100"
                                                >
                                                    {solicitation.code}
                                                </Link>
                                            </td>
                                            <td className="px-5 py-4">
                                                <Link
                                                    href={show(solicitation.id)}
                                                    className="font-medium transition-colors hover:text-sky-700 dark:hover:text-sky-300"
                                                >
                                                    {solicitation.title}
                                                </Link>
                                            </td>
                                            <td className="px-5 py-4 text-muted-foreground">
                                                {solicitation.category_label}
                                            </td>
                                            <td className="px-5 py-4">
                                                {solicitation.requester}
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap text-muted-foreground">
                                                {solicitation.opened_at}
                                            </td>
                                            <td className="px-5 py-4">
                                                <SolicitationStatusBadge
                                                    status={solicitation.status}
                                                    label={
                                                        solicitation.status_label
                                                    }
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {solicitations && solicitations.last_page > 1 && (
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
                        {solicitations.links.map((link, linkIndex) => (
                            <Button
                                key={`${link.label}-${linkIndex}`}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                className="min-w-9 rounded-lg"
                                disabled={!link.url || loading}
                                onClick={() => void handlePageClick(link.url)}
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                            />
                        ))}
                    </div>
                )}
            </PageShell>
        </>
    );
}

SolicitationsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Solicitações',
            href: index(),
        },
    ],
};
