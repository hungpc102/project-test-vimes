import { Router } from 'express';
import { pool } from '../config/database';

const router = Router();

/**
 * @route GET /api/v1/products
 * @desc Get all products from database
 */
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id,
                p.code,
                p.name,
                p.description,
                p.category_id,
                p.unit,
                p.cost_price,
                p.selling_price,
                p.min_stock,
                p.max_stock,
                p.is_active,
                p.created_at,
                p.updated_at,
                c.name as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.is_active = true
            ORDER BY p.name
        `;

        const result = await pool.query(query);

        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            data: result.rows,
            message: 'Products retrieved successfully',
            meta: {
                total: result.rows.length,
                page: 1,
                limit: 50
            }
        });

    } catch (error: any) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            timestamp: new Date().toISOString(),
            error: {
                message: 'Failed to fetch products',
                code: 'DATABASE_ERROR',
                statusCode: 500
            }
        });
    }
});

/**
 * @route GET /api/v1/products/health
 * @desc Health check for products module
 */
router.get('/health', (req, res) => {
    res.json({ 
        status: 'products module healthy',
        timestamp: new Date().toISOString()
    });
});

export default router; 