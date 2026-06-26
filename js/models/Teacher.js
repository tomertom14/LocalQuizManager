import { User } from './User.js';

export class Teacher extends User {
    constructor(id, name, idNumber, password) {
        super(id, name, idNumber, 'teacher', password);
    }
}
