import { Router } from "express";
import { authentication, authorization } from "../../middleware/Authentication.Middleware.js";
import { profile, rotateToken, updateProfile } from "./user.service.js";
import { sucsessresponse } from "../../common/utils/index.js";
import { tokenTypeEnum } from "../../common/enum/security.enum.js";
import { RoleEnum } from "../../common/enum/user.gender.js";

const router = Router();

router.get("/", authentication(), async (req, res, next) => {
    try {
        const data = await profile(req.user);
        return sucsessresponse({ res, data });
    } catch (error) {
        return next(error);
    }
});

router.patch("/", authentication(), authorization(RoleEnum.USER), async (req, res, next) => {
    try {
        const data = await updateProfile(req.user, req.body);
        return sucsessresponse({ res, data });
    } catch (error) {
        return next(error);
    }
});

router.post("/rotate-token", authentication(tokenTypeEnum.REFRESH), async (req, res, next) => {
    try {
        const issuer = req.protocol + "://" + req.get("host");
        const data = await rotateToken(req.payload, req.user, issuer);
        return sucsessresponse({ res, data });
    } catch (error) {
        return next(error);
    }
});

export default router;
