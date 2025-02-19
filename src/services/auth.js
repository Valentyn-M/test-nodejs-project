import createHttpError from 'http-errors';
import { UsersCollection } from '../db/models/user.js';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { SessionsCollection } from '../db/models/session.js';
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/time.js';
import jwt from 'jsonwebtoken';
import { getEnvVar } from '../utils/getEnvVar.js';
import { sendEmail } from '../utils/sendMail.js';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';
import { TEMPLATES_DIR } from '../constants/templatesDir.js';
import { ENV_VARS } from '../constants/env.js';
import {
  getFullNameFromGoogleTokenPayload,
  validateCode,
} from '../utils/googleOAuth2.js';

// Функція для реєстрації користувача
export const registerUser = async (payload) => {
  // Перевірємо email на унікальність під час реєстрації та, у разі дублювання, повертати відповідь зі статусом 409 і відповідним повідомленням
  const user = await UsersCollection.findOne({ email: payload.email });
  if (user) throw createHttpError(409, 'Email in use');

  // Застосуємо хешування для зберігання паролю
  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  return await UsersCollection.create({
    ...payload,
    password: encryptedPassword,
  });
};

// ==========================================================================================================================

// Ця функція loginUser виконує процес аутентифікації користувача.
// Вона приймає об'єкт payload, що містить дані для входу, такі як email та пароль.
export const loginUser = async (payload) => {
  // Шукаємо користувача в базі даних за наданою електронною поштою.
  // Якщо користувача з таким email не знайдено, функція викликає помилку з кодом 404, вказуючи, що користувач не знайдений.
  const user = await UsersCollection.findOne({ email: payload.email });
  if (!user) throw createHttpError(404, 'User not found');

  // Порівнюємо хеші паролів
  // Якщо користувач знайдений, функція порівнює введений користувачем пароль з хешованим паролем, збереженим у базі даних. Це здійснюється за допомогою бібліотеки bcrypt.
  // Якщо паролі не співпадають, викликається помилка з кодом 401, вказуючи, що користувач неавторизований.
  const isEqual = await bcrypt.compare(payload.password, user.password);
  if (!isEqual) throw createHttpError(401, 'Unauthorized');

  // Видаляємо попередню сесію користувача, якщо така існує, з колекції сесій. Це робиться для уникнення конфліктів з новою сесією.
  await SessionsCollection.deleteOne({ userId: user._id });

  // Генеруємо нові токени доступу та оновлення. Використовуються випадкові байти, які конвертуються в строку формату base64.
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  // Створюємо нову сесію в базі даних
  // Нова сесія включає ідентифікатор користувача, згенеровані токени доступу та оновлення, а також часові межі їхньої дії. Токен доступу має обмежений термін дії (наприклад, 15 хвилин), тоді як токен для оновлення діє довше (наприклад, один день).
  return await SessionsCollection.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
  });
};

// ==========================================================================================================================

// Функція для logout
export const logoutUser = async (sessionId) => {
  await SessionsCollection.deleteOne({ _id: sessionId });
};

// ==========================================================================================================================

// Функція викликає генерує нові accessToken і refreshToken, а також встановлює терміни їхньої дії.
const createSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  // Повертаємо об'єкт з новими токенами і термінами їхньої дії.
  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
  };
};

// Функція обробляє запит на оновлення сесії користувача, перевіряє наявність і термін дії існуючої сесії, генерує нову сесію та зберігає її в базі даних.
// Функція виконує процес оновлення сесії користувача і взаємодію з базою даних через асинхронні запити
// Функція приймає об'єкт, що містить sessionId і refreshToken
export const refreshUserSession = async ({ sessionId, refreshToken }) => {
  // Шукаємо в колекції SessionsCollection сесію з відповідним sessionId та refreshToken.
  const session = await SessionsCollection.findOne({
    _id: sessionId,
    refreshToken,
  });
  // Якщо сесію не знайдено, функція викликає помилку з кодом 401 (Сесію не знайдено).
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  // Перевіряємо, чи не минув термін дії refreshToken.
  // Якщо поточна дата перевищує значення refreshTokenValidUntil, це означає, що токен сесії прострочений.
  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);
  // Якщо токен сесії прострочений, функція викликає помилку з кодом 401 (Токен сесії прострочений).
  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }

  // Видаляємо страу сесію
  await SessionsCollection.deleteOne({ _id: sessionId });

  // Створюємо нову сесію за допомогою функції createSession
  const newSession = createSession();

  // Створюємо нову сесію в колекції SessionsCollection, використовуючи ідентифікатор користувача з існуючої сесії та дані нової сесії, згенеровані функцією createSession.
  // Нову сесію збережено в базі даних і функція повертає її.
  return await SessionsCollection.create({
    userId: session.userId,
    ...newSession,
  });
};

