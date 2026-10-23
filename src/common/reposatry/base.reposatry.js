import { pool } from "../../db/connection.db.js";

const COLUMNS = {
    id: "id", _id: "id",
    firstName: '"firstName"', lastName: '"lastName"',
    username: "concat_ws(' ', \"firstName\", \"lastName\")",
    email: "email", password: "password", phone: "phone",
    DOB: '"DOB"', confirmEmail: '"confirmEmail"',
    image: "image", Image: "image", coverImage: '"coverImage"',
    gender: "gender", role: "role", provider: "provider",
    createdAt: '"createdAt"', updatedAt: '"updatedAt"'
};
const INSERT_FIELDS = ["firstName", "lastName", "email", "password", "phone", "DOB", "confirmEmail", "image", "coverImage", "gender", "role", "provider"];

function mapRow(row) {
    if (!row) return row;
    const result = { ...row };
    if (result.id !== undefined && result.id !== null) {
        result.id = String(result.id);
        result._id = result._id ?? result.id;
    }
    if (result.firstName !== undefined && result.lastName !== undefined) {
        result.username = (result.firstName + " " + result.lastName).trim();
    }
    return result;
}
const mapRows = (rows) => rows.map(mapRow);
const normalizeEmail = (value) => typeof value === "string" ? value.trim().toLowerCase() : value;

function normalizeData(data = {}) {
    const output = { ...data };
    if (output.Image !== undefined && output.image === undefined) output.image = output.Image;
    delete output.Image;
    if (output.username !== undefined) {
        const parts = String(output.username).trim().split(/\s+/).filter(Boolean);
        if (output.firstName === undefined) output.firstName = parts[0];
        if (output.lastName === undefined) output.lastName = parts.slice(1).join(" ");
    }
    delete output.username;
    if (output.email !== undefined) output.email = normalizeEmail(output.email);
    if (output.coverImage === undefined) output.coverImage = [];
    else if (!Array.isArray(output.coverImage)) output.coverImage = [output.coverImage];
    return output;
}

function projection(select = "") {
    if (!select || typeof select !== "string") return "*";
    const tokens = select.trim().split(/\s+/).filter(Boolean);
    const included = tokens.filter((v) => !v.startsWith("-") && !v.startsWith("+"));
    const excluded = tokens.filter((v) => v.startsWith("-")).map((v) => v.slice(1));
    if (included.length) {
        return [...new Set(included)].map((field) => {
            if (!Object.hasOwn(COLUMNS, field)) throw new Error("Unsupported selected field: " + field);
            if (field === "username") return COLUMNS.username + ' AS "username"';
            if (field === "_id") return 'id AS "_id"';
            return COLUMNS[field] + ' AS "' + (field === "Image" ? "image" : field) + '"';
        }).join(", ");
    }
    if (!excluded.length) return "*";
    const keep = [...new Set([...INSERT_FIELDS, "id", "createdAt", "updatedAt"])].filter((v) => !excluded.includes(v));
    return keep.map((field) => field === "id" ? "id" : COLUMNS[field] + ' AS "' + field + '"').join(", ") || "id";
}

function buildWhere(filter = {}, values = []) {
    if (!filter || typeof filter !== "object" || Array.isArray(filter)) throw new Error("SQL filters must be an object");
    const clauses = [];
    for (const [field, value] of Object.entries(filter)) {
        if (field === "$or" || field === "$and") {
            if (!Array.isArray(value) || value.length === 0) throw new Error(field + " filter must be a non-empty array");
            const nested = value.map((part) => buildWhere(part, values)).filter(Boolean);
            if (nested.length) clauses.push("(" + nested.join(field === "$or" ? " OR " : " AND ") + ")");
            continue;
        }
        if (field.startsWith("$")) throw new Error("Unsupported filter operator: " + field);
        if (!Object.hasOwn(COLUMNS, field)) throw new Error("Unsupported filter field: " + field);
        const column = COLUMNS[field];
        const val = field === "email" ? normalizeEmail(value) : value;
        if (val === null) { clauses.push(column + " IS NULL"); continue; }
        if (Array.isArray(val)) {
            values.push(val);
            clauses.push(column + " = ANY($" + values.length + ")");
            continue;
        }
        if (val instanceof Date || typeof val !== "object") {
            values.push(val);
            clauses.push(column + " = $" + values.length);
            continue;
        }
        for (const [operator, operand] of Object.entries(val)) {
            if (operator === "$options") continue;
            if (operator === "$exists") {
                clauses.push(column + (operand ? " IS NOT NULL" : " IS NULL"));
                continue;
            }
            const sqlOp = { $eq: "=", $ne: "<>", $gt: ">", $gte: ">=", $lt: "<", $lte: "<=", $regex: "~*" }[operator];
            if (!sqlOp) throw new Error("Unsupported filter operator: " + operator);
            values.push(operator === "$regex" ? String(operand) : operand);
            clauses.push(column + " " + sqlOp + " $" + values.length);
        }
    }
    return clauses.join(" AND ");
}

