import mongoose from "mongoose";

 export const connectdb=async()=>{

  await  mongoose.connect("mongodb+srv://tukaramkangude13:QwDZoL2OIPHJqL2v@tukaramkangude13.g2bue.mongodb.net/tk")
    // QwDZoL2OIPHJqL2v
}

