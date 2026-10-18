import { Router } from 'express';
import { sucsessresponse } from '../../common/utils/index.js';

// import all controllers
// import SessionController from './app/controllers/SessionController';

const router =  Router();
router.post("/blog",(req, res ,next)=>{
    return sucsessresponse({res ,status:201})
})

// Add routes
// routes.get('/', SessionController.store);
// routes.post('/', SessionController.store);
// routes.put('/', SessionController.store);
// routes.delete('/', SessionController.store);


export default router
