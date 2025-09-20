import { User } from "../entity/User";
import { AppDataSource } from "../config/data-source";
import { UserData } from "../types";
import { Repository } from "typeorm";
import createHttpError from "http-errors";

export class UserService {
    constructor(private userRepository: Repository<User>) {}
    
    async create({ firstName, lastName, email, password }: UserData): Promise<User> {
        try {
            const user = this.userRepository.create({ firstName, lastName, email, password });
            return await this.userRepository.save(user);
        } catch (err) {
            const error = createHttpError(500, "database error");
            throw error;
        }
    } // ✅ Added missing closing bracket for create method
} // ✅ Added missing closing bracket for UserService class