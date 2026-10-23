import { Router } from "express";
import { login, signup, signupWithGmail } from "./authentication.service.js";
import { sucsessresponse } from "../../common/utils/index.js";

const router = Router();

router.post("/signup", async (req, res, next) => {
    try {
        const data = await signup(req.body);
        return sucsessresponse({ res, status: 201, data });
    } catch (error) {
        return next(error);
    }
});

router.post("/signup-with-gmail", async (req, res, next) => {
    try {
        const issuer = req.protocol + "://" + req.get("host");
        const { status, data } = await signupWithGmail(req.body, issuer);
        return sucsessresponse({ res, status, data });
    } catch (error) {
        return next(error);
    }
});

router.post("/login", async (req, res, next) => {
    try {
        const issuer = req.protocol + "://" + req.get("host");
        const data = await login(req.body, issuer);
        return sucsessresponse({ res, data });
    } catch (error) {
        return next(error);
    }
});

export default router;
