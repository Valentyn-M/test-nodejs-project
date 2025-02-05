import createHttpError from 'http-errors';
import { SessionCollection } from '../db/models/session.js';
import { UsersCollection } from '../db/models/user.js';

// Middleware authenticate виконує процес аутентифікації користувача, перевіряючи наявність та дійсність токена доступу в заголовку запиту.
// Функція приймає об'єкти запиту (req), відповіді (res) і наступної функції (next).
export const authenticate = async (req, res, next) => {
  // Отримуємо заголовок авторизації за допомогою req.get('Authorization')
  const authHeader = req.get('Authorization');
  // Якщо заголовок авторизації не надано, функція викликає помилку з кодом 401 (Будь ласка, надайте заголовок авторизації) і передає її до наступної функції за допомогою next.
  if (!authHeader) {
    next(createHttpError(401, 'Please provide Authorization header'));
    return;
  }

  // Розділяємо заголовок авторизації на дві частини:
  // - тип (повинен бути "Bearer");
  // - сам токен.
  const bearer = authHeader.split(' ')[0];
  const token = authHeader.split(' ')[1];
  // Якщо тип заголовка не "Bearer" або токен відсутній, функція викликає помилку з кодом 401 (Заголовок авторизації повинен бути типу Bearer) і передає її до наступної функції.
  if (bearer !== 'Bearer') {
    next(createHttpError(401, 'Auth header chould be of type Bearer'));
    return;
  }
  if (!token) {
    next(createHttpError(401, 'No Access token provided'));
    return;
  }

  // Шукаємо сесію в колекції SessionsCollection за наданим токеном доступу.
  const session = await SessionCollection.findOne({ accessToken: token });
  // Якщо сесію не знайдено, функція викликає помилку з кодом 401 (Сесію не знайдено) і передає її до наступної функції.
  if (!session) {
    next(createHttpError(401, 'Session not found'));
    return;
  }

  // Перевіряємо, чи не минув термін дії токена доступу, порівнюючи поточну дату з датою закінчення дії токена.
  const isSessionTokenExpired =
    new Date() > new Date(session.accessTokenValidUntil);
  // Якщо токен прострочений, функція викликає помилку з кодом 401 (Токен доступу прострочений) і передає її до наступної функції.
  if (isSessionTokenExpired) {
    next(createHttpError(401, 'Access token expired'));
  }

  // Шукаємо користувача в колекції UsersCollection за ідентифікатором користувача, який зберігається в сесії.
  const user = await UsersCollection.findById(session.userId);
  console.log('session: ', session);
  console.log('session.userId: ', session.userId);
  // Якщо користувача не знайдено, функція викликає помилку з кодом 401 і передає її до наступної функції.
  if (!user) {
    next(createHttpError(401));
    return;
  }

  // Якщо всі перевірки успішні, функція додає об'єкт користувача до запиту (req.user = user).
  req.user = user;

  // Викликається наступна функція за допомогою next, що дозволяє продовжити обробку запиту.
  next();
};
