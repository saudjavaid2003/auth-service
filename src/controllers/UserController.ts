import {Request,Response,NextFunction} from 'express' 
import { UserService } from '../services/UserServices'
import { CreateUserRequest } from '../types'
import { Roles } from '../constants'
export class UserController{
    constructor(private userService:UserService){}
    async create(req:CreateUserRequest,res:Response,next:NextFunction){
        const {firstName,lastName,email,password}=req.body;

        try{
            const user=await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role:Roles.MANAGER
            })
        res.status(201).json(user.id)

        }
        catch(err){
            next(err)

        }
    }
}
