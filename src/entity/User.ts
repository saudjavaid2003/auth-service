import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"
// src/entity/User.ts


@Entity("users") // Explicitly set the table name
export class User {
    @PrimaryGeneratedColumn()
    id: number
    
    @Column()
    firstName: string
    
    @Column()
    lastName: string
    
    @Column({ unique: true })
    email: string
    
    @Column()
    password: string
    
    @Column()
    role: string
}