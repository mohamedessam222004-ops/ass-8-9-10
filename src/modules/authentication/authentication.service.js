import { conflictExeption, NotfoundExeption } from "../../common/exceptions/error.exceptions.js";
import { findOne, createOne } from "../../common/reposatry/index.js";
import { hash ,compare,encryption,decryption, createtoken,createLoginCredentials} from "../../common/security/index.js";
import { usermodel } from "../../db/model/index.js";
import { ACCESS_TOKEN_EXPIRES_IN, SALT } from "../config.js";
import { REFRESH_TOKEN_SIGNATURE,REFRESH_TOKEN_EXPIRES_IN } from '../../modules/config.js';
import jwt from 'jsonwebtoken'

export const signup = async ({ email, password, username, phone }) => {
    const duplicatedAccount = await findOne({
        model: usermodel,
        filter: { email },
        Options: { select: 'email' }
    })
    
    if (duplicatedAccount) throw conflictExeption("Email Exisist")

    const account = await createOne({
        model: usermodel,
        data: {
            email,
            password: await hash(password),
            username,
            phone: await encryption(phone)
        }
    })
    return account
}

export const login = async ({ email, password }, issuer) => {
    const account = await findOne({
        model: usermodel,
        filter: {
            email,
        },
    })

    if (!account) {
        throw NotfoundExeption("not Exist")
    }

    const match = await compare(password, account.password)
    if (!match) {
        throw NotfoundExeption("not Exist")
    }
 
    // التعديل هنا: استخدام account._id بدلاً من account.subject لأن الـ ID في قاعدة البيانات هو _id
    return await createLoginCredentials({
        payload: { 
            subject: account._id.toString() // تحويل الـ ObjectId إلى نص
        }
    })
}