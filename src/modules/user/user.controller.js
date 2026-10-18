import { Router } from 'express';
import { authentication } from "../../middleware/Authentication.Middleware.js";
import { profile,rotateToken,updateProfile } from './user.service.js'
import { sucsessresponse } from '../../common/utils/index.js';
import { tokenTypeEnum } from '../../common/enum/security.enum.js';

const router =  Router();
router.get("/",authentication(),async(req, res ,next)=>{
    const data =await profile(req.user)
    return sucsessresponse({res,data})
})
router.patch("/",authentication(),async(req, res ,next)=>{
    const data =await updateProfile(req.user,req.body)
    return sucsessresponse({res,data})
})
router.post("/rotate-token",authentication(tokenTypeEnum.REFRESH),async(req, res ,next)=>{
    const data =await rotateToken(req.payload,req.user)
    return sucsessresponse({res,data})
})
export default router
