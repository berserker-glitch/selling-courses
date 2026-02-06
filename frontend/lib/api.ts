const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

type RequestOptions = RequestInit & {
    headers?: Record<string, string>;
};

async function fetchWithAuth(endpoint: string, options: RequestOptions = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

    const headers: Record<string, string> = {
        ...(options.headers || {}),
    };

    if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    let data;
    try {
        data = await response.json();
    } catch (error) {
        // If JSON parsing fails, try to get text
        const text = await response.text().catch(() => null);
        data = { message: text || "Unknown Error" };
    }

    if (!response.ok) {
        console.error(`API Error: ${response.status} ${response.statusText} at ${endpoint}`, data);
        throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
}

export const api = {
    get: (endpoint: string, options?: RequestOptions) =>
        fetchWithAuth(endpoint, { ...options, method: "GET" }),

    post: (endpoint: string, body: any, options?: RequestOptions) => {
        const isFormData = body instanceof FormData;
        return fetchWithAuth(endpoint, {
            ...options,
            method: "POST",
            body: isFormData ? body : JSON.stringify(body)
        });
    },

    put: (endpoint: string, body: any, options?: RequestOptions) => {
        const isFormData = body instanceof FormData;
        return fetchWithAuth(endpoint, {
            ...options,
            method: "PUT",
            body: isFormData ? body : JSON.stringify(body)
        });
    },

    delete: (endpoint: string, options?: RequestOptions) =>
        fetchWithAuth(endpoint, { ...options, method: "DELETE" }),
};
