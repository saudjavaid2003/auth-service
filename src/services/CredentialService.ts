import bcrypt from "bcryptjs"
export class CredentialService {
    async comparePassword(
        plainTextPassword: string,
        hashedPassword: string
    ){
        return bcrypt.compare(plainTextPassword, hashedPassword)
    }
}

