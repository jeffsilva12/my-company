import { Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InertiaLinkProps } from '@inertiajs/react';

const accentStyles = {
    slate: {
        icon: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
        bar: 'from-slate-500 via-slate-400 to-cyan-400/60',
        glow: 'group-hover:shadow-slate-500/15',
        wash: 'from-slate-500/8 to-transparent',
    },
    sky: {
        icon: 'bg-sky-100 text-sky-700 shadow-inner shadow-sky-200/50 dark:bg-sky-950 dark:text-sky-300',
        bar: 'from-sky-500 via-cyan-400 to-teal-400',
        glow: 'group-hover:shadow-sky-500/20',
        wash: 'from-sky-500/12 to-transparent',
    },
    amber: {
        icon: 'bg-amber-100 text-amber-800 shadow-inner shadow-amber-200/50 dark:bg-amber-950 dark:text-amber-300',
        bar: 'from-amber-500 via-orange-400 to-yellow-300',
        glow: 'group-hover:shadow-amber-500/20',
        wash: 'from-amber-500/12 to-transparent',
    },
    emerald: {
        icon: 'bg-emerald-100 text-emerald-800 shadow-inner shadow-emerald-200/50 dark:bg-emerald-950 dark:text-emerald-300',
        bar: 'from-emerald-500 via-teal-400 to-cyan-300',
        glow: 'group-hover:shadow-emerald-500/20',
        wash: 'from-emerald-500/12 to-transparent',
    },
} as const;

export type StatAccent = keyof typeof accentStyles;

export function StatCard({
    title,
    description,
    value,
    icon: Icon,
    href,
    accent = 'slate',
    loading = false,
}: {
    title: string;
    description: string;
    value: string | number;
    icon: LucideIcon;
    href: NonNullable<InertiaLinkProps['href']>;
    accent?: StatAccent;
    loading?: boolean;
}) {
    const styles = accentStyles[accent];

    return (
        <Link
            href={href}
            className={cn(
                'group relative block overflow-hidden rounded-2xl border border-border/70 bg-card/85 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg',
                styles.glow,
            )}
        >
            <div
                aria-hidden
                className={cn(
                    'absolute inset-x-0 top-0 h-1.5 bg-linear-to-r',
                    styles.bar,
                )}
            />
            <div
                aria-hidden
                className={cn(
                    'absolute inset-0 bg-linear-to-br opacity-80',
                    styles.wash,
                )}
            />
            <div className="relative flex flex-col gap-5 p-5 md:p-6">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                            {title}
                        </p>
                        <p className="text-xs text-muted-foreground/80">
                            {description}
                        </p>
                    </div>
                    <div
                        className={cn(
                            'flex size-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105',
                            styles.icon,
                        )}
                    >
                        <Icon className="size-5" />
                    </div>
                </div>
                <p className="text-3xl font-semibold tracking-tight tabular-nums md:text-4xl">
                    {loading ? (
                        <span className="inline-block h-9 w-16 animate-pulse rounded-md bg-muted" />
                    ) : (
                        value
                    )}
                </p>
            </div>
        </Link>
    );
}
