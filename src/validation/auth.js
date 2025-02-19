// Схеми валідації вхідних запитів від клієнта

import Joi from 'joi';

// Схема для валідації реєстрації користувача
export const registerUserSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Схема для валідації логіну
export const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Схема для валідації email (для скидання паролю)
export const requestResetEmailSchema = Joi.object({
  email: Joi.string().email().required(),
});

// Схема валідації паролю і токена
export const resetPsswordSchema = Joi.object({
  password: Joi.string().required(),
  token: Joi.string().required(),
});

// Схема валідації "code" в тілі запиту (req.body.code)
export const loginWithGoogleOAuthSchema = Joi.object({
  code: Joi.string().required(),
});
