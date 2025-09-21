import {body, checkSchema} from "express-validator"; 
export default checkSchema({
    email:{
        errorMessage:"where is your email",
        notEmpty:true,
        trim:true,
    }
})
