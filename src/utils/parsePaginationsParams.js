// Логіка парсингу параметрів пошуку

// Функція призначена для перетворення рядкових значень в числа.
// Вона приймає два параметри: number, що є значенням для перетворення, та defaultValue, яке використовується як запасне, якщо перетворення неможливе.
const parseNumber = (number, defaultValue) => {
  const isString = typeof number === 'string';
  // Перевіряємо, чи є передане значення рядком
  if (!isString) return defaultValue;

  const parseNumber = parseInt(number);
  // Якщо результат перетворення у число є NaN (не число)
  if (Number.isNaN(parseNumber)) {
    return defaultValue;
  }

  return parseNumber;
};

// Функція використовує parseNumber для обробки пагінаційних параметрів, які зазвичай надходять у запитах до бекенду.
// Ці параметри, page і perPage, містяться в об'єкті query і можуть бути неправильно вказані або взагалі пропущені.
export const parsePaginationParams = (query) => {
  const { page, perPage } = query;

  const parsePage = parseNumber(page, 1);
  const parsePerPage = parseNumber(perPage, 10);

  return {
    page: parsePage,
    perPage: parsePerPage,
  };
};
