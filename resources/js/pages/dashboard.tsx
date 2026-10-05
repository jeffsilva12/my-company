import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    CircleDot,
    ClipboardList,
    LoaderCircle,
    Plus,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { PageShell } from '@/components/page-shell';
import { StatCard } from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api';
import { dashboardApi } from '@/lib/solicitation-api';
import { dashboard } from '@/routes';
import { create, index as solicitationsIndex } from '@/routes/solicitations';
import type { DashboardStats } from '@/types';

const cards = [
    {
        key: 'total' as const,
        title: 'Total',
        description: 'Todas as solicitações',
        icon: ClipboardList,
        accent: 'slate' as const,
    },
    {
        key: 'open' as const,
        title: 'Abertas',
        description: 'Aguardando atendimento',
        icon: CircleDot,
        accent: 'sky' as const,
    },
    {
        key: 'in_progress' as const,
        title: 'Em atendimento',
        description: 'Em andamento agora',
        icon: LoaderCircle,
        accent: 'amber' as const,
    },
    {
        key: 'completed' as const,
        title: 'Concluídas',
        description: 'Finalizadas com sucesso',
        icon: CheckCircle2,
        accent: 'emerald' as const,
    },
];

const emptyStats: DashboardStats = {
    total: 0,
    open: 0,
    in_progress: 0,
    completed: 0,
};

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats>(emptyStats);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        void dashboardApi
            .stats()
            .then(setStats)
            .catch((err: unknown) => {
                setError(
                    err instanceof ApiError
                        ? err.message
                        : 'Erro ao carregar indicadores.',
                );
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <Head title="Dashboard" />
            <PageShell>
                <section className="relative overflow-hidden rounded-2xl border border-primary/15 bg-linear-to-br from-teal-50 via-card/90 to-amber-50/70 p-6 shadow-sm backdrop-blur-sm md:p-8 dark:from-teal-950/50 dark:via-card/80 dark:to-amber-950/30">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -top-16 -right-10 size-56 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-400/10"
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -bottom-20 left-10 size-48 rounded-full bg-amber-300/25 blur-3xl dark:bg-amber-400/10"
                    />
                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <PageHeader
                            className="sm:items-start"
                            title="Painel de solicitações"
                            description="Acompanhe o volume e o andamento das solicitações internas em um só lugar."
                        />
                        <div className="flex flex-wrap gap-2">
                            <Button
                                asChild
                                size="lg"
                                className="shadow-md shadow-primary/25"
                            >
                                <Link href={create()}>
                                    <Plus className="size-4" />
                                    Nova solicitação
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg">
                                <Link href={solicitationsIndex()}>
                                    Ver listagem
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {error && (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {cards.map((card, index) => (
                        <div
                            key={card.key}
                            className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500"
                            style={{ animationDelay: `${index * 70}ms` }}
                        >
                            <StatCard
                                title={card.title}
                                description={card.description}
                                value={stats[card.key]}
                                icon={card.icon}
                                accent={card.accent}
                                loading={loading}
                                href={solicitationsIndex()}
                            />
                        </div>
                    ))}
                </section>

                <section className="grid gap-4 lg:grid-cols-3">
                    <div className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur-sm lg:col-span-2">
                        <h2 className="text-base font-semibold tracking-tight">
                            Como usar
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Fluxo rápido para registrar e acompanhar demandas
                            internas.
                        </p>
                        <ol className="mt-5 space-y-4">
                            {[
                                {
                                    text: 'Abra uma nova solicitação com título, descrição e categoria.',
                                    tone: 'bg-sky-500 text-white shadow-sky-500/30',
                                },
                                {
                                    text: 'Acompanhe na listagem com filtros por período, status e texto.',
                                    tone: 'bg-amber-500 text-white shadow-amber-500/30',
                                },
                                {
                                    text: 'Atualize o status conforme o atendimento avança.',
                                    tone: 'bg-emerald-500 text-white shadow-emerald-500/30',
                                },
                            ].map((step, stepIndex) => (
                                <li
                                    key={step.text}
                                    className="flex gap-3 text-sm leading-relaxed"
                                >
                                    <span
                                        className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold shadow-md ${step.tone}`}
                                    >
                                        {stepIndex + 1}
                                    </span>
                                    <span className="pt-1 text-muted-foreground">
                                        {step.text}
                                    </span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    <div className="rounded-2xl border border-teal-200/60 bg-linear-to-br from-cyan-50 via-teal-50 to-emerald-50 p-6 shadow-sm dark:border-teal-800/40 dark:from-cyan-950/40 dark:via-teal-950/40 dark:to-emerald-950/30">
                        <h2 className="text-base font-semibold tracking-tight">
                            Status atuais
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Resumo imediato do que está aberto versus concluído.
                        </p>
                        <div className="mt-6 space-y-3">
                            <div className="flex items-center justify-between rounded-xl border border-amber-200/60 bg-amber-50/80 px-3 py-2.5 text-sm backdrop-blur-sm dark:border-amber-800/40 dark:bg-amber-950/40">
                                <span className="text-amber-800 dark:text-amber-200">
                                    Em aberto
                                </span>
                                <span className="font-semibold text-amber-900 tabular-nums dark:text-amber-100">
                                    {loading
                                        ? '—'
                                        : stats.open + stats.in_progress}
                                </span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-emerald-200/60 bg-emerald-50/80 px-3 py-2.5 text-sm backdrop-blur-sm dark:border-emerald-800/40 dark:bg-emerald-950/40">
                                <span className="text-emerald-800 dark:text-emerald-200">
                                    Taxa concluída
                                </span>
                                <span className="font-semibold text-emerald-900 tabular-nums dark:text-emerald-100">
                                    {loading || stats.total === 0
                                        ? '—'
                                        : `${Math.round((stats.completed / stats.total) * 100)}%`}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
            </PageShell>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
