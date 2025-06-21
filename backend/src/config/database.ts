/**
 * Database Configuration Module
 */

import { Pool, PoolClient, QueryResult } from 'pg';
import logger from './logger';
import { DatabaseConfig } from '../types';

/**
 * Database configuration object
 */
const dbConfig: DatabaseConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'warehouse_management',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '130900',
    max: parseInt(process.env.DB_MAX_POOL || '20'),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000'),
    ssl: process.env.DB_SSL === 'true' || false
};

/**
 * PostgreSQL connection pool configuration
 */
const poolConfig = {
    ...dbConfig,
    statement_timeout: 30000,
    query_timeout: 30000,
    application_name: 'warehouse_management_api'
};

/**
 * PostgreSQL connection pool instance
 */
const pool: Pool = new Pool(poolConfig);

/**
 * Pool error handling
 */
pool.on('error', (err: Error, client: PoolClient): void => {
    logger.error('Unexpected error on idle client', err);
    process.exit(-1);
});

pool.on('connect', (client: PoolClient): void => {
    logger.info('Database client connected');
});

pool.on('acquire', (client: PoolClient): void => {
    logger.debug('Database client acquired from pool');
});

pool.on('remove', (client: PoolClient): void => {
    logger.debug('Database client removed from pool');
});

/**
 * Test database connection
 * @returns {Promise<boolean>} Connection status
 */
export const testConnection = async (): Promise<boolean> => {
    try {
        const client: PoolClient = await pool.connect();
        const result: QueryResult = await client.query('SELECT NOW()');
        client.release();
        logger.info('Database connection test successful', {
            timestamp: result.rows[0].now,
            database: dbConfig.database,
            host: dbConfig.host
        });
        return true;
    } catch (error) {
        logger.error('Database connection test failed', error);
        return false;
    }
};

/**
 * Query object interface
 */
interface QueryObject {
    text: string;
    params?: any[];
    operation?: string;
}

/**
 * Execute a query with error handling and logging
 * @param {string} text - SQL query text
 * @param {any[]} params - Query parameters
 * @param {string} operation - Operation description for logging
 * @returns {Promise<QueryResult>} Query result
 */
export const query = async (
    text: string, 
    params: any[] = [], 
    operation: string = 'Query'
): Promise<QueryResult> => {
    const start: number = Date.now();
    const client: PoolClient = await pool.connect();
    
    try {
        logger.debug('Executing database query', {
            operation,
            query: text,
            params: params.length > 0 ? '[PARAMS_PROVIDED]' : 'NO_PARAMS'
        });
        
        const result: QueryResult = await client.query(text, params);
        const duration: number = Date.now() - start;
        
        logger.debug('Database query completed', {
            operation,
            duration: `${duration}ms`,
            rowCount: result.rowCount
        });
        
        return result;
    } catch (error) {
        const duration: number = Date.now() - start;
        logger.error('Database query failed', {
            operation,
            duration: `${duration}ms`,
            error: error instanceof Error ? error.message : 'Unknown error',
            query: text
        });
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Execute multiple queries in a transaction
 * @param {QueryObject[]} queries - Array of query objects {text, params, operation}
 * @returns {Promise<QueryResult[]>} Array of query results
 */
export const transaction = async (queries: QueryObject[]): Promise<QueryResult[]> => {
    const client: PoolClient = await pool.connect();
    const results: QueryResult[] = [];
    
    try {
        await client.query('BEGIN');
        logger.debug('Transaction started', { queryCount: queries.length });
        
        for (const queryObj of queries) {
            const { text, params = [], operation = 'Transaction Query' } = queryObj;
            const start: number = Date.now();
            
            const result: QueryResult = await client.query(text, params);
            const duration: number = Date.now() - start;
            
            logger.debug('Transaction query completed', {
                operation,
                duration: `${duration}ms`,
                rowCount: result.rowCount
            });
            
            results.push(result);
        }
        
        await client.query('COMMIT');
        logger.debug('Transaction committed successfully');
        
        return results;
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Transaction rolled back due to error', {
            error: error instanceof Error ? error.message : 'Unknown error',
            queryCount: queries.length
        });
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Pool statistics interface
 */
interface PoolStats {
    totalCount: number;
    idleCount: number;
    waitingCount: number;
}

/**
 * Get database pool statistics
 * @returns {PoolStats} Pool statistics
 */
export const getPoolStats = (): PoolStats => {
    return {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount
    };
};

/**
 * Gracefully close database connections
 * @returns {Promise<void>}
 */
export const closePool = async (): Promise<void> => {
    try {
        await pool.end();
        logger.info('Database pool closed successfully');
    } catch (error) {
        logger.error('Error closing database pool', error);
        throw error;
    }
};

/**
 * Export configuration for logging (password hidden)
 */
export const safeDbConfig = {
    ...dbConfig,
    password: '***' // Hide password in logs
};

export { pool };
export default pool; 