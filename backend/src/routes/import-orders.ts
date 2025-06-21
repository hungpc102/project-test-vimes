/**
 * Import Orders Routes - Database Fields Only
 */

import { Router, Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { ImportOrderController } from '../controllers/ImportOrderController';
import validationErrorHandler from '../middlewares/validationErrorHandler';

const router = Router();

/**
 * @route GET /api/v1/import-orders
 * @desc Get all import orders with filtering and pagination
 */
router.get(
    '/',
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('warehouse_id').optional().isUUID(),
    query('supplier_id').optional().isUUID(),
    query('status').optional().isIn(['draft', 'pending', 'partial', 'received', 'cancelled']),
    query('search').optional().isString(),
    validationErrorHandler,
    async (req: Request, res: Response) => {
        const controller = new ImportOrderController();
        await controller.getImportOrders(req, res, () => {});
    }
);

/**
 * @route GET /api/v1/import-orders/:id
 * @desc Get import order by ID - Database fields only
 */
router.get(
    '/:id',
    param('id').isUUID().withMessage('Import order ID must be a valid UUID'),
    validationErrorHandler,
    async (req: Request, res: Response) => {
        const controller = new ImportOrderController();
        await controller.getById(req, res);
    }
);

/**
 * @route POST /api/v1/import-orders
 * @desc Create new import order
 */
router.post(
    '/',
    body('warehouse_id').isUUID().withMessage('Warehouse ID must be a valid UUID'),
    body('supplier_id').isUUID().withMessage('Supplier ID must be a valid UUID'),
    body('created_by').optional().isString().withMessage('Created by must be a string'),
    body('items').isArray({ min: 1 }).withMessage('Items must be a non-empty array'),
    body('items.*.product_id').isUUID().withMessage('Product ID must be a valid UUID'),
    body('items.*.quantity_ordered').isInt({ min: 1 }).withMessage('Quantity ordered must be positive integer'),
    body('items.*.unit_price').isFloat({ min: 0 }).withMessage('Unit price must be positive number'),
    validationErrorHandler,
    async (req: Request, res: Response) => {
        const controller = new ImportOrderController();
        await controller.createImportOrder(req, res, () => {});
    }
);

/**
 * @route PUT /api/v1/import-orders/:id
 * @desc Update import order by ID
 */
router.put(
    '/:id',
    param('id').isUUID().withMessage('Import order ID must be a valid UUID'),
    body('warehouse_id').optional().isUUID().withMessage('Warehouse ID must be a valid UUID'),
    body('supplier_id').optional().isUUID().withMessage('Supplier ID must be a valid UUID'),
    body('status').optional().isIn(['draft', 'pending', 'partial', 'received', 'cancelled']).withMessage('Invalid status'),
    body('items').optional().isArray().withMessage('Items must be an array'),
    body('items.*.product_id').optional().isUUID().withMessage('Product ID must be a valid UUID'),
    body('items.*.quantity_ordered').optional().isInt({ min: 1 }).withMessage('Quantity ordered must be positive integer'),
    body('items.*.unit_price').optional().isFloat({ min: 0 }).withMessage('Unit price must be positive number'),
    validationErrorHandler,
    async (req: Request, res: Response) => {
        const controller = new ImportOrderController();
        await controller.updateImportOrder(req, res, () => {});
    }
);

/**
 * @route PATCH /api/v1/import-orders/:id/status
 * @desc Update import order status
 */
router.patch(
    '/:id/status',
    param('id').isUUID().withMessage('Import order ID must be a valid UUID'),
    body('status').isIn(['draft', 'pending', 'partial', 'received', 'cancelled']).withMessage('Invalid status'),
    validationErrorHandler,
    async (req: Request, res: Response) => {
        const controller = new ImportOrderController();
        await controller.updateImportOrderStatus(req, res, () => {});
    }
);

/**
 * @route DELETE /api/v1/import-orders/:id
 * @desc Delete import order by ID
 */
router.delete(
    '/:id',
    param('id').isUUID().withMessage('Import order ID must be a valid UUID'),
    validationErrorHandler,
    async (req: Request, res: Response) => {
        const controller = new ImportOrderController();
        await controller.deleteImportOrder(req, res, () => {});
    }
);

export default router; 