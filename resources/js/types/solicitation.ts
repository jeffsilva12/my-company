export type SolicitationOption = {
    value: string;
    label: string;
};

export type SolicitationListItem = {
    id: number;
    code: string | null;
    title: string;
    category: string;
    category_label: string;
    status: string;
    status_label: string;
    requester: string;
    opened_at: string | null;
};

export type SolicitationDetail = SolicitationListItem & {
    description: string;
    user_id: number;
    is_owner: boolean;
    can: {
        update: boolean;
        delete: boolean;
        update_status: boolean;
    };
};

export type SolicitationFilters = {
    search: string;
    category: string;
    status: string;
    from: string;
    to: string;
};

export type PaginatedSolicitations = {
    data: SolicitationDetail[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
};

export type DashboardStats = {
    total: number;
    open: number;
    in_progress: number;
    completed: number;
};