// ==========================================================================================================================

// Сервісна функція для скидання паролю
export const requestResetToken = async (email) => {
  // Шукаємо користувача в колекції користувачів за вказаною електронною поштою.
  const user = await UsersCollection.findOne({ email });
  // Якщо користувача не знайдено, викликається помилка з кодом 404 і повідомленням "User not found".
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  // Якщо користувача знайдено, функція створює токен скидання пароля, який містить:
  // - ідентифікатор користувача;
  // - електронну поштукористувача.
  // Токен підписується секретом JWT і має термін дії 15 хвилин.
  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    // Додаємо змінну оточення JWT_SECRET, яка буде використовуватися для генерації підпису нашого токену. Значення у неї може бути довільним, наприклад, wKYqbcFlT0AOdZPkyTH6URf0gG.
    getEnvVar(ENV_VARS.JWT_SECRET),
    {
      expiresIn: '15m',
    }
  );

  // Отримуємо шлях до шаблона reset-password-email.html
  const resetPasswordTemplatePath = path.join(
    TEMPLATES_DIR,
    'reset-password-email.html'
  );

  // Зчитуємо вміст шаблона
  const templateSource = (
    await fs.readFile(resetPasswordTemplatePath)
  ).toString();

  // Для того, щоб отримати шаблон, нам треба прочитати його контент із файла, передати в функцію handlebars.compile()
  // Після цього ми можемо передати в результат виконання цієї функції значення, що ми хочемо використати в шаблоні, і на виході отримаємо html, що може бути використаний для відправлення у листі.
  const template = handlebars.compile(templateSource);
  const html = template({
    name: user.name,
    link: `${getEnvVar(ENV_VARS.APP_DOMAIN)}/reset-password?token=${resetToken}`,
  });

  // Після цього функція надсилає електронний лист користувачу, який містить посилання для скидання пароля з включеним створеним токеном.
  try {
    await sendEmail({
      from: getEnvVar(ENV_VARS.SMTP_FROM),
      to: email,
      subject: 'Reset your password',
      html,
    });
    // Обробляємо помилку відправки листа
  } catch (err) {
    console.error('Error sending email:', err); // Логируем ошибку для отладки
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.'
    );
  }
};

// ==========================================================================================================================

export const resetPassword = async (payload) => {
  let entries;

  try {
    entries = jwt.verify(payload.token, getEnvVar(ENV_VARS.JWT_SECRET));
  } catch (err) {
    if (err instanceof Error) throw createHttpError(401, err.message);
    throw err;
  }

  const user = await UsersCollection.findOne({
    email: entries.email,
    _id: entries.sub,
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  await UsersCollection.updateOne(
    { _id: user._id },
    { password: encryptedPassword }
  );

  await SessionsCollection.deleteOne({ userId: user._id });
};

// ==========================================================================================================================

export const loginOrSignupWithGoogle = async (code) => {
  // Розшифрувуємо jwt токен і отримаємо loginTicket,
  // з якого зможемо за допомогою методу getPayload() дістаємо закодовані дані.
  const loginTicket = await validateCode(code);
  const payload = loginTicket.getPayload();
  if (!payload) throw createHttpError(401);

  // На основі тих даних, що у нас присутні в payload ми або створюємо користувача, або використовуємо вже існуючого
  // і логінимо його за допомогою нашого механізму сессій.
  let user = await UsersCollection.findOne({ email: payload.email });
  // Якщо користувача с таким email немаэ в нашій базі, то створюємо нового
  if (!user) {
    const password = await bcrypt.hash(randomBytes(10), 10);
    user = await UsersCollection.create({
      email: payload.email,
      name: getFullNameFromGoogleTokenPayload(payload),
      password,
      role: 'parent',
    });
  }

  const newSession = createSession();

  return await SessionsCollection.create({
    userId: user._id,
    ...newSession,
  });
};
