import { tokenTypeEnum } from "../common/enum/security.enum.js";
import { unauthorizedExeption } from "../common/exceptions/error.exceptions.js";
import { decodeToken } from "../common/security/index.js";

export const authentication = (tokenType = tokenTypeEnum.ACCESS) => {
    return async (req, res, next) => {
        try {
            const { authorization } = req.headers;
            
            if (!authorization) {
                throw unauthorizedExeption("unauthorizedAccount");
            }

            // فك التوكن والتحقق منه (تم تعديل decodeToken لتقبل الـ authorization مباشرة)
            const { user, payload } = await decodeToken({ authorization, tokenType });
            
            req.user = user;
            req.payload = payload;

            return next();
        } catch (error) {
            // تمرير الخطأ لملف معالجة الأخطاء المركزي في Express
            return next(error);
        }
    };
};