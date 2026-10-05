import { cn } from '@/lib/utils';

export function PageShell({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className="relative flex min-h-full flex-1 flex-col overflow-hidden">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_oklch(0.92_0.06_195)_0%,_transparent_50%),radial-gradient(ellipse_at_top_right,_oklch(0.94_0.07_75)_0%,_transparent_42%),radial-gradient(ellipse_at_bottom,_oklch(0.93_0.05_165)_0%,_transparent_48%)] dark:bg-[radial-gradient(ellipse_at_top_left,_oklch(0.28_0.06_195)_0%,_transparent_50%),radial-gradient(ellipse_at_top_right,_oklch(0.3_0.05_75)_0%,_transparent_42%),radial-gradient(ellipse_at_bottom,_oklch(0.26_0.05_165)_0%,_transparent_48%)]"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent"
            />
            <div
                className={cn(
                    'relative z-10 flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-6 lg:p-8',
                    className,
                )}
            >
                {children}
            </div>
        </div>
    );
}
