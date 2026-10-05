import { apiClient } from '@/lib/api';
import type {
    DashboardStats,
    PaginatedSolicitations,
    SolicitationDetail,
    SolicitationFilters,
    SolicitationOption,
} from '@/types';

type SolicitationListResponse = {
    data: SolicitationDetail[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        filters: SolicitationFilters;
        categories: SolicitationOption[];
        statuses: SolicitationOption[];
    };
};

type SolicitationResponse = {
    data: SolicitationDetail;
};

type MetaResponse = {
    categories: SolicitationOption[];
    statuses: SolicitationOption[];
};

type StatsResponse = {
    data: DashboardStats;
};

const base = '/api/v1';

export const solicitationApi = {
    list: async (
        filters: Partial<SolicitationFilters> & {
            page?: string | number;
        } = {},
    ) => {
        const response = await apiClient.get<SolicitationListResponse>(
            `${base}/solicitations`,
            filters,
        );

        const solicitations: PaginatedSolicitations = {
            data: response.data,
            current_page: response.meta.current_page,
            last_page: response.meta.last_page,
            per_page: response.meta.per_page,
            total: response.meta.total,
            links: response.meta.links,
        };

        return {
            solicitations,
            filters: response.meta.filters,
            categories: response.meta.categories,
            statuses: response.meta.statuses,
        };
    },

    meta: () => apiClient.get<MetaResponse>(`${base}/solicitations/meta`),

    show: async (id: number) => {
        const response = await apiClient.get<SolicitationResponse>(
            `${base}/solicitations/${id}`,
        );

        return response.data;
    },

    create: async (payload: {
        title: string;
        description: string;
        category: string;
    }) => {
        const response = await apiClient.post<SolicitationResponse>(
            `${base}/solicitations`,
            payload,
        );

        return response.data;
    },

    update: async (
        id: number,
        payload: {
            title: string;
            description: string;
            category: string;
        },
    ) => {
        const response = await apiClient.put<SolicitationResponse>(
            `${base}/solicitations/${id}`,
            payload,
        );

        return response.data;
    },

    destroy: (id: number) =>
        apiClient.delete<{ message: string }>(`${base}/solicitations/${id}`),

    updateStatus: async (id: number, status: string) => {
        const response = await apiClient.patch<SolicitationResponse>(
            `${base}/solicitations/${id}/status`,
            { status },
        );

        return response.data;
    },
};

export const dashboardApi = {
    stats: async () => {
        const response = await apiClient.get<StatsResponse>(
            `${base}/dashboard/stats`,
        );

        return response.data;
    },
};
