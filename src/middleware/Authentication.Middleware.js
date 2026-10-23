import { tokenTypeEnum } from "../common/enum/security.enum.js";
import {
    forbiddenExeption,
    unauthorizedExeption
} from "../common/exceptions/error.exceptions.js";
import { decodeToken } from "../common/security/index.js";

export const authentication = (tokenType = tokenTypeEnum.ACCESS) => {
    return async (req, res, next) => {
        try {
            const { authorization } = req.headers;

            if (!authorization) {
                throw unauthorizedExeption("unauthorizedAccount");
            }

            const { user, payload } = await decodeToken({
                authorization,
                tokenType
            });

            if (!user) {
                throw unauthorizedExeption("unauthorizedAccount");
            }

            req.user = user;
            req.payload = payload;

            return next();
        } catch (error) {
            return next(error);
        }
    };
};

export const authorization = (accessRole) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                throw unauthorizedExeption("unauthorizedAccount");
            }

            if (Number(req.user.role) < Number(accessRole)) {
                throw forbiddenExeption("forbidden Account");
            }

            return next();
        } catch (error) {
            return next(error);
        }
    };
};
