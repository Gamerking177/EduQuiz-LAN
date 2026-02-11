import { Router } from 'express';
import gameRoutes from './modules/game/game.routes.js';
import questionRoutes from './modules/question/question.routes.js';

const router = Router();
router.use('/game', gameRoutes);
router.use('/questions', questionRoutes);

export default router;
