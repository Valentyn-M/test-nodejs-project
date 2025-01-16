// Імпортуємо функцію express з бібліотеки express
import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import { getEnvVar } from './utils/getEnvVar.js';
import { ENV_VARS } from './constants/env.js';
import { getAllStudents, getStudentById } from './services/students.js';

// Отриуємо змінну оточення PORT за допомогою утилітарної функції getEnvVar
const PORT = Number(getEnvVar(ENV_VARS.PORT, 3000));

export const startServer = () => {
	// Ініціалізуємо Express-додаток (сервер) викликом функції express() і зберігти його у змінній app
	const app = express();

	// Для включення middleware в наш застосунок потрібно на сервері викликати метод use

	// Вбудований у express middleware для обробки (парсингу) JSON-даних у запитах, наприклад, у запитах POST або PATCH
	// Цей middleware перевіряє, чи дані, які надійшли на сервер, у форматі JSON, і якщо так, розпаковує (парсить) їх
	app.use(express.json());

	// Додаємо CORS до свого Express додатку як middleware
	app.use(cors());

	// Pino надає нам middleware і можливість додатково налаштовувати логгер через об’єкт властивостей.
	// Middleware для логування, такий як pino-http, слід розташовувати якомога раніше у ланцюгу middleware, щоб він міг логувати всі вхідні запити до вашого додатку, а також відповіді та можливі помилки, що виникають під час обробки цих запитів. Це означає, що pino повинен бути одним з перших мідлварів, які ви додаєте до екземпляру app.
	app.use(
		pino({
			transport: {
				target: 'pino-pretty',
			}
		})
	);

	// Запуск сервера. Метод сервера listen має 2 аргументи (1. номер порту, на якому ми хочемо його запустити; 2. колбек-функція, що виконається, коли сервер успішно запуститься)
	app.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}`);
	});

	// ==========================================================================================================================

	// Маршрут для GET-запиту та обробник для нього:
	// 1-й аргумент — шлях до ресурсу, наприклад '/', що представляє кореневий маршрут сервісу
	// 2-й аргумент — функція-обробник (request handler), яка виконується кожен раз, коли сервер отримує GET-запит на вказаний шлях (req - об’єкт запиту і містить повну інформацію про запит; res - об’єкт для формування відповіді)
	app.get('/', (req, res) => {
		res.json({
			message: 'Hello Node.js!',
		});
	});

	// Використаймо функції сервісу студентів в контролерах
	// /students - маршрут для отримання колекції всіх студентів
	app.get('/students', async (req, res) => {
		const students = await getAllStudents();

		res.status(200).json({
			data: students,
		});
	});

	// /students/:studentId - маршрут для отримання студента за його id
	app.get('/students/:studentId', async (req, res) => {
		// Властивість params на об'єкті запиту req містить об'єкт динамічних параметрів маршруту, де кожне ім'я параметру відповідає властивості у цьому об'єкті, а значення, передане у URL, стає значенням цієї властивості.
		// const { studentId } = req.params;
		const studentId = req.params.studentId;
		const student = await getStudentById(studentId);

		// Відповідь, якщо студента не знайдено
		if (!student) {
			res.status(404).json({
				message: 'Student not found',
			});
			return;
		}

		// Відповідь, якщо студента знайдено
		res.status(200).json({
			data: student,
		});
	});

	// ==========================================================================================================================

	// Для включення middleware в наш застосунок потрібно на сервері викликати метод use, передавши йому:
	// 1-й аргумент - paths (визначає шляхи, до яких буде застосований цей middleware)
	// 2-й аргумент - власне сам middleware:
	// - err - помилка (цей аргумент вказуємо тільки для ErrorMiddleware - спеціалізована функція для обробки помилок)
	// - req - об'єкт запиту
	// - res - об'єкт відповіді
	// - next - функція, яка викликається, щоб передати обробку наступному middleware у ланцюжку
	// Якщо до виклику app.use не передати перший аргумент зі шляхом, то тоді middleware буде застосований до всіх можливих роутів (маршрутів) на сервері
	// app.use((req, res, next) => {
	// 	console.log(`Time: ${new Date().toLocaleString()}`);
	// 	next();
	// });

	// middleware для обробки випадку, коли клієнт звертається до неіснуючого маршруту, тобто до якогось URL, який наш сервіс не підтримує і ніяк його не опрацьовує.
	// !!! Він додається завжди самим останнім, після всіх інших middleware та маршрутів, тому що він призначений для обробки помилок, які виникають під час обробки запитів і виконання інших middleware або обробників маршрутів.
	app.use('*', (req, res, next) => {
		res.status(404).json({
			message: 'Route not found',
		});
	});

	// Middleware для обробких помилок (приймає 4 аргументи), зокрема, для випадків, коли виникає помилка, яку не було передбачено (так звані 500-ті помилки).

	app.use((err, req, res, next) => {
		res.status(500).json({
			message: 'Something went wrong',
			error: err.message,
		});
	});

};
