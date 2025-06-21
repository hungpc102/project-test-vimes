import { Router } from 'express';

const router = Router();

router.get('/health', (req, res) => {
    res.json({ status: 'inventory module healthy' });
});

export default router; 