/**
 * Session Context for real-time session management.
 * 
 * Provides two-layer session validation:
 * 1. Socket.io - Listens for immediate 'force-logout' events when device limit exceeded
 * 2. Heartbeat - Polls /api/auth/validate-session every 10 seconds as fallback
 * 
 * This ensures users are logged out within ~10 seconds even if WebSocket events are missed.
 * 
 * @module SessionContext
 */

import { createContext, useContext, useEffect, useRef, ReactNode, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

/** 
 * Heartbeat interval in milliseconds (30 seconds)
 * Increased from 10s to reduce API load while still catching invalid sessions promptly
 */
const HEARTBEAT_INTERVAL_MS = 30000;

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
 * - Polls session validity every 10 seconds as fallback for missed WebSocket events
 * - Cleans up connection on unmount
 * 
 * @param {SessionProviderProps} props - Component props
 * @returns {JSX.Element} Provider component
 */
export function SessionProvider({ children }: SessionProviderProps) {
    const socketRef = useRef<Socket | null>(null);
    const heartbeatIntervalRef = useRef<number | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    /**
     * Handle logout - calls backend logout API, clears auth data and redirects to login.
     * Called by both Socket.io force-logout and heartbeat validation failure.
     * 
     * @param reason - Reason for logout (displayed to user)
     * @param callApi - Whether to call the logout API (false for force-logout from server)
     */
    const handleForceLogout = useCallback(async (reason: string, callApi: boolean = false) => {
        console.log('[SessionContext] Processing force logout:', reason);

        // Call logout API to invalidate session server-side (skip if already forced by server)
        if (callApi) {
            try {
                await api.post('/auth/logout');
            } catch (error) {
                // Ignore errors - we're logging out anyway
                console.log('[SessionContext] Logout API call failed, continuing with local cleanup');
            }
        }

        // Clear authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');

        // Clear heartbeat interval
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
        }

        // Disconnect socket if connected
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        // Show notification to user
        toast({
            variant: 'destructive',
            title: 'Session Ended',
            description: reason || 'You have been logged out due to a security event.'
        });

        // Redirect to login page
        navigate('/login');
    }, [navigate, toast]);

    /**
     * Validate session via API call.
     * Acts as fallback when Socket.io events are missed.
     */
    const validateSession = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('[SessionContext] Heartbeat: No token, skipping validation');
            return;
        }

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            const response = await fetch(`${apiUrl}/auth/validate-session`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // If session is invalid (401), force logout
            if (response.status === 401) {
                console.log('[SessionContext] Heartbeat: Session invalid, forcing logout');
                handleForceLogout('Your session has expired or been invalidated. Please log in again.');
            }
        } catch (error) {
            // Network error - don't logout, let the user retry
            console.warn('[SessionContext] Heartbeat: Network error during validation', error);
        }
    }, [handleForceLogout]);

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
         * Handle force-logout event from server (immediate via WebSocket).
         * This is triggered when device limit is exceeded.
         */
        socket.on('force-logout', (data: { reason: string }) => {
            console.log('[SessionContext] Force logout received via Socket:', data.reason);
            handleForceLogout(data.reason);
        });

        /**
         * Start heartbeat interval to periodically validate session.
         * This catches cases where Socket.io events are missed (inactive tabs, connection drops).
         */
        console.log(`[SessionContext] Starting session heartbeat (every ${HEARTBEAT_INTERVAL_MS / 1000}s)`);
        heartbeatIntervalRef.current = window.setInterval(validateSession, HEARTBEAT_INTERVAL_MS);

        // Cleanup on unmount
        return () => {
            console.log('[SessionContext] Cleaning up socket and heartbeat');
            socket.disconnect();
            socketRef.current = null;

            if (heartbeatIntervalRef.current) {
                clearInterval(heartbeatIntervalRef.current);
                heartbeatIntervalRef.current = null;
            }
        };
    }, [navigate, toast, handleForceLogout, validateSession]);

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
