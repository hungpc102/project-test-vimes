/**
 * Order Number Generator for TypeScript
 */

import logger from '../config/logger';
import { OrderNumberOptions } from '../types';

/**
 * Generate order number with specified prefix
 */
export const generateOrderNumber = async (
    prefix: string = 'IO', 
    options: OrderNumberOptions = {}
): Promise<string> => {
    try {
        const {
            dateFormat = 'YYYYMMDD',
            sequenceLength = 4,
            separator = '-',
            useWarehouseCode = false,
            warehouseCode = null
        } = options;

        // Get current date
        const now = new Date();
        const dateString = formatDate(now, dateFormat);

        // Build base pattern
        let basePattern = prefix;
        
        if (useWarehouseCode && warehouseCode) {
            basePattern += separator + warehouseCode;
        }
        
        basePattern += separator + dateString;

        // Get last order number with this pattern
        const { ImportOrderRepository } = await import('../repositories/ImportOrderRepository');
        const { pool } = await import('../config/database');
        const importOrderRepo = new ImportOrderRepository(pool);
        const lastOrderNumber = await importOrderRepo.getLastOrderNumber(basePattern);

        let sequence = 1;

        if (lastOrderNumber) {
            // Extract sequence number from last order
            const parts = lastOrderNumber.split(separator);
            const lastSequence = parseInt(parts[parts.length - 1]) || 0;
            sequence = lastSequence + 1;
        }

        // Format sequence with leading zeros
        const sequenceString = sequence.toString().padStart(sequenceLength, '0');

        // Combine all parts
        const orderNumber = basePattern + separator + sequenceString;

        logger.info('Order number generated', {
            prefix,
            pattern: basePattern,
            sequence,
            orderNumber
        });

        return orderNumber;

    } catch (error) {
        logger.error('Error generating order number', {
            error: error instanceof Error ? error.message : 'Unknown error',
            prefix,
            options
        });
        
        // Fallback to timestamp-based generation
        return generateFallbackOrderNumber(prefix);
    }
};

/**
 * Generate fallback order number using timestamp
 */
export const generateFallbackOrderNumber = (prefix: string = 'IO'): string => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-FB-${timestamp}-${random}`;
};

/**
 * Format date according to specified format
 */
export const formatDate = (date: Date, format: string): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');

    switch (format.toUpperCase()) {
        case 'YYYYMMDD':
            return `${year}${month}${day}`;
        case 'YYYY-MM-DD':
            return `${year}-${month}-${day}`;
        case 'YYYYMM':
            return `${year}${month}`;
        case 'YYYY-MM':
            return `${year}-${month}`;
        case 'YYYY':
            return year.toString();
        case 'YYYYMMDDHHMMSS':
            return `${year}${month}${day}${hour}${minute}${second}`;
        case 'YYYYMMDDHHMM':
            return `${year}${month}${day}${hour}${minute}`;
        default:
            return `${year}${month}${day}`;
    }
};

/**
 * Validate order number format
 */
export const validateOrderNumber = (
    orderNumber: string, 
    expectedPrefix: string | null = null
): boolean => {
    if (!orderNumber || typeof orderNumber !== 'string') {
        return false;
    }

    // Basic format validation
    const parts = orderNumber.split('-');
    
    if (parts.length < 3) {
        return false;
    }

    // Check prefix if provided
    if (expectedPrefix && parts[0] !== expectedPrefix) {
        return false;
    }

    // Check if last part is numeric (sequence)
    const lastPart = parts[parts.length - 1];
    if (!/^\d+$/.test(lastPart)) {
        return false;
    }

    return true;
};

/**
 * Parse order number components
 */
export const parseOrderNumber = (orderNumber: string): {
    full: string;
    prefix: string;
    warehouseCode: string | null;
    date: string;
    sequence: number;
    parts: string[];
} => {
    if (!validateOrderNumber(orderNumber)) {
        throw new Error('Invalid order number format');
    }

    const parts = orderNumber.split('-');
    
    return {
        full: orderNumber,
        prefix: parts[0],
        warehouseCode: parts.length > 3 ? parts[1] : null,
        date: parts.length > 3 ? parts[2] : parts[1],
        sequence: parseInt(parts[parts.length - 1]),
        parts
    };
}; 