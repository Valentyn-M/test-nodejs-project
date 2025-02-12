import cloudinary from 'cloudinary';
import fs from 'node:fs/promises';
import { getEnvVar } from './getEnvVar.js';
import { ENV_VARS } from '../constants/env.js';

// Утиліта буде отримувати файл, передавати його до cloudinary і повертати посилання на цей файл у cloudinary

// Налаштовуємо з'єднання з Cloudinary, використовуючи параметри конфігурації, такі як:
// - ім'я хмари
// - API-ключ
// - API-секрет,
// які зчитуються із змінних середовища
cloudinary.v2.config({
  secure: true,
  cloud_name: getEnvVar(ENV_VARS.CLOUD_NAME),
  api_key: getEnvVar(ENV_VARS.API_KEY),
  api_secret: getEnvVar(ENV_VARS.API_SECRET),
});

// Асинхронна функція для збереження файлів.
// Вона приймає файл, завантажує його на сервер Cloudinary, видаляє файл із тимчасової папки і повертає безпечну URL-адресу завантаженого файлу.
export const saveFileToCloudinary = async (file) => {
  const response = await cloudinary.v2.uploader.upload(file.path);
  await fs.unlink(file.path);
  return response.secure_url;
};
