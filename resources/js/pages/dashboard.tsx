import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle2,
    CircleDot,
    ClipboardList,
    LoaderCircle,
} from 'lucide-react';
import Heading from '@/components/heading';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard } from '@/routes';
import { index as solicitationsIndex } from '@/routes/solicitations';
import type { DashboardStats } from '@/types';

const cards = [
    {
        key: 'total' as const,
        title: 'Total',
        description: 'Quantidade total de solicitações',
        icon: ClipboardList,
        href: solicitationsIndex(),
    },
    {
        key: 'open' as const,
        title: 'Abertas',
        description: 'Aguardando atendimento',
        icon: CircleDot,
        href: solicitationsIndex({ query: { status: 'open' } }),
    },
    {
        key: 'in_progress' as const,
        title: 'Em atendimento',
        description: 'Em andamento no momento',
        icon: LoaderCircle,
        href: solicitationsIndex({ query: { status: 'in_progress' } }),
    },
    {
        key: 'completed' as const,
        title: 'Concluídas',
        description: 'Finalizadas com sucesso',
        icon: CheckCircle2,
        href: solicitationsIndex({ query: { status: 'completed' } }),
    },
];

export default function Dashboard({ stats }: { stats: DashboardStats }) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Dashboard"
                    description="Indicadores das solicitações internas"
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {cards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <Link
                                key={card.key}
                                href={card.href}
                                className="transition-opacity hover:opacity-90"
                            >
                                <Card className="h-full">
                                    <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                                        <div className="space-y-1.5">
                                            <CardTitle>{card.title}</CardTitle>
                                            <CardDescription>
                                                {card.description}
                                            </CardDescription>
                                        </div>
                                        <Icon className="size-5 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-3xl font-semibold tracking-tight">
                                            {stats[card.key]}
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </div>
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
