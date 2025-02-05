//  Парсер квері-параметрів для сортування

import { DB_FIELDS } from '../constants/dbFields.js';
import { SORT_ORDER } from '../constants/sortOrder.js';

// Функція приймає параметр sortOrder та перевіряє, чи відповідає він одному з відомих порядків сортування — або зростанню (ASC), або спаданню (DESC).
const parseSortOrder = (sortOrder) => {
  const isKnownOrder = [SORT_ORDER.ASC, SORT_ORDER.DESC].includes(sortOrder);
  if (isKnownOrder) return sortOrder;
  return SORT_ORDER.ASC;
};

// Функція приймає параметр sortBy, який має вказувати поле, за яким потрібно виконати сортування в базі даних студентів.
// Вона перевіряє, чи входить дане поле до списку допустимих полів (наприклад, _id, name, age тощо).
const parseSortBy = (sortBy) => {
  const keysOfStudent = Object.values(DB_FIELDS);

  if (keysOfStudent.includes(sortBy)) {
    return sortBy;
  }
  return DB_FIELDS.ID;
};

// Цей парсер використовується для обробки та стандартизації параметрів сортування, які можуть бути вказані у запиті до сервера.
// Він складається з двох головних частин: parseSortOrder і parseSortBy.
export const parseSortParams = (query) => {
  const { sortOrder, sortBy } = query;

  const parsedSortOrder = parseSortOrder(sortOrder);
  const parsedSortBy = parseSortBy(sortBy);

  return {
    sortOrder: parsedSortOrder,
    sortBy: parsedSortBy,
  };
};
