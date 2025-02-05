import createHttpError from 'http-errors';
import { UsersCollection } from '../db/models/user.js';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { SessionCollection } from '../db/models/session.js';
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/time.js';

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
  await SessionCollection.deleteOne({ userId: user._id });

  // Генеруємо нові токени доступу та оновлення. Використовуються випадкові байти, які конвертуються в строку формату base64.
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  // Створюємо нову сесію в базі даних
  // Нова сесія включає ідентифікатор користувача, згенеровані токени доступу та оновлення, а також часові межі їхньої дії. Токен доступу має обмежений термін дії (наприклад, 15 хвилин), тоді як токен для оновлення діє довше (наприклад, один день).
  return await SessionCollection.create({
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
  await SessionCollection.deleteOne({ _id: sessionId });
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
  const session = await SessionCollection.findOne({
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
  await SessionCollection.deleteOne({ _id: sessionId });

  // Створюємо нову сесію за допомогою функції createSession
  const newSession = createSession();

  // Створюємо нову сесію в колекції SessionsCollection, використовуючи ідентифікатор користувача з існуючої сесії та дані нової сесії, згенеровані функцією createSession.
  // Нову сесію збережено в базі даних і функція повертає її.
  return await SessionCollection.create({
    userId: session.userId,
    ...newSession,
  });
};
