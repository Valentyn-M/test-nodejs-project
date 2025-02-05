import { model, Schema } from 'mongoose';
import { ROLES } from '../../constants/roles.js';

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // поле email має бути унікальним
    password: { type: String, required: true },
    role: {
      type: String,
      enum: [ROLES.TEACHER, ROLES.PARENT],
      default: ROLES.PARENT,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Ми маємо виправити відповідь на роуті POST /auth/register, в якій окрім всього ми повертаємо пароль. Це не є безпечним.
// Це можна виправити за допомогою переписуванням методу toJSON() у схемі юзера:
// - метод toJSON() викликається тоді, коли обʼєкт серіалізується (перетворюється на JSON) під час виклику JSON.stringify() або res.json().
userSchema.method.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const UsersCollection = model('users', userSchema);
