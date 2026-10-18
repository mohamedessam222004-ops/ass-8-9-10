import { Router } from 'express';
import { login, signup } from './authentication.service.js';
import { sucsessresponse } from '../../common/utils/index.js';


const router =  Router();
router.post("/signup",async(req, res ,next)=>{
    
    
    const data =await signup(req.body)
    return sucsessresponse({res ,status:201 ,data})
})
router.post("/login",async(req, res ,next)=>{
     const data =await login(req.body,`${req.protocol}://${req.host}`)
return sucsessresponse({res  ,data})})
// Add routes
// routes.get('/', SessionController.store);
// routes.post('/', SessionController.store);
// routes.put('/', SessionController.store);
// routes.delete('/', SessionController.store);

export default router
