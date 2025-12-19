import express, { RequestHandler } from "express"

import { TenantController } from "../controllers/TenantController";
import { Request, Response ,NextFunction} from "express";
import { AppDataSource } from "../config/data-source";
import { Tenant } from "../entity/Tenant";
import logger from "../config/logger";
import { Roles } from "../constants";
import { TenantService } from "../services/TenantService";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import  tenantValidator  from "../validators/tenant-validator";
import { CreateTenantRequest } from "../types";
import  listUsersValidator  from "../validators/list-users-validator";
const router = express.Router();
const tenantRepository=AppDataSource.getRepository(Tenant)
const tenantService=new TenantService(tenantRepository)

const tenantController=new TenantController(tenantService,logger)

router.post("/",authenticate,canAccess([Roles.ADMIN]),(req:Request,res:Response,next:NextFunction)=>{
    tenantController.create(req,res,next)
});

router.patch(
    "/:id",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    tenantValidator,
    (req: CreateTenantRequest, res: Response, next: NextFunction) =>
        tenantController.update(req, res, next) as unknown as RequestHandler,
);
router.get(
    "/",
    listUsersValidator,
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.getAll(req, res, next) as unknown as RequestHandler,
);
router.get(
    "/:id",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (req, res, next) =>
        tenantController.getOne(req, res, next) as unknown as RequestHandler,
);
router.delete(
    "/:id",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (req, res, next) =>
        tenantController.destroy(req, res, next) as unknown as RequestHandler,
);
export default router;