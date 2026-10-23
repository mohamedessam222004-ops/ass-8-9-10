import crypto from "node:crypto";
import { IV_LENGTH, ENC_KEY } from "../../modules/config.js";

export const encryption = async (plaintext) => {
    if (plaintext === undefined || plaintext === null) return null;
    if (!ENC_KEY) throw new Error("ENC_KEY is missing from environment variables");

    const ivLength = Number(IV_LENGTH);
    if (ivLength !== 16) throw new Error("IV_LENGTH must be 16 for aes-256-cbc");

    const iv = crypto.randomBytes(ivLength);
    const cipher = crypto.createCipheriv("aes-256-cbc", ENC_KEY, iv);

    let encrypted = cipher.update(String(plaintext), "utf8", "hex");
    encrypted += cipher.final("hex");

    return iv.toString("hex") + "::" + encrypted;
};

export const decryption = async (cipherText) => {
    if (cipherText === undefined || cipherText === null) return null;
    if (!ENC_KEY) throw new Error("ENC_KEY is missing from environment variables");

    const parts = String(cipherText).split("::");
    if (parts.length !== 2) throw new Error("Invalid encrypted value");

    const [hexIV, encryptedData] = parts;
    const iv = Buffer.from(hexIV, "hex");
    if (iv.length !== 16) throw new Error("Invalid encryption IV");

    const decipher = crypto.createDecipheriv("aes-256-cbc", ENC_KEY, iv);
    let plaintext = decipher.update(encryptedData, "hex", "utf8");
    plaintext += decipher.final("utf8");

    return plaintext;
};
