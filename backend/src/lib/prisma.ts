/**
 * Shared PrismaClient Singleton
 * 
 * Prevents multiple PrismaClient instances which can exhaust database connections.
 * In development with hot-reload, attaches to global to persist across reloads.
 * 
 * @module lib/prisma
 */

import { PrismaClient } from '@prisma/client';

// Extend global type to include prisma instance
declare global {
    var prisma: PrismaClient | undefined;
}

/**
 * Singleton PrismaClient instance.
 * Uses global attachment in development to survive hot-reloads.
 * Creates new instance in production for clean state.
 */
export const prisma = globalThis.prisma || new PrismaClient({
    log: process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error']
});

// Attach to global in non-production to prevent multiple instances during hot-reload
if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma;
}

export default prisma;
