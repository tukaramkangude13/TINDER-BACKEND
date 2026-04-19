import mongoose from "mongoose";

 export const connectdb=async()=>{

  await  mongoose.connect("mongodb+srv://tukaramkangude13:Tukaram1qw23e@tukaramkangude13.g2bue.mongodb.net/")
    // QwDZoL2OIPHJqL2v
}

