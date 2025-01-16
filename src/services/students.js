// Сервіси допомагають організувати код та функціонал застосунку, розділяючи їх на логічні частини.
// Вони застосовуються для реалізації операцій, що не залучені безпосередньо до обробки маршрутів, наприклад, взаємодії з базою даних або зовнішніми API.

import { StudentsCollection } from "../db/models/student.js";

// Функція для отримання інформації про всіх студентів
// Метод find() моделі StudentsCollection — це вбудований метод Mongoose для пошуку документів у MongoDB.
// Викликаючи find() на моделі StudentsCollection, ми отримаємо масив документів, що відповідають моделі Student. У випадку, якщо колекція студентів порожня, метод повертає порожній масив
export const getAllStudents = async () => {
	try {
		const students = await StudentsCollection.find();
		return students;
	}
	catch (error) {
		console.error(error);
		return null;
	}
};

// Функція для отримання інформації про одного студента за _id.
// Метод findById() моделі StudentsCollection — це вбудований метод Mongoose для пошуку одного документа у MongoDB за його унікальним ідентифікатором.
// Викликаючи findById() на моделі StudentsCollection із вказаним ідентифікатором студента, ми отримаємо документ, що відповідає цьому ідентифікатору, як об'єкт Student. Якщо документ із заданим ідентифікатором не буде знайдено, метод поверне null
export const getStudentById = async (studentId) => {
	try {
		const student = await StudentsCollection.findById(studentId);
		return student;
	}
	catch (error) {
		console.error(error);
		return null;
	}
};
