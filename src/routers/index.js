import { Router } from 'express';
import studentsRouter from './students.js';
import authRouter from './auth.js';

const router = Router();

// /students - маршрут для отримання колекції всіх студентів
router.use('/students', studentsRouter);
// /auth - маршрут для отримання колекції всіх користувачiв
router.use('/auth', authRouter);

export default router;
