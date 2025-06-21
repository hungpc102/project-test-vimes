import { Router } from 'express';

const router = Router();

router.get('/health', (req, res) => {
    res.json({ status: 'auth module healthy' });
});

export default router; 