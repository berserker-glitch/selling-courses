import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:3000";

let socket: Socket | null = null;

export const getSocket = (token?: string): Socket => {
    if (!socket && typeof window !== "undefined") {
        socket = io(SOCKET_URL, {
            auth: {
                token: token || localStorage.getItem("token"),
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
    if (socket && token && (socket as any).auth?.token !== token) {
        (socket as any).auth.token = token;
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
