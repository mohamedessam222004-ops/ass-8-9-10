import { Router } from 'express';
import { authentication, authorization } from "../../middleware/Authentication.Middleware.js";
import { profile,rotateToken,updateProfile } from './user.service.js'
import { sucsessresponse } from '../../common/utils/index.js';
import { tokenTypeEnum } from '../../common/enum/security.enum.js';
import { RoleEnum } from '../../common/enum/user.gender.js';

const router =  Router();
router.get("/",authentication(),async(req, res ,next)=>{
    const data =await profile(req.user)
    return sucsessresponse({res,data})
})
router.patch("/",authentication(),authorization(RoleEnum.USER),async(req, res ,next)=>{
    const data =await updateProfile(req.user,req.body)
    return sucsessresponse({res,data})
})
router.post("/rotate-token",authentication(tokenTypeEnum.REFRESH),async(req, res ,next)=>{
    const data =await rotateToken(req.payload,req.user,`${req.protocol}://${req.host}`)
    return sucsessresponse({res,data})
})
export default router
