import { cn } from '@/lib/utils';

export function PageHeader({
    title,
    description,
    actions,
    className,
}: {
    title: string;
    description?: string;
    actions?: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
                className,
            )}
        >
            <div className="space-y-2">
                <div className="h-1 w-12 rounded-full bg-linear-to-r from-primary via-teal-400 to-amber-300" />
                <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                    {title}
                </h1>
                {description && (
                    <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                        {description}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {actions}
                </div>
            )}
        </div>
    );
}
