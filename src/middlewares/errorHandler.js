// middleware, що обробляє помилки

// Імпортуємо клас HttpError для обробки помилок HTTP з відповідними статус-кодами
import { HttpError } from 'http-errors';

// Middleware для обробких помилок (приймає 4 аргументи), зокрема, для випадків, коли виникає помилка, яку не було передбачено (так звані 500-ті помилки).
export const errorHandler = (err, req, res, next) => {
  // Перевірка, чи отримали ми помилку від createHttpError
  if (err instanceof HttpError) {
    res.status(err.status).json({
      status: err.status,
      message: err.status,
      data: err,
    });
    return;
  }

  res.status(500).json({
    status: 500,
    message: 'Something went wrong',
    error: err.message, // Сюди потрапляє об'єкт помилки з попередніх middleware (за допомогою next(err) або next(new Error("...")))
  });
};
