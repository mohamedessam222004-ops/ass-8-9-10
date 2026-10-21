import express from'express'


import {globalerrorhandling} from './middleware/index.js'    
import { authenticationcontroller, messagecontroller, usercontroller } from './modules/index.js';
import { bootstrapdb } from './db/connection.db.js';
import { port } from './modules/config.js';
import { locks } from 'node:worker_threads';
import { log } from 'node:console';
import { encryption, decryption } from './common/security/encryption.security.js';
import  cors  from "cors";
const app = express();
bootstrapdb(app ,port)
app.use(cors())
app.use(express.json())

app.all("/",(req, res) => res.status(200).send({message:'welcome to api'}))
app.use("/auth",authenticationcontroller )
app.use("/user" ,usercontroller)
app.use("/message",messagecontroller)
app.use(globalerrorhandling)
app.all("{/*dummy}",(req, res) => res.status(404).send({message:'invalid application routing'}))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
