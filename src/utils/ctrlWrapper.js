//  Функція-обгортка, що не додавати try...catch із шаблонним кодом виклику next(err) у кожному контролері
export const ctrlWrapper = (controller) => {
  return async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (err) {
      next(err); //Передасть помилку в Express middleware
    }
  };
};
