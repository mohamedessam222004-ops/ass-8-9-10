import bcrypt from "bcrypt";
import { SALT } from "../../modules/config.js";
export const hash =async(plaintext,saltround=SALT ,minor='b')=>{
    const saltsignature=await bcrypt.genSalt(saltround ,minor)
    const cipherText =await bcrypt.hash(plaintext,saltsignature)
    return cipherText
}
export const compare=async(plaintext ,cipherText)=>{
     const match =await bcrypt.compare(plaintext,cipherText)
    return match
}


// import bcrypt from "bcrypt";
// import argon2 from "argon2";
// import { SALT } from "../../modules/config.js";
// import { HashApproachEnum } from "../enum/index.js";

// export const hash = async ({
//     plaintext,
//     salt_round = SALT,
//     minor = "b",
//     approach = HashApproachEnum.BCRYPT
// } = {}) => {
//     let cipherText = undefined;

//     switch (approach) {
//         case HashApproachEnum.BCRYPT: {
//             const saltSignature = await bcrypt.genSalt(salt_round, minor);
//             cipherText = await bcrypt.hash(plaintext, saltSignature);
//             break;
//         }

//         case HashApproachEnum.ARGON2: {
//             cipherText = await argon2.hash(plaintext);
//             break;
//         }

//         default:
//             break;
//     }

//     return cipherText;
// };

// export const compare = async (
//     plaintext,
//     cipherText,
//     approach = HashApproachEnum.BCRYPT
// ) => {
//     let match = false;

//     switch (approach) {
//         case HashApproachEnum.BCRYPT:
//             match = await bcrypt.compare(plaintext, cipherText);
//             break;

//         case HashApproachEnum.ARGON2:
//             match = await argon2.verify(cipherText, plaintext);
//             break;

//         default:
//             break;
//     }

//     return match;
// };



