import { pool } from "../../db/connection.db.js";
import { createLoginCredentials } from "../../common/security/token.security.js";
import { ACCESS_TOKEN_EXPIRES_IN } from "../config.js";
import {
    conflictExeption,
    NotfoundExeption
} from "../../common/exceptions/error.exceptions.js";

export const profile = async (account) => account;

export const updateProfile = async (user, data = {}) => {
    const allowedFields = [
        "firstName",
        "lastName",
        "phone",
        "DOB",
        "image",
        "coverImage",
        "gender"
    ];

    const columns = {
        firstName: '"firstName"',
        lastName: '"lastName"',
        phone: "phone",
        DOB: '"DOB"',
        image: "image",
        coverImage: '"coverImage"',
        gender: "gender"
    };

    const entries = Object.entries(data).filter(([key]) => allowedFields.includes(key));
    if (!entries.length) return user;

    const values = [];
    const setClauses = entries.map(([key, value], index) => {
        values.push(key === "coverImage" && !Array.isArray(value) ? [value] : value);
        return columns[key] + " = $" + (index + 1);
    });

    values.push(user.id ?? user._id);
    const result = await pool.query(
        'UPDATE users SET ' + setClauses.join(", ") +
        ', "updatedAt" = NOW() WHERE id = $' + values.length + " RETURNING *",
        values
    );

    const account = result.rows[0];
    if (!account) throw NotfoundExeption("User not found");

    account.id = String(account.id);
    account._id = account.id;
    account.username = (account.firstName + " " + account.lastName).trim();
    return account;
};

export const rotateToken = async (payload, user, issuer) => {
    const accessExpiresIn = (payload.iat + ACCESS_TOKEN_EXPIRES_IN) * 1000;
    const currentTime = Date.now() + (30 * 60000);

    if (currentTime < accessExpiresIn) {
        throw conflictExeption(
            "sorry we cannot create new login credentials while current access token is still within valid time range"
        );
    }

    return createLoginCredentials({ user, issuer });
};
