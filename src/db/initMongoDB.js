import mongoose from 'mongoose';
import { getEnvVar } from '../utils/getEnvVar.js';
import { ENV_VARS } from '../constants/env.js';

// Функція підключення до створеної бази даних
export const initMongoDB = async () => {
	try {
		// Використаємо утилітарну функцію getEnvVar, яка забезпечує доступ до змінних оточення
		const user = getEnvVar(ENV_VARS.MONGODB_USER);
		const pwd = getEnvVar(ENV_VARS.MONGODB_PASSWORD);
		const url = getEnvVar(ENV_VARS.MONGODB_URL);
		const db = getEnvVar(ENV_VARS.MONGODB_DB);

		const connectionURI = `mongodb+srv://${user}:${pwd}@${url}/${db}?retryWrites=true&w=majority`;

		// Щоб приєднатися до бази даних виконаємо виклик методу connect з бібліотеки mongoose,
		// до якого як аргумент передамо рядок з посиланням для підключення (connection string)
		await mongoose.connect(connectionURI);

		console.log('Mongo connection successfully established!');
	} catch (err) {
		console.error('Error while setting up mongo connection', err);
		// throw err; (конспект)
		process.exit(1); // (лекція) - звершуємо процесс, щоб додаток не працював коли сталася помилка під'єднання до базі даніх
	}
};
