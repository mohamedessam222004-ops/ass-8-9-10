import { BadRequestExeption, conflictExeption, NotfoundExeption } from "../../common/exceptions/error.exceptions.js";
import { findOne, createOne } from "../../common/reposatry/index.js";
import { hash ,compare,encryption,decryption, createtoken,createLoginCredentials} from "../../common/security/index.js";
import { usermodel } from "../../db/model/index.js";
import { ACCESS_TOKEN_EXPIRES_IN, SALT, WEB_CLIENT_ID } from "../config.js";
import { REFRESH_TOKEN_SIGNATURE,REFRESH_TOKEN_EXPIRES_IN } from '../../modules/config.js';
import jwt from 'jsonwebtoken'
import {OAuth2Client} from 'google-auth-library';
import { model } from "mongoose";
import { providerEnum } from "../../common/enum/user.gender.js";



const client = new OAuth2Client();
async function verifyGoogleAccount(idToken) {
  const ticket = await client.verifyIdToken({
      idToken,
      audience: WEB_CLIENT_ID, })
  
      
      const payload = ticket.getPayload();
 if (!payload.email_verified) {
    throw BadRequestExeption("Email Not Verified")
 }
      return payload
  const userid = payload['sub'];
  // If the request specified a Google Workspace domain:
  // const domain = payload['hd'];
}

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
export const loginWithGmail = async (account, issuer) => {
   
 
    return await createLoginCredentials({user:account ,issuer})
    
}
export const signupWithGmail = async ({ idToken },issuer) => {
   console.log({idToken});
   const {name,email,picture }=await verifyGoogleAccount(idToken)
   console.log({name,email,picture });
    
  const existAccount=await findOne({
    model:usermodel,
    filter:{email}
  })
    
 if (existAccount) {
   
    if (existAccount.provider !== providerEnum.GOOGLE) {
      throw conflictExeption("Email exists with another provider")
    }
  
    return {status :200 ,data:await createLoginCredentials({user:existAccount ,issuer})
  }}
  const user =await createOne({
    model:usermodel,
    data:{
        username:name,
        email,
        confirmEmail:new Date(),
        provider:providerEnum.GOOGLE,
        Image:picture
    }
  })
      return {status :201 ,data:await createLoginCredentials({user ,issuer})

}
}
export const login = async ({ email, password }, issuer) => {
    const account = await findOne({
        model: usermodel,
        filter: {
            email,
            provider:providerEnum.SYSTEM
        },
    })

    if (!account) {
        
        throw NotfoundExeption("not Exist")
    }

    const match = await compare(password, account.password)
    if (!match) {
        throw NotfoundExeption("not Exist")
    }
 
    return await createLoginCredentials({user:account ,issuer})
    
}