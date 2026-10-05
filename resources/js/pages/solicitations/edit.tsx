import { Head, Link, router, setLayoutProps } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { PageHeader } from '@/components/page-header';
import { PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ApiError } from '@/lib/api';
import { solicitationApi } from '@/lib/solicitation-api';
import { edit, index, show } from '@/routes/solicitations';
import type { SolicitationDetail, SolicitationOption } from '@/types';

const selectClassName =
    'border-input bg-background/80 h-10 w-full rounded-lg border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';

export default function SolicitationsEdit({
    solicitationId,
}: {
    solicitationId: number;
}) {
    const [categories, setCategories] = useState<SolicitationOption[]>([]);
    const [solicitation, setSolicitation] = useState<SolicitationDetail | null>(
        null,
    );
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        void Promise.all([
            solicitationApi.show(solicitationId),
            solicitationApi.meta(),
        ])
            .then(([item, meta]) => {
                setSolicitation(item);
                setTitle(item.title);
                setDescription(item.description);
                setCategory(item.category);
                setCategories(meta.categories);
            })
            .catch((err: unknown) => {
                toast.error(
                    err instanceof ApiError
                        ? err.message
                        : 'Erro ao carregar solicitação.',
                );
            })
            .finally(() => setLoading(false));
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
            {
                title: 'Editar',
                href: edit(solicitationId),
            },
        ],
    });

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            await solicitationApi.update(solicitationId, {
                title,
                description,
                category,
            });

            toast.success('Solicitação atualizada com sucesso.');
            router.visit(show.url(solicitationId));
        } catch (err) {
            if (err instanceof ApiError && err.status === 422) {
                const nextErrors: Record<string, string> = {};

                Object.entries(err.errors).forEach(([field, messages]) => {
                    nextErrors[field] = messages[0] ?? '';
                });

                setErrors(nextErrors);
            } else {
                toast.error(
                    err instanceof ApiError
                        ? err.message
                        : 'Erro ao atualizar solicitação.',
                );
            }
        } finally {
            setProcessing(false);
        }
    }

    if (loading) {
        return (
            <>
                <Head title="Editar solicitação" />
                <PageShell>
                    <div className="space-y-4">
                        <div className="h-8 w-56 animate-pulse rounded-lg bg-muted" />
                        <div className="h-64 max-w-2xl animate-pulse rounded-2xl bg-muted" />
                    </div>
                </PageShell>
            </>
        );
    }

    return (
        <>
            <Head title={`Editar ${solicitation?.code}`} />

            <PageShell>
                <PageHeader
                    title={`Editar ${solicitation?.code}`}
                    description="Atualize os dados enquanto a solicitação ainda estiver aberta."
                />

                <form
                    onSubmit={handleSubmit}
                    className="max-w-2xl space-y-6 rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur-sm md:p-8"
                >
                    <div className="grid gap-2">
                        <Label htmlFor="title">Título</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            required
                            className="h-10 rounded-lg"
                        />
                        <InputError message={errors.title} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="category">Categoria</Label>
                        <select
                            id="category"
                            value={category}
                            onChange={(event) =>
                                setCategory(event.target.value)
                            }
                            required
                            className={selectClassName}
                        >
                            {categories.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.category} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                            required
                            className="min-h-32 rounded-lg"
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="flex items-center gap-3 border-t pt-5">
                        <Button type="submit" disabled={processing} size="lg">
                            Salvar alterações
                        </Button>
                        <Button variant="ghost" asChild size="lg">
                            <Link href={show(solicitationId)}>Cancelar</Link>
                        </Button>
                    </div>
                </form>
            </PageShell>
        </>
    );
}
