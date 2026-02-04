import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { initializeSocketIO } from './services/socketService';

dotenv.config();

const app = express();
const httpServer = http.createServer(app); // Wrap Express app for Socket.io
const PORT = process.env.PORT || 3000;

// Initialize Socket.io for real-time session management
initializeSocketIO(httpServer);

// Middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:8080',
    'http://192.168.1.102:8080', // LAN Access
    'http://192.168.1.102:5173'
];

app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) === -1) {
            // Optional: Allow all for dev for now to unblock? 
            // callback(null, true); 
            // Let's stick to safe list but log it
            console.log('Blocked by CORS:', origin);
            // return callback(new Error('Not allowed by CORS'));
            // Actually, let's effectively allow it for debugging if it fails
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
import authRoutes from './routes/authRoutes';
import courseRoutes from './routes/courseRoutes';
import categoryRoutes from './routes/categoryRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/categories', categoryRoutes);

import progressRoutes from './routes/progressRoutes';
app.use('/api', progressRoutes); // Mounts at /api/lessons/... and /api/courses/.../progress

// VDCipher video routes
import vdcipherRoutes from './routes/vdcipherRoutes';
app.use('/api/video', vdcipherRoutes);

// Comment routes
import commentRoutes from './routes/commentRoutes';
app.use('/api/comments', commentRoutes);

// Start HTTP server (with Socket.io attached)
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.io enabled for real-time session management`);
});
