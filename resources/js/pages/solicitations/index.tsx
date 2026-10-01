import { Form, Head, Link, router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import SolicitationController from '@/actions/App/Http/Controllers/SolicitationController';
import Heading from '@/components/heading';
import { SolicitationStatusBadge } from '@/components/solicitation-status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { create, index, show } from '@/routes/solicitations';
import type {
    PaginatedSolicitations,
    SolicitationFilters,
    SolicitationOption,
} from '@/types';

export default function SolicitationsIndex({
    solicitations,
    filters,
    categories,
    statuses,
}: {
    solicitations: PaginatedSolicitations;
    filters: SolicitationFilters;
    categories: SolicitationOption[];
    statuses: SolicitationOption[];
}) {
    return (
        <>
            <Head title="Solicitações" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        title="Solicitações"
                        description="Gerencie as solicitações internas da empresa"
                    />
                    <Button asChild>
                        <Link href={create()}>
                            <Plus className="size-4" />
                            Nova solicitação
                        </Link>
                    </Button>
                </div>

                <Form
                    {...SolicitationController.index.form()}
                    method="get"
                    className="grid gap-4 rounded-xl border p-4 md:grid-cols-2 lg:grid-cols-6"
                >
                    {({ processing }) => (
                        <>
                            <div className="grid gap-2 lg:col-span-2">
                                <Label htmlFor="search">Buscar título</Label>
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        name="search"
                                        defaultValue={filters.search}
                                        placeholder="Texto livre..."
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="category">Categoria</Label>
                                <select
                                    id="category"
                                    name="category"
                                    defaultValue={filters.category}
                                    className="border-input bg-transparent h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
                                    name="status"
                                    defaultValue={filters.status}
                                    className="border-input bg-transparent h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
                                    name="from"
                                    type="date"
                                    defaultValue={filters.from}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="to">Até</Label>
                                <Input
                                    id="to"
                                    name="to"
                                    type="date"
                                    defaultValue={filters.to}
                                />
                            </div>

                            <div className="flex items-end gap-2 lg:col-span-6">
                                <Button type="submit" disabled={processing}>
                                    Filtrar
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.get(index.url())}
                                >
                                    Limpar
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className="overflow-hidden rounded-xl border">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-left text-sm">
                            <thead className="border-b bg-muted/40">
                                <tr>
                                    <th className="px-4 py-3 font-medium">
                                        Código
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Título
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Categoria
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Solicitante
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Abertura
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {solicitations.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-10 text-center text-muted-foreground"
                                        >
                                            Nenhuma solicitação encontrada.
                                        </td>
                                    </tr>
                                ) : (
                                    solicitations.data.map((solicitation) => (
                                        <tr
                                            key={solicitation.id}
                                            className="border-b last:border-0 hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-3 font-mono text-xs">
                                                <Link
                                                    href={show(solicitation.id)}
                                                    className="text-primary underline-offset-4 hover:underline"
                                                >
                                                    {solicitation.code}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link
                                                    href={show(solicitation.id)}
                                                    className="font-medium hover:underline"
                                                >
                                                    {solicitation.title}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3">
                                                {solicitation.category_label}
                                            </td>
                                            <td className="px-4 py-3">
                                                {solicitation.requester}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {solicitation.opened_at}
                                            </td>
                                            <td className="px-4 py-3">
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

                {solicitations.last_page > 1 && (
                    <div className="flex flex-wrap items-center gap-2">
                        {solicitations.links.map((link, index) => (
                            <Button
                                key={`${link.label}-${index}`}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                asChild={Boolean(link.url)}
                            >
                                {link.url ? (
                                    <Link
                                        href={link.url}
                                        preserveScroll
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ) : (
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                )}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
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
