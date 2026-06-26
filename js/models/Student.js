import { User } from './User.js';

export class Student extends User {
    constructor(id, name, idNumber, password) {
        super(id, name, idNumber, 'student', password);
    }
}
