import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import type { Branding } from '@/types';

let currentAppName = import.meta.env.VITE_APP_NAME || 'Laravel';

export function getAppName(): string {
    return currentAppName;
}

function upsertIconLink(rel: string, href: string): void {
    let link = document.querySelector<HTMLLinkElement>(`link[rel='${rel}']`);

    if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
    }

    link.href = href;
}

export function BrandingSync() {
    const { branding, name } = usePage<{
        branding: Branding;
        name: string;
    }>().props;

    useEffect(() => {
        currentAppName = branding?.title || name || currentAppName;

        if (branding?.favicon_url) {
            upsertIconLink('icon', branding.favicon_url);
            upsertIconLink('apple-touch-icon', branding.favicon_url);
        }
    }, [branding, name]);

    return null;
}
