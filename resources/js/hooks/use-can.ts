import { usePage } from '@inertiajs/react';

export function useCan(permission: string): boolean {
    const { auth } = usePage().props;

    return auth.permissions.includes(permission);
}

export function useCanAny(...permissions: string[]): boolean {
    const { auth } = usePage().props;

    return permissions.some((permission) =>
        auth.permissions.includes(permission),
    );
}
