import {
    BadRequestExeption,
    conflictExeption,
    NotfoundExeption
} from "../../common/exceptions/error.exceptions.js";
import { findOne, createOne } from "../../common/reposatry/index.js";
import {
    hash,
    compare,
    encryption,
    createLoginCredentials
} from "../../common/security/index.js";
import { WEB_CLIENT_ID } from "../config.js";
import { OAuth2Client } from "google-auth-library";
import { providerEnum } from "../../common/enum/user.gender.js";

const client = new OAuth2Client();

async function verifyGoogleAccount(idToken) {
    if (!idToken) throw BadRequestExeption("Google idToken is required");

    const ticket = await client.verifyIdToken({
        idToken,
        audience: WEB_CLIENT_ID
    });
    const payload = ticket.getPayload();

    if (!payload?.email_verified || !payload.email) {
        throw BadRequestExeption("Email Not Verified");
    }

    return payload;
}

export const signup = async ({ email, password, username, phone }) => {
    if (!email?.trim() || !password || !username?.trim()) {
        throw BadRequestExeption("Email, password and username are required");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const duplicatedAccount = await findOne({
        filter: { email: normalizedEmail }
    });

    if (duplicatedAccount) throw conflictExeption("Email Exisist");

    const account = await createOne({
        data: {
            email: normalizedEmail,
            password: await hash(password),
            username,
            phone: phone ? await encryption(phone) : null,
            provider: providerEnum.SYSTEM
        }
    });

    return account;
};

export const loginWithGmail = async (account, issuer) => {
    if (!account || Number(account.provider) !== Number(providerEnum.GOOGLE)) {
        throw NotfoundExeption("Invalid email or password");
    }
    return createLoginCredentials({ user: account, issuer });
};

export const signupWithGmail = async ({ idToken }, issuer) => {
    const { name, email, picture } = await verifyGoogleAccount(idToken);
    const normalizedEmail = email.trim().toLowerCase();

    const existingAccount = await findOne({
        filter: { email: normalizedEmail }
    });

    if (existingAccount) {
        if (Number(existingAccount.provider) !== Number(providerEnum.GOOGLE)) {
            throw conflictExeption("Email exists with another provider");
        }

        return {
            status: 200,
            data: await createLoginCredentials({ user: existingAccount, issuer })
        };
    }

    if (!name?.trim()) throw BadRequestExeption("Google account name is missing");

    const user = await createOne({
        data: {
            username: name,
            email: normalizedEmail,
            confirmEmail: new Date(),
            provider: providerEnum.GOOGLE,
            image: picture ?? null
        }
    });

    return {
        status: 201,
        data: await createLoginCredentials({ user, issuer })
    };
};

export const login = async ({ email, password }, issuer) => {
    if (!email?.trim() || !password) {
        throw BadRequestExeption("Email and password are required");
    }

    const account = await findOne({
        filter: {
            email: email.trim().toLowerCase(),
            provider: providerEnum.SYSTEM
        }
    });

    if (!account?.password) {
        throw NotfoundExeption("Invalid email or password");
    }

    const match = await compare(password, account.password);
    if (!match) throw NotfoundExeption("Invalid email or password");

    return createLoginCredentials({ user: account, issuer });
};