function normalizeUpdate(update = {}) {
    const output = { ...(update.$set ?? {}) };
    for (const [key, value] of Object.entries(update)) if (!key.startsWith("$")) output[key] = value;
    if (output.username !== undefined) {
        const parts = String(output.username).trim().split(/\s+/).filter(Boolean);
        output.firstName = parts[0] ?? "";
        output.lastName = parts.slice(1).join(" ");
        delete output.username;
    }
    delete output.__v;
    return normalizeData(output);
}

function buildSet(update = {}, values = []) {
    const normalized = normalizeUpdate(update);
    const clauses = [];
    for (const [field, value] of Object.entries(normalized)) {
        if (!Object.hasOwn(COLUMNS, field) || ["id", "_id", "createdAt", "updatedAt", "username"].includes(field)) {
            throw new Error("Unsupported update field: " + field);
        }
        values.push(value);
        clauses.push(COLUMNS[field] + " = $" + values.length);
    }
    for (const [field, amount] of Object.entries(update.$inc ?? {})) {
        if (field === "__v") continue;
        if (!Object.hasOwn(COLUMNS, field) || ["id", "_id", "createdAt", "updatedAt", "username"].includes(field)) {
            throw new Error("Unsupported increment field: " + field);
        }
        values.push(amount);
        clauses.push(COLUMNS[field] + " = " + COLUMNS[field] + " + $" + values.length);
    }
    for (const field of Object.keys(update.$unset ?? {})) {
        if (!Object.hasOwn(COLUMNS, field) || ["id", "_id", "createdAt", "updatedAt", "username"].includes(field)) {
            throw new Error("Unsupported unset field: " + field);
        }
        clauses.push(COLUMNS[field] + " = NULL");
    }
    if (clauses.length) clauses.push('"updatedAt" = NOW()');
    return clauses;
}

export const findOne = async ({ filter = {}, options = {}, Options = {} } = {}) => {
    const values = [];
    const where = buildWhere(filter, values);
    const select = projection(options.select ?? Options.select ?? "");
    const result = await pool.query("SELECT " + select + " FROM users" + (where ? " WHERE " + where : "") + " LIMIT 1", values);
    return mapRow(result.rows[0] ?? null);
};

export const findById = async ({ id } = {}) => {
    const result = await pool.query("SELECT * FROM users WHERE id = $1 LIMIT 1", [id]);
    return mapRow(result.rows[0] ?? null);
};

export const create = async ({ data = [{}] } = {}) => {
    if (Array.isArray(data)) return Promise.all(data.map((item) => createOne({ data: item })));
    return createOne({ data });
};

export const createOne = async ({ data = {} } = {}) => {
    const normalized = normalizeData(data);
    const fields = INSERT_FIELDS.filter((field) => normalized[field] !== undefined);
    if (!fields.includes("firstName") || !fields.includes("lastName") || !fields.includes("email")) {
        throw new Error("firstName, lastName and email are required to create a user");
    }
    const cols = fields.map((field) => COLUMNS[field]).join(", ");
    const params = fields.map((_, index) => "$" + (index + 1)).join(", ");
    const result = await pool.query(
        "INSERT INTO users (" + cols + ") VALUES (" + params + ") RETURNING *",
        fields.map((field) => normalized[field])
    );
    return mapRow(result.rows[0]);
};

