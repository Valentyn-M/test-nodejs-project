// Функції для парсингу параметрів фільтрації, які можуть бути використані для обробки запитів до бази даних

import { GENDERS } from '../constants/gender.js';

// Функція перевіряє, чи введене значення статі є рядком та чи входить воно до дозволеного списку значень (male, female, other).
// Якщо вхідне значення відповідає цим умовам, воно повертається; інакше функція повертає undefined, що може вказувати на відсутність чи невалідність даних.
const parseGender = (gender) => {
  const isString = typeof gender === 'string';
  if (!isString) return;
  const isGender = (gender) => Object.values(GENDERS).includes(gender);

  if (isGender(gender)) return gender;
};
// Функція призначена для перевірки, чи вхідний параметр є рядком, який можна перетворити в число.
// Вона спробує перетворити рядок на ціле число і поверне це число, якщо перетворення успішне і результат не є NaN (не число). Якщо перетворення не вдається, повертається undefined.
const parseNumber = (number) => {
  const isString = typeof number === 'string';
  if (!isString) return;

  const parsedNumber = parseInt(number);
  if (Number.isNaN(parsedNumber)) {
    return;
  }

  return parsedNumber;
};

// Функція використовує ці дві функції для обробки різних параметрів, які можуть включати стать, вікові межі та середні оцінки (як максимальні, так і мінімальні значення).
// Вона приймає об'єкт query, з якого витягує ці параметри, обробляє їх через відповідні функції та збирає результати в один об'єкт, який включає оброблені та валідовані параметри.
// Це дозволяє забезпечити більш точний і цілеспрямований пошук в базі даних за заданими фільтрами.
export const parseFilterParams = (query) => {
  const { gender, maxAge, minAge, maxAvgMark, minAvgMark } = query;

  const parsedGender = parseGender(gender);
  const parsedMaxAge = parseNumber(maxAge);
  const parsedMinAge = parseNumber(minAge);
  const parsedMaxAvgMark = parseNumber(maxAvgMark);
  const parsedMinAvgMark = parseNumber(minAvgMark);

  return {
    gender: parsedGender,
    maxAge: parsedMaxAge,
    minAge: parsedMinAge,
    maxAvgMark: parsedMaxAvgMark,
    minAvgMark: parsedMinAvgMark,
  };
};
