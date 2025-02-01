// Функція повертає об'єкт з повною інформацією про пагінацію, включно з:
// - поточною сторінкою,
// - кількістю елементів на сторінці,
// - загальною кількістю елементів,
// - загальною кількістю сторінок,
// - індикаторами наявності наступної,
// - попередньої сторінок.
export const calculatePaginationData = (count, perPage, page) => {
  const totalPages = Math.ceil(count / perPage);
  const hasNextPage = count > page * perPage;
  const hasPreviousPage = page !== 1 && page <= totalPages + 1;

  return {
    page,
    perPage,
    totalItems: count,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };
};
