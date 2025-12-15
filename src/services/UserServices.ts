import { User } from "../entity/User";
import { AppDataSource } from "../config/data-source";
import { UserData } from "../types";
import { Repository } from "typeorm";
import createHttpError from "http-errors";
import { Roles } from "../constants/index";
import bcrypt from "bcrypt";
export class UserService {
    constructor(private userRepository: Repository<User>) {}
    
    async create({ firstName, lastName, email, password }: UserData): Promise<User> {
        const user=await this.userRepository.findOne({where:{email:email}})
        if(user){
            throw createHttpError(400,"user already registered with this email")
        }
        const salRounds=10
        const hashPassword = await bcrypt.hash(password,salRounds);
        try {
            const user = this.userRepository.create({ 
                    firstName
                , lastName
                , email, 
                password : hashPassword,
                role: Roles.CUSTOMER
            });
            return await this.userRepository.save(user);
        } catch (err) {
            const error = createHttpError(500, "database error");
            throw error;
        }
    } // ✅ Added missing closing bracket for create method

async findByEnail(email:string){
    return await this.userRepository.findOne({where:{email:email}})
}
} // ✅ Added missing closing bracket for UserService class