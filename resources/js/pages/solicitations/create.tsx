import { Form, Head, Link } from '@inertiajs/react';
import SolicitationController from '@/actions/App/Http/Controllers/SolicitationController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { create, index } from '@/routes/solicitations';
import type { SolicitationOption } from '@/types';

export default function SolicitationsCreate({
    categories,
}: {
    categories: SolicitationOption[];
}) {
    return (
        <>
            <Head title="Nova solicitação" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Nova solicitação"
                    description="Registre uma nova solicitação interna"
                />

                <Form
                    {...SolicitationController.store.form()}
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
                                    placeholder="Resumo da solicitação"
                                />
                                <InputError message={errors.title} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="category">Categoria</Label>
                                <select
                                    id="category"
                                    name="category"
                                    required
                                    defaultValue=""
                                    className="border-input bg-transparent h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                >
                                    <option value="" disabled>
                                        Selecione uma categoria
                                    </option>
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
                                    placeholder="Descreva o que precisa ser atendido"
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="flex items-center gap-3">
                                <Button type="submit" disabled={processing}>
                                    Criar solicitação
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={index()}>Cancelar</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
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
