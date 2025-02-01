import {
  createStudent,
  deleteStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
} from '../services/students.js';
// Імпортуємо функцію з бібліотеки
import createHttpError from 'http-errors';
import { parsePaginationParams } from '../utils/parsePaginationsParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';
// ==========================================================================================================================

// Функції сервісу студентів, тобто функції для обробки запитів
// /students - маршрут для отримання колекції всіх студентів
export const getStudentsController = async (req, res, next) => {
  // try...catch із шаблонним кодом виклику next(err) перенесено у допоміжну функцію-обгортку ctrlWrapper, яка викликається в файлу server.js
  // try {

  // Отримуємо значення для Пагінації
  const { page, perPage } = parsePaginationParams(req.query);

  // Отримуємо значення для Сортування
  const { sortBy, sortOrder } = parseSortParams(req.query);

  // Отримуємо значення для Фільтрації
  const filter = parseFilterParams(req.query);

  // Отримані значення з квері-параметрів передаємо далі до сервісу
  const students = await getAllStudents({
    page,
    perPage,
    sortBy,
    sortOrder,
    filter,
  });

  res.json({
    status: 200,
    message: 'Successfully found students!',
    data: students,
  });
  // } catch (err) {
  //   next(err);
  // }
};

// ==========================================================================================================================

// /students/:studentId - маршрут для отримання студента за його id
export const getStudentByIdController = async (req, res, next) => {
  // Властивість params на об'єкті запиту req містить об'єкт динамічних параметрів маршруту, де кожне ім'я параметру відповідає властивості у цьому об'єкті, а значення, передане у URL, стає значенням цієї властивості.
  // const { studentId } = req.params;
  const studentId = req.params.studentId;
  const student = await getStudentById(studentId);

  // Відповідь, якщо студента не знайдено
  if (!student) {
    // Після виклику next, обробник помилок в нашому додатку (error middleware) у файлі server.js, перехопить і опрацює цю помилку
    // next(new Error("Student not found")); // Створюємо об’єкт помилки
    // Щоб сервер продовжував працювати обов'язково додаємо return, щоб у разі помилки припинити виконання подальшого коду у контролері
    // return;

    // Створюємо та налаштовуємо помилку через пакет http-errors
    throw createHttpError(404, 'Student not found');
  }

  // Відповідь, якщо студента знайдено
  res.status(200).json({
    status: 200,
    mwssage: `Student found with id ${studentId}`,
    data: student,
  });
};

// ==========================================================================================================================

// POST /students
export const createStudentController = async (req, res) => {
  const student = await createStudent(req.body);

  res.status(201).json({
    status: 201,
    mwssage: `Successfully created a student!`,
    data: student,
  });
};

// ==========================================================================================================================

// PUT '/students/:studentId'
// "upsert": "update" (оновити) та "insert" (вставити) - означає операцію в базах даних, яка вставляє новий запис, якщо він не існує, або оновлює існуючий запис, якщо він вже є.
export const upsertStudentController = async (req, res, next) => {
  const studentId = req.params.studentId;

  // Для того, щоб функція updateStudent могла не тільки оновлювати, але й створювати ресурс при його відсутності, необхідно їй аргументом додатково передати в 3-й параметр { upsert: true }.
  const result = await updateStudent(studentId, req.body, {
    upsert: true,
  });

  // Відповідь, якщо студента не знайдено
  if (!result) {
    next(createHttpError(404, 'Student not found'));
    return;
  }

  // Якщо створено нового студента віддаємо код 201
  // Якщо оновлено діючого студента віддаємо код 200
  const status = result.isNew ? 201 : 200;

  res.status(status).json({
    status,
    message: `Successfully upserted a student!`,
    data: result.student,
  });
};

// ==========================================================================================================================

// PATCH /students/:studentId
// Від PUT методу PATCH відрізняється якраз тим, що ми можемо оновити якесь окреме поле, а не весь ресурс в цілому
export const patchStudentController = async (req, res, next) => {
  const studentId = req.params.studentId;

  const result = await updateStudent(studentId, req.body);

  // Відповідь, якщо студента не знайдено
  if (!result) {
    next(createHttpError(404, 'Student not found'));
    return;
  }

  res.status(200).json({
    status: 200,
    message: `Successfully patched a student!`,
    data: result.student,
  });
};

// ==========================================================================================================================

// DELETE /students/:studentId
export const deleteStudentController = async (req, res, next) => {
  const studentId = req.params.studentId;
  const student = await deleteStudent(studentId);

  // Відповідь, якщо студента не знайдено
  if (!student) {
    next(createHttpError(404, 'Student not found'));
    return;
  }

  // res.status(202).send();
  res.status(202).json({
    status: 202,
    mwssage: `Student deleted successfuly!`,
    data: student,
  });
};
