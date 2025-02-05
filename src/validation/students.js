import Joi from 'joi';
import { GENDERS } from '../constants/gender.js';
import { isValidObjectId } from 'mongoose';

// Оголошення схеми з кастомізованими повідомленнями
export const createStudentSchema = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    'string.base': 'Username should be a string', // Кастомізація повідомлення для типу "string"
    'string.min': 'Username should have at least {#limit} characters',
    'string.max': 'Username should have at most {#limit} characters',
    'any.required': 'Username is required',
  }),
  age: Joi.number().integer().min(6).max(16).required(),
  gender: Joi.string()
    .valid(...Object.values(GENDERS))
    .required(), // ... (spread operator) передает эти значения как отдельные аргументы 'male', 'female', 'other'
  avgMark: Joi.number().min(2).max(12).required(),
  onDuty: Joi.boolean(),
  parentId: Joi.string().custom((value, helper) => {
    if (value && !isValidObjectId(value)) {
      return helper.message('Parent id should be a valid mongo id');
    }
    return true;
  }),
});

// Важливо вказати { abortEarly: false } при виклику методу validate, щоб отримати всі можливі помилки валідації, а не першу з них:
// const validationResult = createStudentSchema.validate(userData, {
//   abortEarly: false,
// });

// middleware для всіх тих роутів, де ми працюємо з тілом запиту (без .required())
export const updateStudentSchema = Joi.object({
  name: Joi.string().min(3).max(30),
  email: Joi.string().email(),
  age: Joi.number().integer().min(6).max(16),
  gender: Joi.string().valid(...Object.values(GENDERS)),
  avgMark: Joi.number().min(2).max(12),
  onDuty: Joi.boolean(),
});
