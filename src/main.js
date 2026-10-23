import express from "express";
import cors from "cors";

import { globalerrorhandling } from "./middleware/index.js";
import {
    authenticationcontroller,
    messagecontroller,
    usercontroller
} from "./modules/index.js";
import { bootstrapdb } from "./db/connection.db.js";
import { port } from "./modules/config.js";

const app = express();

app.use(cors());
app.use(express.json());

app.all("/", (req, res) => {
    res.status(200).send({ message: "welcome to api" });
});

app.use("/auth", authenticationcontroller);
app.use("/user", usercontroller);
app.use("/message", messagecontroller);

app.all("/{*dummy}", (req, res) => {
    res.status(404).send({ message: "invalid application routing" });
});

app.use(globalerrorhandling);

await bootstrapdb(app, port);
