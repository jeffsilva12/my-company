import { Form, Head, Link, setLayoutProps } from '@inertiajs/react';
import SolicitationController from '@/actions/App/Http/Controllers/SolicitationController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { edit, index, show } from '@/routes/solicitations';
import type { SolicitationOption } from '@/types';

type EditableSolicitation = {
    id: number;
    code: string | null;
    title: string;
    description: string;
    category: string;
};

export default function SolicitationsEdit({
    solicitation,
    categories,
}: {
    solicitation: EditableSolicitation;
    categories: SolicitationOption[];
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
            {
                title: 'Editar',
                href: edit(solicitation.id),
            },
        ],
    });

    return (
        <>
            <Head title={`Editar ${solicitation.code}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title={`Editar ${solicitation.code}`}
                    description="Altere os dados da solicitação aberta"
                />

                <Form
                    {...SolicitationController.update.form(solicitation.id)}
                    className="max-w-2xl space-y-6 rounded-xl border p-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="title">Título</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    required
                                    defaultValue={solicitation.title}
                                />
                                <InputError message={errors.title} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="category">Categoria</Label>
                                <select
                                    id="category"
                                    name="category"
                                    required
                                    defaultValue={solicitation.category}
                                    className="border-input bg-transparent h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                >
                                    {categories.map((category) => (
                                        <option
                                            key={category.value}
                                            value={category.value}
                                        >
                                            {category.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.category} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Descrição</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    required
                                    defaultValue={solicitation.description}
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="flex items-center gap-3">
                                <Button type="submit" disabled={processing}>
                                    Salvar alterações
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={show(solicitation.id)}>
                                        Cancelar
                                    </Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}
