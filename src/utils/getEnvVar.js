import dotenv from 'dotenv';

// Щоб зчитувати та використовувати змінні оточення в додатку. Ініціалізуємо пакет dotenv у додатку
dotenv.config();

// Функція, яка перевірятиме наявність змінної оточення і генеруватиме помилку, якщо змінна не встановлена.
export function getEnvVar(envVarName, defaultValue) {

	// Для доступу до змінних оточення в середовищі Node.js використовується глобальний об'єкт process.env, який доступний у коді будь-якого модуля
	// Читаємо змінну оточення envVarName (наприклад PORT), яка має бути строкою (string) при виклику функції
	const envVar = process.env[envVarName];

	if (envVar) return envVar;

	if (defaultValue) return defaultValue;

	throw new Error(`Missing: process.env['${envVarName}'].`);
}

// Використати її ми можемо, наприклад, в такому вигляді: env('PORT', '3000');
// Якщо змінної оточення з такою назвою не було вказано і не було передано дефолтного значення,
// то виклик цієї функції викине помилку з повідомленням Missing: process.env['PORT'].
