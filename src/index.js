import { initMongoDB } from "./db/initMongoDB.js";
import { startServer } from "./server.js";

// Функція bootstrap ініціалізує підключення до бази даних, після чого запускає сервер
const bootstrap = async () => {
	await initMongoDB();
	startServer();
};
bootstrap();
