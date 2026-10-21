import  { resolve } from "node:path";
import { config } from "dotenv";
export const NODE_ENV = process.env.NODE_ENV ?? 'development'
config ({ path:resolve(`.env.${NODE_ENV}`)})
export const ENC_KEY = process.env.ENC_KEY;

export const port = parseInt(process.env.port ?? "9000")
export const db_uri=process.env.db_uri
export const SALT =parseInt(process.env.SALT ?? "12")
export const IV_LENGTH =parseInt(process.env.IV_LENGTH ?? "12")
export const ACCESS_TOKEN_SIGNATURE = process.env.ACCESS_TOKEN_SIGNATURE;

export const ACCESS_ADMIN_TOKEN_SIGNATURE = process.env.ACCESS_ADMIN_TOKEN_SIGNATURE;
export const ACCESS_USER_TOKEN_SIGNATURE = process.env.ACCESS_USER_TOKEN_SIGNATURE;
export const REFRESH_ADMIN_TOKEN_SIGNATURE = process.env.REFRESH_ADMIN_TOKEN_SIGNATURE;
export const REFRESH_USER_TOKEN_SIGNATURE = process.env.REFRESH_USER_TOKEN_SIGNATURE;

export const ACCESS_TOKEN_EXPIRES_IN =parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN ?? "18000")

export const REFRESH_TOKEN_SIGNATURE = process.env.REFRESH_TOKEN_SIGNATURE;
export const REFRESH_TOKEN_EXPIRES_IN =parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN ?? "31536000")
export const WEB_CLIENT_ID=process.env.WEB_CLIENT_ID.split(",")

