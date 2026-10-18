import mongoose from "mongoose";
import {db_uri} from "../modules/config.js"
import { usermodel } from "./model/user.model.js";
export const bootstrapdb =async(app ,port)=>{
try {
  await  mongoose.connect(db_uri ,{serverSelectionTimeoutMS:30000})
  await usermodel.syncIndexes()
  console.log("DB connected succesful");
   app.listen(port,()=> console.log(`Example app listening on port ${port}`)
   )
} catch (error) {
    console.log("fail to connect DB");
    
}

}