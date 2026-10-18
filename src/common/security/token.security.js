import jwt from 'jsonwebtoken'
import { ACCESS_TOKEN_EXPIRES_IN, ACCESS_TOKEN_SIGNATURE, REFRESH_TOKEN_EXPIRES_IN, REFRESH_TOKEN_SIGNATURE } from '../../modules/config.js'
import { BadRequestExeption, NotfoundExeption } from '../exceptions/error.exceptions.js'
import { findById } from '../reposatry/base.reposatry.js'
import { usermodel } from '../../db/model/user.model.js'
import { tokenTypeEnum } from '../enum/security.enum.js'

export const createtoken = async ({
    payload = {},
    options = {},
    secret = ACCESS_TOKEN_SIGNATURE
} = {}) => {
    return jwt.sign(payload, secret, options)
}

export const verifytoken = async ({
    token = '',
    secret = ACCESS_TOKEN_SIGNATURE
} = {}) => {
    return jwt.verify(token, secret)
}

const getsignature = async ({ tokenType = tokenTypeEnum.ACCESS } = {}) => {
    return tokenType == tokenTypeEnum.ACCESS ? ACCESS_TOKEN_SIGNATURE : REFRESH_TOKEN_SIGNATURE
}

export const decodeToken = async ({
    authorization = '',
    tokenType = tokenTypeEnum.ACCESS
} = {}) => {
    // 1. التحقق من وجود الـ authorization والتأكد من صيغته واستخراج التوكن الفعلي
    if (!authorization || !authorization.startsWith('Bearer ')) {
        throw BadRequestExeption("Invalid or missing authorization format")
    }
    const token = authorization.split(' ')[1]

    if (!token) {
        throw BadRequestExeption("Token is missing after Bearer")
    }

    // 2. التحقق من صحة التوكن المستخلص
    const payload = await verifytoken({ 
        token: token, 
        secret: await getsignature({ tokenType })
    })
    console.log("Decoded Payload:", payload);

   const currentTimeMs = Date.now(); // الوقت الحالي بالميلي ثانية مباشرة
    const expirationTimeMs = payload?.exp ? payload.exp * 1000 : null; // تحويل وقت الانتهاء من ثواني إلى ميلي ثانية



    // 3. استخراج معرف المستخدم بأكثر من احتمال (subject أو id أو userId) لمنع ظهور الخطأ
    const userId = payload?.subject || payload?.id || payload?.userId

    if (!userId) {
        throw BadRequestExeption("missing token payload")
    }

    const user = await findById({
        model: usermodel,
        id: userId
    })

    if (!user) {
        throw NotfoundExeption("invalid user")
    }

    return { user, payload }
}

export const createLoginCredentials = async ({
    payload = {},
    options = {}
} = {}) => {
    const access_token = await createtoken({
        payload,
        options: {
            ...options,
            expiresIn: ACCESS_TOKEN_EXPIRES_IN
        }
    })

    const refresh_token = await createtoken({
        payload,
        options: {
            ...options,
            expiresIn: REFRESH_TOKEN_EXPIRES_IN
        },
        secret: REFRESH_TOKEN_SIGNATURE
    })

    return { access_token, refresh_token }
}