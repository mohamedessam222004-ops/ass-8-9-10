import jwt from "jsonwebtoken";

import {
    ACCESS_ADMIN_TOKEN_SIGNATURE,
    ACCESS_TOKEN_EXPIRES_IN,
    ACCESS_USER_TOKEN_SIGNATURE,
    REFRESH_ADMIN_TOKEN_SIGNATURE,
    REFRESH_TOKEN_EXPIRES_IN,
    REFRESH_USER_TOKEN_SIGNATURE
} from "../../modules/config.js";

import {
    BadRequestExeption,
    NotfoundExeption,
    unauthorizedExeption
} from "../exceptions/error.exceptions.js";
import { findById } from "../reposatry/base.reposatry.js";
import { tokenTypeEnum } from "../enum/security.enum.js";
import { RoleEnum } from "../enum/user.gender.js";

export const createtoken = async ({ payload = {}, options = {}, secret = ACCESS_USER_TOKEN_SIGNATURE } = {}) =>
    jwt.sign(payload, secret, options);

export const verifytoken = async ({ token = "", secret = ACCESS_USER_TOKEN_SIGNATURE } = {}) =>
    jwt.verify(token, secret);

const getTokenSignatures = async ({ role = RoleEnum.USER } = {}) => {
    switch (Number(role)) {
        case RoleEnum.ADMIN:
            return { accessSignature: ACCESS_ADMIN_TOKEN_SIGNATURE, refreshSignature: REFRESH_ADMIN_TOKEN_SIGNATURE };
        default:
            return { accessSignature: ACCESS_USER_TOKEN_SIGNATURE, refreshSignature: REFRESH_USER_TOKEN_SIGNATURE };
    }
};

const getSignature = async ({ tokenType = tokenTypeEnum.ACCESS, role = RoleEnum.USER } = {}) => {
    const signatures = await getTokenSignatures({ role });
    return tokenType === tokenTypeEnum.ACCESS ? signatures.accessSignature : signatures.refreshSignature;
};

export const decodeToken = async ({ authorization = "", tokenType = tokenTypeEnum.ACCESS } = {}) => {
    const [scheme, token, ...extra] = authorization.trim().split(/\s+/);
    if (scheme?.toLowerCase() !== "bearer" || !token || extra.length > 0) {
        throw unauthorizedExeption("Invalid authorization header");
    }

    const decoded = jwt.decode(token);
    if (!decoded || !decoded.sub || decoded.aud === undefined) {
        throw BadRequestExeption("missing token payload");
    }

    const audience = Array.isArray(decoded.aud) ? decoded.aud[0] : decoded.aud;
    const role = Number(audience);
    if (![RoleEnum.USER, RoleEnum.ADMIN].includes(role)) {
        throw unauthorizedExeption("Invalid token role");
    }

    const payload = await verifytoken({ token, secret: await getSignature({ tokenType, role }) });
    if (!payload?.sub) throw BadRequestExeption("missing token payload");

    const user = await findById({ id: payload.sub });
    if (!user) throw NotfoundExeption("Invalid user");
    if (Number(user.role) !== role) throw unauthorizedExeption("Invalid token role");

    return { user, payload };
};

export const createLoginCredentials = async ({ user, issuer, options = {} }) => {
    const userId = user?.id ?? user?._id;
    if (!userId || user.role === undefined || user.role === null) {
        throw BadRequestExeption("Invalid user data");
    }

    const { accessSignature, refreshSignature } = await getTokenSignatures({ role: user.role });
    const commonOptions = { ...options, issuer, audience: [String(user.role)] };

    const access_token = await createtoken({
        payload: { sub: String(userId) },
        secret: accessSignature,
        options: { ...commonOptions, expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    });

    const refresh_token = await createtoken({
        payload: { sub: String(userId) },
        secret: refreshSignature,
        options: { ...commonOptions, expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    });

    return { access_token, refresh_token };
};
