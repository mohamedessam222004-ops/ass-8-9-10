import pg from "pg";
import { db_uri } from "../modules/config.js";

const { Pool } = pg;

if (!db_uri) {
    throw new Error("DB_URI is missing. Copy .env.example to .env.development and configure PostgreSQL.");
}

if (!/^postgres(?:ql)?:\/\//i.test(db_uri)) {
    throw new Error("DB_URI must be a PostgreSQL connection string (postgres:// or postgresql://).");
}

export const pool = new Pool({
    connectionString: db_uri,
    connectionTimeoutMillis: 30000
});

pool.on("error", (error) => {
    console.error("Unexpected PostgreSQL pool error:", error.message);
});

export const bootstrapdb = async (app, port) => {
    try {
        await pool.query("SELECT 1");
        console.log("PostgreSQL connected successfully");

        return app.listen(port, () => {
            console.log(`Example app listening on port ${port}`);
        });
    } catch (error) {
        console.error("Failed to connect to PostgreSQL:", error.message);
        await pool.end();
        throw error;
    }
};
