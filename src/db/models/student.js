import { model, Schema } from 'mongoose';
import { GENDERS } from '../../constants/gender.js';

// За допомогою класу Schema з бібліотеки mongoose, створимо схему для опису структури документа студента.
const studentsSchema = new Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true, enum: Object.values(GENDERS) }, // Отримуємо ключі в масиві [ 'male', 'female', 'other' ]
    avgMark: { type: Number, required: true },
    onDuty: { type: Boolean, required: true, default: false },
    parentId: { type: Schema.Types.ObjectId, ref: 'users' },
  },
  {
    timestamps: true, // timestamps — встановлює значення true, щоб автоматично створювати поля createdAt та updatedAt, які вказують на час створення та оновлення документа
    versionKey: false, // вказує, чи має бути створене поле __v для відстеження версій документу. У нашому випадку ми встановлюємо false, щоб це поле не створювалося
  }
);

// Створюємо модель студента StudentsCollection за допомогою схеми studentsSchema
export const StudentsCollection = model('students', studentsSchema);

// У результаті цього коду ми отримаємо модель колекції даних студентів у MongoDB,
// яка буде використовуватися для взаємодії з цією колекцією через Mongoose.
// - Колекція даних студентів буде мати назву "students" і кожен її документ буде відповідати схемі, описаній в studentsSchema.
// - Модель StudentsCollection надасть нам набір методів для роботи з цією колекцією, таких як збереження нового студента, отримання списку студентів, оновлення даних про студента тощо.
