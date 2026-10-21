
import{ findByIdAndUpdate} from '../../common/reposatry/base.reposatry.js'
import { usermodel } from "../../db/model/user.model.js";
import { createLoginCredentials, verifytoken } from "../../common/security/token.security.js";
import { ACCESS_TOKEN_EXPIRES_IN} from "../config.js";
import { conflictExeption } from "../../common/exceptions/error.exceptions.js";

export const profile=async(account)=>{

   return account
}

export const updateProfile=async(user,data)=>{

   const account = await findByIdAndUpdate({model:usermodel,id:user._id,update:data})
   return account
}

export const rotateToken=async(payload,user,issuer)=>{

const accessExpiresIn=(payload.iat+ACCESS_TOKEN_EXPIRES_IN) * 1000
const currentTime=Date.now()+(30*60000)

if (currentTime<accessExpiresIn) {
   throw conflictExeption("sorry we cannot create new login credintials while current accsses token still within valid time range")
}

return await createLoginCredentials(
   {user,issuer}
)

}