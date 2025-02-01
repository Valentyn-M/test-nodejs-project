// Тут будемо зберігати налаштування роутингу для взаємодії з колекцією students

// Імпортуємо Router з Express, щоб створити об'єкт роутера router
import { Router } from 'express';
import {
  createStudentController,
  deleteStudentController,
  getStudentByIdController,
  getStudentsController,
  patchStudentController,
  upsertStudentController,
} from '../controllers/students.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  createStudentSchema,
  updateStudentSchema,
} from '../validation/students.js';
import { isValidId } from '../middlewares/isValidId.js';

// router — це об'єкт, який дозволяє групувати маршрути та їх обробники (middleware) у логічні групи
const router = Router();

// ==========================================================================================================================

// Використаймо функції сервісу студентів в контролерах, тобто функціях для обробки запитів
// /students - маршрут для отримання колекції всіх студентів
router.get('/students', ctrlWrapper(getStudentsController));

// /students/:studentId - маршрут для отримання студента за його id
router.get(
  '/students/:studentId',
  isValidId,
  ctrlWrapper(getStudentByIdController)
);

// /students - маршрут для створення студентів
router.post(
  '/students',
  validateBody(createStudentSchema),
  ctrlWrapper(createStudentController)
);

// PUT /students/:studentId
router.put(
  '/students/:studentId',
  isValidId,
  validateBody(updateStudentSchema),
  ctrlWrapper(upsertStudentController)
);

// PATCH /students/:studentId
router.patch(
  '/students/:studentId',
  isValidId,
  validateBody(updateStudentSchema),
  ctrlWrapper(patchStudentController)
);

// /students/:studentId - маршрут для отримання студента за його id
router.delete(
  '/students/:studentId',
  isValidId,
  ctrlWrapper(deleteStudentController)
);

// ==========================================================================================================================

// Експортуємо наш об'єкт роутера router
export default router;
