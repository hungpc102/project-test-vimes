import { Router } from 'express';
import { pool } from '../config/database';

const router = Router();

/**
 * @route GET /api/v1/warehouses
 * @desc Get all warehouses from database
 */
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                w.id,
                w.code,
                w.name,
                w.address,
                w.phone,
                w.manager_id,
                w.organization_name,
                w.department,
                w.is_active,
                w.created_at,
                w.updated_at,
                u.full_name as manager_name
            FROM warehouses w
            LEFT JOIN users u ON w.manager_id = u.id
            WHERE w.is_active = true
            ORDER BY w.name
        `;

        const result = await pool.query(query);

        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            data: result.rows,
            message: 'Warehouses retrieved successfully',
            meta: {
                total: result.rows.length,
                page: 1,
                limit: 50
            }
        });

    } catch (error: any) {
        console.error('Error fetching warehouses:', error);
        res.status(500).json({
            success: false,
            timestamp: new Date().toISOString(),
            error: {
                message: 'Failed to fetch warehouses',
                code: 'DATABASE_ERROR',
                statusCode: 500
            }
        });
    }
});

/**
 * @route GET /api/v1/warehouses/health
 * @desc Health check for warehouses module
 */
router.get('/health', (req, res) => {
    res.json({ 
        status: 'warehouses module healthy',
        timestamp: new Date().toISOString()
    });
});

export default router; 