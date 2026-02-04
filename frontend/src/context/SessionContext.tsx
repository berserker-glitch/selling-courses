/**
 * Session Context for real-time session management.
 * 
 * Connects to the Socket.io server and listens for force-logout events.
 * When device limit is exceeded, the server emits a 'force-logout' event
 * which triggers immediate logout on all connected devices.
 * 
 * @module SessionContext
 */

import { createContext, useContext, useEffect, useRef, ReactNode, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

/**
 * Shape of the session context value
 */
interface SessionContextType {
    /** The Socket.io socket instance, null if not connected */
    socket: Socket | null;
    /** Whether the socket is currently connected */
    isConnected: boolean;
}

// Default context value
const SessionContext = createContext<SessionContextType>({
    socket: null,
    isConnected: false
});

/**
 * Props for SessionProvider component
 */
interface SessionProviderProps {
    children: ReactNode;
}

/**
 * SessionProvider component that wraps the app and manages Socket.io connection.
 * 
 * Features:
 * - Automatically connects when user is authenticated (token exists)
 * - Listens for 'force-logout' events to handle device limit violations
 * - Cleans up connection on unmount
 * 
 * @param {SessionProviderProps} props - Component props
 * @returns {JSX.Element} Provider component
 */
export function SessionProvider({ children }: SessionProviderProps) {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        const token = localStorage.getItem('token');

        // Only connect if user is authenticated
        if (!token) {
            console.log('[SessionContext] No token found, skipping socket connection');
            return;
        }

        // Determine the server URL (remove /api suffix if present)
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const serverUrl = apiUrl.replace('/api', '');

        console.log(`[SessionContext] Connecting to Socket.io server: ${serverUrl}`);

        // Connect to Socket.io server with auth token
        const socket = io(serverUrl, {
            auth: { token },
            transports: ['websocket', 'polling'], // Prefer WebSocket, fallback to polling
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        socketRef.current = socket;

        // Connection event handlers
        socket.on('connect', () => {
            console.log('[SessionContext] Socket connected:', socket.id);
            setIsConnected(true);
        });

        socket.on('disconnect', (reason) => {
            console.log('[SessionContext] Socket disconnected:', reason);
            setIsConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.error('[SessionContext] Socket connection error:', error.message);
        });

        /**
         * Handle force-logout event from server.
         * This is triggered when device limit is exceeded.
         */
        socket.on('force-logout', (data: { reason: string }) => {
            console.log('[SessionContext] Force logout received:', data.reason);

            // Clear authentication data
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');

            // Show notification to user
            toast({
                variant: 'destructive',
                title: 'Session Ended',
                description: data.reason || 'You have been logged out due to a security event.'
            });

            // Disconnect socket
            socket.disconnect();

            // Redirect to login page
            navigate('/login');
        });

        // Cleanup on unmount
        return () => {
            console.log('[SessionContext] Cleaning up socket connection');
            socket.disconnect();
            socketRef.current = null;
        };
    }, [navigate, toast]);

    return (
        <SessionContext.Provider value={{ socket: socketRef.current, isConnected }}>
            {children}
        </SessionContext.Provider>
    );
}

/**
 * Hook to access the session context.
 * 
 * @returns {SessionContextType} The current session context value
 * 
 * @example
 * ```tsx
 * const { socket, isConnected } = useSession();
 * 
 * if (isConnected) {
 *   console.log('Socket connected:', socket?.id);
 * }
 * ```
 */
export const useSession = () => useContext(SessionContext);
