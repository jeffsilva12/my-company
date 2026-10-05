import { Form, Head, usePage } from '@inertiajs/react';
import { ImageIcon, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import BrandingController from '@/actions/App/Http/Controllers/Settings/BrandingController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/branding';
import type { Branding } from '@/types';

type BrandingPageProps = Branding & {
    icon_path: string | null;
    favicon_path: string | null;
    image_path: string | null;
};

type PreviewState = {
    icon: string | null;
    favicon: string | null;
    image: string | null;
};

function FileField({
    id,
    label,
    hint,
    preview,
    onChange,
    onRemove,
    canRemove,
}: {
    id: string;
    label: string;
    hint: string;
    preview: string | null;
    onChange: (file: File | null) => void;
    onRemove: () => void;
    canRemove: boolean;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="space-y-3 rounded-xl border p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <Label htmlFor={id}>{label}</Label>
                    <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
                </div>
                {canRemove && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            if (inputRef.current) {
                                inputRef.current.value = '';
                            }
                            onRemove();
                        }}
                    >
                        <Trash2 className="size-4" />
                        Remover
                    </Button>
                )}
            </div>

            <div className="flex items-center gap-4">
                <div className="flex size-16 items-center justify-center overflow-hidden rounded-xl border bg-muted">
                    {preview ? (
                        <img
                            src={preview}
                            alt={label}
                            className="size-full object-cover"
                        />
                    ) : (
                        <ImageIcon className="size-6 text-muted-foreground" />
                    )}
                </div>
                <Input
                    ref={inputRef}
                    id={id}
                    name={id}
                    type="file"
                    accept="image/*,.ico,.svg"
                    className="max-w-xs"
                    onChange={(event) => {
                        const file = event.target.files?.[0] ?? null;
                        onChange(file);
                    }}
                />
            </div>
        </div>
    );
}

export default function Branding({
    branding,
}: {
    branding: BrandingPageProps;
}) {
    const { name } = usePage<{ name: string }>().props;
    const [title, setTitle] = useState(branding.title || name);
    const [previews, setPreviews] = useState<PreviewState>({
        icon: branding.icon_url,
        favicon: branding.favicon_url,
        image: branding.image_url,
    });
    const [removeFlags, setRemoveFlags] = useState({
        icon: false,
        favicon: false,
        image: false,
    });

    function updatePreview(
        field: keyof PreviewState,
        file: File | null,
    ): void {
        if (!file) {
            return;
        }

        const url = URL.createObjectURL(file);
        setPreviews((current) => ({ ...current, [field]: url }));
        setRemoveFlags((current) => ({ ...current, [field]: false }));
    }

    function markRemoved(field: keyof PreviewState): void {
        setPreviews((current) => ({ ...current, [field]: null }));
        setRemoveFlags((current) => ({ ...current, [field]: true }));
    }

    return (
        <>
            <Head title="Identidade visual" />

            <h1 className="sr-only">Identidade visual</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Identidade visual"
                    description="Altere título, ícone, favicon e imagem institucional do sistema."
                />

                <Form
                    {...BrandingController.update.form()}
                    encType="multipart/form-data"
                    options={{ forceFormData: true, preserveScroll: true }}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <input
                                type="hidden"
                                name="remove_icon"
                                value={removeFlags.icon ? '1' : '0'}
                            />
                            <input
                                type="hidden"
                                name="remove_favicon"
                                value={removeFlags.favicon ? '1' : '0'}
                            />
                            <input
                                type="hidden"
                                name="remove_image"
                                value={removeFlags.image ? '1' : '0'}
                            />

                            <div className="grid gap-2">
                                <Label htmlFor="title">Título do sistema</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={title}
                                    onChange={(event) =>
                                        setTitle(event.target.value)
                                    }
                                    required
                                    placeholder="Nome exibido no painel e no navegador"
                                />
                                <InputError message={errors.title} />
                            </div>

                            <FileField
                                id="icon"
                                label="Ícone"
                                hint="Usado na sidebar e telas de autenticação. JPG, PNG, WEBP ou SVG."
                                preview={previews.icon}
                                canRemove={Boolean(previews.icon)}
                                onChange={(file) => updatePreview('icon', file)}
                                onRemove={() => markRemoved('icon')}
                            />
                            <InputError message={errors.icon} />

                            <FileField
                                id="favicon"
                                label="Favicon"
                                hint="Ícone da aba do navegador. JPG, PNG, WEBP, ICO ou SVG."
                                preview={previews.favicon}
                                canRemove={Boolean(previews.favicon)}
                                onChange={(file) =>
                                    updatePreview('favicon', file)
                                }
                                onRemove={() => markRemoved('favicon')}
                            />
                            <InputError message={errors.favicon} />

                            <FileField
                                id="image"
                                label="Imagem institucional"
                                hint="Exibida no painel de login (lado esquerdo). JPG, PNG ou WEBP."
                                preview={previews.image}
                                canRemove={Boolean(previews.image)}
                                onChange={(file) =>
                                    updatePreview('image', file)
                                }
                                onRemove={() => markRemoved('image')}
                            />
                            <InputError message={errors.image} />

                            <div className="rounded-xl border bg-muted/40 p-4">
                                <p className="mb-3 text-sm font-medium">
                                    Pré-visualização rápida
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center overflow-hidden rounded-xl bg-foreground text-background">
                                        {previews.icon ? (
                                            <img
                                                src={previews.icon}
                                                alt=""
                                                className="size-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-xs font-semibold">
                                                {title.slice(0, 2).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Solicitações internas
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                disabled={processing}
                                data-test="update-branding-button"
                            >
                                Salvar identidade
                            </Button>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

Branding.layout = {
    breadcrumbs: [
        {
            title: 'Identidade visual',
            href: edit(),
        },
    ],
};
