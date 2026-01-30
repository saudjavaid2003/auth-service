import { Entity, PrimaryGeneratedColumn, Column ,ManyToOne} from "typeorm"
// src/entity/User.ts

import { Tenant } from "./Tenant";

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
    
    @Column({select:false})
    
    password: string
    
    @Column()
    role: string

    @ManyToOne(() => Tenant)
    tenant: Tenant | null;
}