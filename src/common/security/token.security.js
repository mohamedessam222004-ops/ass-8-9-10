import jwt from 'jsonwebtoken'
import { ACCESS_ADMIN_TOKEN_SIGNATURE, ACCESS_TOKEN_EXPIRES_IN, ACCESS_USER_TOKEN_SIGNATURE, REFRESH_ADMIN_TOKEN_SIGNATURE, REFRESH_TOKEN_EXPIRES_IN, REFRESH_USER_TOKEN_SIGNATURE } from '../../modules/config.js'
import { BadRequestExeption, NotfoundExeption } from '../exceptions/error.exceptions.js'
import { findById } from '../reposatry/base.reposatry.js'
import { usermodel } from '../../db/model/user.model.js'
import { tokenTypeEnum } from '../enum/security.enum.js'
import { RoleEnum } from '../enum/user.gender.js'


export const createtoken = async ({
    payload = {},
    options = {},
    secret = ACCESS_USER_TOKEN_SIGNATURE
} = {}) => {
    return jwt.sign(payload, secret, options);
};


export const verifytoken = async ({
    token = "",
    secret = ACCESS_USER_TOKEN_SIGNATURE
} = {}) => {
    return jwt.verify(token, secret);
};


const getTokenSignatures = async ({
    role = RoleEnum.USER
} = {}) => {
    let signatures;

    switch (role) {
        case RoleEnum.ADMIN:
            signatures = {
                accessSignature: ACCESS_ADMIN_TOKEN_SIGNATURE,
                refreshSignature: REFRESH_ADMIN_TOKEN_SIGNATURE
            };
            break;

        default:
            signatures = {
                accessSignature: ACCESS_USER_TOKEN_SIGNATURE,
                refreshSignature: REFRESH_USER_TOKEN_SIGNATURE
            };
            break;
    }

    return signatures;
};


const getSignature = async ({
    tokenType = tokenTypeEnum.ACCESS,
    role = RoleEnum.USER
} = {}) => {
    const signatures = await getTokenSignatures({ role });

    return tokenType === tokenTypeEnum.ACCESS
        ? signatures.accessSignature
        : signatures.refreshSignature;
};


export const decodeToken = async ({
    authorization = "",
    tokenType = tokenTypeEnum.ACCESS
} = {}) => {
    const [, token] = authorization.split(" ");
    const decoded = jwt.decode(token);
    console.log(decoded);

    if (!decoded?.aud?.length) {
        throw BadRequestExeption("missing token payload");
    }

    const payload = await verifytoken({
        token,
        secret: await getSignature({
            tokenType,
            role: decoded.aud[0]
        })
    });

    if (!payload?.sub) {
        throw BadRequestExeption("missing token payload");
    }

    const user = await findById({
        model: usermodel,
        id: payload.sub
    });

    if (!user) {
        throw NotfoundExeption("Invalid user");
    }

    return { user, payload };
};


export const createLoginCredentials = async ({
    user,
    issuer,
    options = {}
}) => {

    const {
        accessSignature,
        refreshSignature
    } = await getTokenSignatures({
        role: user.role
    });

    const access_token = await createtoken({
        payload: {
            sub: user._id
        },
        secret: accessSignature,
        options: {
            ...options,
            issuer,
            audience: [user.role],
            expiresIn: ACCESS_TOKEN_EXPIRES_IN
        }
    });

    const refresh_token = await createtoken({
        payload: {
            sub: user._id
        },
        secret: refreshSignature,
        options: {
            ...options,
            issuer,
            audience: [user.role],
            expiresIn: REFRESH_TOKEN_EXPIRES_IN
        }
    });

    console.log({
        accessSignature,
        refreshSignature
    });

    return {
        access_token,
        refresh_token
    };
};