import { io, Socket } from "socket.io-client";

const SOCKET_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000").replace('/api', '');

let socket: Socket | null = null;

const getAuthToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("token");
    }
    return null;
};

export const getSocket = (token?: string): Socket => {
    const currentToken = token || getAuthToken();

    if (!socket && typeof window !== "undefined") {
        socket = io(SOCKET_URL, {
            auth: {
                token: currentToken,
            },
            transports: ["websocket"],
            reconnection: true,
        });

        socket.on("connect", () => {
            console.log("[Socket] Connected to server");
        });

        socket.on("connect_error", (error) => {
            console.error("[Socket] Connection error:", error);
        });

        socket.on("disconnect", (reason) => {
            console.log("[Socket] Disconnected:", reason);
        });
    }

    // Update token if provided and socket exists but might have old auth
    if (socket && currentToken && (socket as any).auth?.token !== currentToken) {
        console.log("[Socket] Updating token and reconnecting...");
        (socket as any).auth.token = currentToken;
        socket.disconnect().connect();
    }

    return socket!;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
