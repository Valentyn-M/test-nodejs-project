import { ONE_DAY } from '../constants/time.js';
import {
  loginUser,
  logoutUser,
  refreshUserSession,
  registerUser,
} from '../services/auth.js';

// ==========================================================================================================================

export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);

  res.status(201).json({
    status: 201,
    message: 'User registered successfully!',
    data: user,
  });
};

// ==========================================================================================================================

// Функція виконує процес обробки запиту на вхід користувача і взаємодію з клієнтом через HTTP.
// Функція приймає об'єкти запиту (req) і відповіді (res).
export const loginUserController = async (req, res) => {
  // Викликаємо функцію loginUser, передаючи їй тіло запиту (req.body), яке містить дані для входу (email та пароль).
  // loginUser виконує процес аутентифікації і повертає об'єкт сесії.
  const session = await loginUser(req.body);

  // Функція встановлює два куки: refreshToken і sessionId, використовуючи метод res.cookie.
  // - refreshToken зберігається як http-only cookie, що означає, що він доступний тільки через HTTP-запити і не може бути доступним через JavaScript на стороні клієнта. Він має термін дії один день.
  // - sessionId також зберігається як http-only cookie з аналогічним терміном дії.
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });

  // Функція формує JSON-відповідь, яка включає:
  // - статусний код 200
  // - повідомлення про успішний вхід користувача
  // - дані, що містять accessToken
  res.json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

// ==========================================================================================================================

// Функція виконує процес обробки запиту на Вихід користувача і взаємодію з клієнтом через HTTP
// Функція приймає об'єкти запиту (req) і відповіді (res)
export const logoutController = async (req, res) => {
  // Перевіряємо чи існує кукі sessionId у запиті.
  // Якщо sessionId присутній, функція викликає logoutUser, передаючи їй значення sessionId. Це дозволяє видалити сесію користувача з бази даних або здійснити інші необхідні дії для виходу користувача.
  if (req.cookies.sessionId) {
    await logoutUser(req.cookies.sessionId);
  }

  // Очищаємо кукі sessionId і refreshToken, використовуючи метод res.clearCookie.
  // Це видаляє відповідні куки з браузера клієнта, що забезпечує вихід користувача з системи на стороні клієнта.
  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');

  // Відправляємо відповідь клієнту зі статусним кодом 204 (No Content).
  // Це означає, що запит був успішно оброблений, але у відповіді немає тіла повідомлення.
  res.status(204).send();
};

// ==========================================================================================================================

// Функція встановлює два куки: refreshToken і sessionId, використовуючи метод res.cookie.
const setupSession = (res, session) => {
  // refreshToken зберігається як http-only cookie, що означає, що він доступний тільки через HTTP-запити і не може бути доступним через JavaScript на стороні клієнта. Він має термін дії один день.
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });
  // sessionId також зберігається як http-only cookie з аналогічним терміном дії.
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });
};

// Функція виконує процес оновлення сесії користувача і взаємодію з клієнтом через HTTP
// Функція приймає об'єкти запиту (req) і відповіді (res).
export const refreshUserSessionController = async (req, res) => {
  // Викликаємо функцію refreshUsersSession, передаючи їй об'єкт з sessionId та refreshToken, отримані з куків запиту (req.cookies.sessionId та req.cookies.refreshToken).
  // refreshUsersSession виконує процес оновлення сесії і повертає об'єкт нової сесії
  const session = await refreshUserSession({
    sessionId: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  // Викликаємо setupSession, передаючи їй об'єкт відповіді (res) та нову сесію.
  setupSession(res, session);

  // Формуємо JSON-відповідь, яка включає:
  // - статусний код 200;
  // - повідомлення про успішне оновлення сесії;
  // - дані, що містять accessToken.
  // Використовується метод res.json для відправлення відповіді клієнту.
  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: { accessToken: session.accessToken },
  });
};
