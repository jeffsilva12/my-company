export type ApiValidationErrors = Record<string, string[]>;

export class ApiError extends Error {
    status: number;
    errors: ApiValidationErrors;

    constructor(message: string, status: number, errors: ApiValidationErrors = {}) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.errors = errors;
    }
}

function csrfToken(): string {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : '';
}

function toQueryString(params?: Record<string, string | number | undefined | null>): string {
    if (!params) {
        return '';
    }

    const search = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
            return;
        }

        search.set(key, String(value));
    });

    const query = search.toString();

    return query ? `?${query}` : '';
}

export async function api<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const headers = new Headers(options.headers);

    headers.set('Accept', 'application/json');
    headers.set('X-Requested-With', 'XMLHttpRequest');

    if (options.body !== undefined) {
        headers.set('Content-Type', 'application/json');
    }

    const token = csrfToken();

    if (token) {
        headers.set('X-XSRF-TOKEN', token);
    }

    const response = await fetch(path, {
        ...options,
        headers,
        credentials: 'same-origin',
    });

    if (response.status === 204) {
        return undefined as T;
    }

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new ApiError(
            payload.message ?? 'Não foi possível concluir a requisição.',
            response.status,
            payload.errors ?? {},
        );
    }

    return payload as T;
}

export const apiClient = {
    get: <T>(path: string, params?: Record<string, string | number | undefined | null>) =>
        api<T>(`${path}${toQueryString(params)}`),

    post: <T>(path: string, body?: unknown) =>
        api<T>(path, {
            method: 'POST',
            body: body === undefined ? undefined : JSON.stringify(body),
        }),

    put: <T>(path: string, body?: unknown) =>
        api<T>(path, {
            method: 'PUT',
            body: body === undefined ? undefined : JSON.stringify(body),
        }),

    patch: <T>(path: string, body?: unknown) =>
        api<T>(path, {
            method: 'PATCH',
            body: body === undefined ? undefined : JSON.stringify(body),
        }),

    delete: <T>(path: string) =>
        api<T>(path, {
            method: 'DELETE',
        }),
};
