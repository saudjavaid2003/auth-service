import express from "express"

import { TenantController } from "../controllers/TenantController";
import { Request, Response ,NextFunction} from "express";
import { AppDataSource } from "../config/data-source";
import { Tenant } from "../entity/Tenant";
import logger from "../config/logger";
import { TenantService } from "../services/TenantService";
const router = express.Router();
const tenantRepository=AppDataSource.getRepository(Tenant)
const tenantService=new TenantService(tenantRepository)

const tenantController=new TenantController(tenantService,logger)

router.post("/",(req:Request,res:Response,next:NextFunction)=>{
    tenantController.create(req,res,next)
});
export default router;