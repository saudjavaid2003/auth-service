import bcrypt from "bcrypt"
export class CredentialService {
    async comparePassword(
        plainTextPassword: string,
        hashedPassword: string
    ){
        return bcrypt.compare(plainTextPassword, hashedPassword)
    }
}

