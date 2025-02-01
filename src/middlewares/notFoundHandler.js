// middleware для обробки випадку, коли клієнт звертається до неіснуючого маршруту

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    message: "Route not found",
  });
};
