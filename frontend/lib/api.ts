const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

type RequestOptions = RequestInit & {
    headers?: Record<string, string>;
};

async function fetchWithAuth(endpoint: string, options: RequestOptions = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "An error occurred");
    }

    return data;
}

export const api = {
    get: (endpoint: string, options?: RequestOptions) =>
        fetchWithAuth(endpoint, { ...options, method: "GET" }),

    post: (endpoint: string, body: any, options?: RequestOptions) =>
        fetchWithAuth(endpoint, { ...options, method: "POST", body: JSON.stringify(body) }),

    put: (endpoint: string, body: any, options?: RequestOptions) =>
        fetchWithAuth(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) }),

    delete: (endpoint: string, options?: RequestOptions) =>
        fetchWithAuth(endpoint, { ...options, method: "DELETE" }),
};
