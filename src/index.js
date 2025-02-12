import { TEMP_UPLOAD_DIR, UPLOAD_DIR } from './constants/uploadDir.js';
import { initMongoDB } from './db/initMongoDB.js';
import { startServer } from './server.js';
import { createDirIfNotExists } from './utils/createDirIfNotExists.js';

// Функція bootstrap ініціалізує підключення до бази даних, після чого запускає сервер
const bootstrap = async () => {
  try {
    await initMongoDB();
    await createDirIfNotExists(TEMP_UPLOAD_DIR);
    await createDirIfNotExists(UPLOAD_DIR);
    startServer();
  } catch (err) {
    console.error('❌ Error during initialization:', err);
    process.exit(1); // Завершуємо процес з кодом помилки
  }
};

bootstrap();