export const find = async ({ filter = {}, options = {}, select = "" } = {}) => {
    const values = [];
    const where = buildWhere(filter, values);
    let sql = "SELECT " + projection(select) + " FROM users" + (where ? " WHERE " + where : "");
    if (options.sort) {
        const parts = Object.entries(options.sort).map(([field, direction]) => {
            if (!Object.hasOwn(COLUMNS, field) || field === "username") throw new Error("Unsupported sort field: " + field);
            return COLUMNS[field] + (Number(direction) < 0 ? " DESC" : " ASC");
        });
        if (parts.length) sql += " ORDER BY " + parts.join(", ");
    } else sql += " ORDER BY id ASC";
    if (options.limit !== undefined) {
        values.push(Math.min(Math.max(Number(options.limit) || 1, 1), 500));
        sql += " LIMIT $" + values.length;
    }
    if (options.skip !== undefined) {
        values.push(Math.max(Number(options.skip) || 0, 0));
        sql += " OFFSET $" + values.length;
    }
    const result = await pool.query(sql, values);
    return mapRows(result.rows);
};

export const insertMany = async ({ data = [] } = {}) => {
    const client = await pool.connect();
    const inserted = [];
    try {
        await client.query("BEGIN");
        for (const item of data) {
            const normalized = normalizeData(item);
            const fields = INSERT_FIELDS.filter((field) => normalized[field] !== undefined);
            const cols = fields.map((field) => COLUMNS[field]).join(", ");
            const params = fields.map((_, index) => "$" + (index + 1)).join(", ");
            const result = await client.query(
                "INSERT INTO users (" + cols + ") VALUES (" + params + ") RETURNING *",
                fields.map((field) => normalized[field])
            );
            inserted.push(mapRow(result.rows[0]));
        }
        await client.query("COMMIT");
        return inserted;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

export const updateOne = async ({ filter = {}, update = {} } = {}) => {
    const values = [];
    const set = buildSet(update, values);
    if (!set.length) return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
    const where = buildWhere(filter, values);
    const result = await pool.query(
        "UPDATE users SET " + set.join(", ") + (where ? " WHERE " + where : "") + " RETURNING id",
        values
    );
    return { acknowledged: true, matchedCount: result.rowCount, modifiedCount: result.rowCount };
};

export const findOneAndUpdate = async ({ filter = {}, update = {} } = {}) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const values = [];
        const where = buildWhere(filter, values);
        const found = await client.query(
            "SELECT id FROM users" + (where ? " WHERE " + where : "") + " ORDER BY id LIMIT 1 FOR UPDATE",
            values
        );
        if (!found.rows[0]) { await client.query("COMMIT"); return null; }
        const setValues = [];
        const set = buildSet(update, setValues);
        if (!set.length) {
            const current = await client.query("SELECT * FROM users WHERE id = $1", [found.rows[0].id]);
            await client.query("COMMIT");
            return mapRow(current.rows[0] ?? null);
        }
        setValues.push(found.rows[0].id);
        const updated = await client.query(
            "UPDATE users SET " + set.join(", ") + " WHERE id = $" + setValues.length + " RETURNING *",
            setValues
        );
        await client.query("COMMIT");
        return mapRow(updated.rows[0] ?? null);
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

export const findByIdAndUpdate = async ({ id, update } = {}) =>
    findOneAndUpdate({ filter: { id }, update });

export const deleteOne = async ({ filter = {} } = {}) => {
    const values = [];
    const where = buildWhere(filter, values);
    const selected = await pool.query(
        "SELECT id FROM users" + (where ? " WHERE " + where : "") + " ORDER BY id LIMIT 1",
        values
    );
    if (!selected.rows[0]) return { acknowledged: true, deletedCount: 0 };
    const deleted = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [selected.rows[0].id]);
    return { acknowledged: true, deletedCount: deleted.rowCount };
};

export const deleteMany = async ({ filter = {} } = {}) => {
    const values = [];
    const where = buildWhere(filter, values);
    const result = await pool.query(
        "DELETE FROM users" + (where ? " WHERE " + where : "") + " RETURNING id",
        values
    );
    return { acknowledged: true, deletedCount: result.rowCount };
};

export const findOneAndDelete = async ({ filter = {} } = {}) => {
    const values = [];
    const where = buildWhere(filter, values);
    const selected = await pool.query(
        "SELECT id FROM users" + (where ? " WHERE " + where : "") + " ORDER BY id LIMIT 1",
        values
    );
    if (!selected.rows[0]) return null;
    const deleted = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [selected.rows[0].id]);
    return mapRow(deleted.rows[0] ?? null);
};
