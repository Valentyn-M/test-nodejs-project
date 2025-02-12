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
import { authenticate } from '../middlewares/authenticate.js';
import { checkRoles } from '../middlewares/checkRoles.js';
import { ROLES } from '../constants/roles.js';
import { upload } from '../middlewares/multer.js';

// router — це об'єкт, який дозволяє групувати маршрути та їх обробники (middleware) у логічні групи
const router = Router();

// Застосовуємо middleware для аутентифікації
router.use(authenticate);

// ==========================================================================================================================

// Використаймо функції сервісу студентів в контролерах, тобто функціях для обробки запитів

// Маршрут "/students" винесено в оеремий файл index.js

router.get('/', checkRoles(ROLES.TEACHER), ctrlWrapper(getStudentsController));

// /students/:studentId - маршрут для отримання студента за його id
router.get(
  '/:studentId',
  checkRoles(ROLES.TEACHER, ROLES.PARENT),
  isValidId,
  ctrlWrapper(getStudentByIdController)
);

// /students - маршрут для створення студентів
router.post(
  '/',
  checkRoles(ROLES.TEACHER),
  upload.single('photo'),
  validateBody(createStudentSchema),
  ctrlWrapper(createStudentController)
);

// PUT /students/:studentId
router.put(
  '/:studentId',
  checkRoles(ROLES.TEACHER),
  isValidId,
  upload.single('photo'),
  validateBody(updateStudentSchema),
  ctrlWrapper(upsertStudentController)
);

// PATCH /students/:studentId
router.patch(
  '/:studentId',
  checkRoles(ROLES.TEACHER, ROLES.PARENT),
  isValidId,
  upload.single('photo'),
  validateBody(updateStudentSchema),
  ctrlWrapper(patchStudentController)
);

// /students/:studentId - маршрут для отримання студента за його id
router.delete(
  '/:studentId',
  checkRoles(ROLES.TEACHER),
  isValidId,
  ctrlWrapper(deleteStudentController)
);

// ==========================================================================================================================

// Експортуємо наш об'єкт роутера router
export default router;
