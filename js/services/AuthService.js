import { Teacher } from '../models/Teacher.js';
import { Student } from '../models/Student.js';

export class AuthService {
    static USERS_KEY = 'users';
    static CURRENT_USER_KEY = 'currentUser';

    static getUsers() {
        const data = localStorage.getItem(this.USERS_KEY);
        return data ? JSON.parse(data) : [];
    }

    static saveUsers(users) {
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }

    static register(name, idNumber, role, password) {
        const users = this.getUsers();
        const alreadyExists = users.find(u => u.idNumber === idNumber);
        if (alreadyExists) {
            return { success: false, message: 'A user with this ID number already exists.' };
        }

        const id = Date.now().toString();
        let newUser;

        if (role === 'teacher') {
            newUser = new Teacher(id, name, idNumber, password);
        } else {
            newUser = new Student(id, name, idNumber, password);
        }

        users.push(newUser);
        this.saveUsers(users);
        return { success: true, message: 'Registration successful!' };
    }

    static login(idNumber, password) {
        // Persist the active user session in localStorage for role-based routing.
        const users = this.getUsers();
        const user = users.find(u => u.idNumber === idNumber && u.password === password);

        if (!user) {
            return null;
        }

        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
        return user;
    }

    static getCurrentUser() {
        const data = localStorage.getItem(this.CURRENT_USER_KEY);
        return data ? JSON.parse(data) : null;
    }

    static logout() {
        localStorage.removeItem(this.CURRENT_USER_KEY);
    }
}
