/**
 * Main Application Entry Point
 */

import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction, Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import logger from './config/logger';
import { testConnection } from './config/database';

// Import routes
import importOrderRoutes from './routes/import-orders';
import supplierRoutes from './routes/suppliers';
import warehouseRoutes from './routes/warehouses';
import productRoutes from './routes/products';

// Import middlewares
import { errorHandler } from './middlewares/errorHandler';
import notFoundHandler from './middlewares/notFoundHandler';

/**
 * Express application instance
 */
const app: Application = express();

/**
 * Basic Security Middleware
 */
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

/**
 * Simple CORS Configuration
 */
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

/**
 * Request Parsing Middleware
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Root Route
 */
app.get('/', (req: Request, res: Response): void => {
    res.json({
        success: true,
        message: 'Warehouse Management API Server',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

/**
 * Simple Health Check
 */
app.get('/health', async (req: Request, res: Response): Promise<void> => {
    try {
        const dbStatus: boolean = await testConnection();
        res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: dbStatus ? 'connected' : 'disconnected'
        });
    } catch (error) {
        logger.error('Health check failed', error);
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Service unavailable'
        });
    }
});

/**
 * API Routes
 */
app.use('/api/v1/import-orders', importOrderRoutes);
app.use('/api/v1/suppliers', supplierRoutes);
app.use('/api/v1/warehouses', warehouseRoutes);
app.use('/api/v1/products', productRoutes);

/**
 * Error Handling Middleware
 */
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Start Server
 */
const PORT = process.env.PORT || 3000;

const startServer = async (): Promise<void> => {
    try {
        // Test database connection first
        const dbConnected = await testConnection();
        if (!dbConnected) {
            throw new Error('Database connection failed');
        }

        const server = app.listen(PORT, (): void => {
            logger.info(`🚀 Server running on port ${PORT}`, {
                port: PORT,
                environment: process.env.NODE_ENV || 'development',
                database: 'connected'
            });
            
            logger.info('Server endpoints available', {
                server: `http://localhost:${PORT}`,
                health: `http://localhost:${PORT}/health`,
                api: `http://localhost:${PORT}/api/v1/import-orders`
            });
        });

        // Graceful shutdown
        const gracefulShutdown = (signal: string): void => {
            logger.info(`Received ${signal}. Starting graceful shutdown...`);
            server.close((): void => {
                logger.info('HTTP server closed');
                process.exit(0);
            });
        };

        process.on('SIGTERM', (): void => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', (): void => gracefulShutdown('SIGINT'));

    } catch (error: any) {
        logger.error('Failed to start server', {
            error: error.message,
            stack: error.stack
        });
        process.exit(1);
    }
};

// Only start server if this file is run directly
if (require.main === module) {
    startServer();
}

export default app; 