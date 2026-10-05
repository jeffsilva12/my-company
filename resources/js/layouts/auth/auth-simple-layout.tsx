import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps, Branding } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name, branding } = usePage<{
        name: string;
        branding: Branding;
    }>().props;

    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-background p-6 md:p-10">
            {branding?.image_url && (
                <>
                    <img
                        src={branding.image_url}
                        alt=""
                        className="pointer-events-none absolute inset-0 size-full object-cover opacity-25"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
                </>
            )}

            <div className="relative z-10 w-full max-w-sm">
                <div className="flex flex-col gap-8 rounded-2xl border border-border/70 bg-card/90 p-6 shadow-sm backdrop-blur-sm md:p-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <div className="mb-1 flex size-12 items-center justify-center overflow-hidden rounded-xl bg-muted">
                                {branding?.icon_url ? (
                                    <img
                                        src={branding.icon_url}
                                        alt={name}
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <AppLogoIcon className="size-8 fill-current text-[var(--foreground)] dark:text-white" />
                                )}
                            </div>
                            <span className="text-sm font-semibold">{name}</span>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-medium">{title}</h1>
                            <p className="text-center text-sm text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
