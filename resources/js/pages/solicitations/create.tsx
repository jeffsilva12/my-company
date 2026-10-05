import { Head, Link, router } from '@inertiajs/react';
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
import { create, index, show } from '@/routes/solicitations';
import type { SolicitationOption } from '@/types';

const selectClassName =
    'border-input bg-background/80 h-10 w-full rounded-lg border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';

export default function SolicitationsCreate() {
    const [categories, setCategories] = useState<SolicitationOption[]>([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const [loadingMeta, setLoadingMeta] = useState(true);

    useEffect(() => {
        void solicitationApi
            .meta()
            .then((response) => {
                setCategories(response.categories);
            })
            .finally(() => setLoadingMeta(false));
    }, []);

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            const solicitation = await solicitationApi.create({
                title,
                description,
                category,
            });

            toast.success('Solicitação criada com sucesso.');
            router.visit(show.url(solicitation.id));
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
                        : 'Erro ao criar solicitação.',
                );
            }
        } finally {
            setProcessing(false);
        }
    }

    return (
        <>
            <Head title="Nova solicitação" />

            <PageShell>
                <PageHeader
                    title="Nova solicitação"
                    description="Descreva a demanda com clareza para agilizar o atendimento."
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
                            placeholder="Resumo da solicitação"
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
                            disabled={loadingMeta}
                            className={selectClassName}
                        >
                            <option value="" disabled>
                                Selecione uma categoria
                            </option>
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
                            placeholder="Descreva o que precisa ser atendido"
                            className="min-h-32 rounded-lg"
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="flex items-center gap-3 border-t pt-5">
                        <Button type="submit" disabled={processing} size="lg">
                            Criar solicitação
                        </Button>
                        <Button variant="ghost" asChild size="lg">
                            <Link href={index()}>Cancelar</Link>
                        </Button>
                    </div>
                </form>
            </PageShell>
        </>
    );
}

SolicitationsCreate.layout = {
    breadcrumbs: [
        {
            title: 'Solicitações',
            href: index(),
        },
        {
            title: 'Nova',
            href: create(),
        },
    ],
};
