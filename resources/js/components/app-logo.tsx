import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import type { Branding } from '@/types';

export default function AppLogo() {
    const { name, branding } = usePage<{
        name: string;
        branding: Branding;
    }>().props;

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-teal-400 via-cyan-500 to-sky-600 text-white shadow-md shadow-cyan-500/30 ring-1 ring-white/20">
                {branding?.icon_url ? (
                    <img
                        src={branding.icon_url}
                        alt={name}
                        className="size-full object-cover"
                    />
                ) : (
                    <AppLogoIcon className="size-5 fill-current text-white" />
                )}
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold text-sidebar-foreground">
                    {name}
                </span>
                <span className="truncate text-xs text-sidebar-foreground/65">
                    Solicitações internas
                </span>
            </div>
        </>
    );
}
