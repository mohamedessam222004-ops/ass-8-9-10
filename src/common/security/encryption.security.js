import crypto, { Decipheriv } from 'node:crypto'
import { IV_LENGTH,ENC_KEY } from '../../modules/config.js'
import { buffer } from 'node:stream/consumers'

export const encryption= async(plaintext)=>{
    const iv =crypto.randomBytes(IV_LENGTH)
     const cipherIv= crypto.createCipheriv('aes-256-cbc',ENC_KEY,iv)

     let cipherText=cipherIv.update(plaintext,"utf-8","hex")
     cipherText+= cipherIv.final("hex")
console.log({iv,ivstr:iv.toString('hex'),cipherIv ,cipherText:`${iv.toString('hex')}::${cipherText}`});
return `${iv.toString('hex')}::${cipherText}`
}
export const decryption= async(cipherText)=>{
    const[hexIV,encryptedData]=cipherText.split("::")
       const iv =Buffer.from(hexIV,'hex')
     const Decipheriv= crypto.createDecipheriv('aes-256-cbc',ENC_KEY,iv)
     let plaintext=Decipheriv.update(encryptedData,"hex","utf-8")
     plaintext+= Decipheriv.final("utf-8")

return plaintext
}    

    

