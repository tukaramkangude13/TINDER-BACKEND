import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
   about: {
    type: String,
  },
  age: {
    type: Number,
    min: 18,
  },
  skills:{
    type:[String],
    default:[],
  },
  gender: {
    type: String,
  },
  emailId: {
    type: String,
    unique: true,
    required: true,
  },
  photoUrl: {
    type: String, // Store the URL of the photo as a string
    default: "", // Optional field; if not provided, it will be an empty string
  },
});

userSchema.methods.getJWT = function () {
  const user = this;
  const token = Jwt.sign({ _id: user._id }, "tukaram", { expiresIn: "7d" });
  return token;
};

userSchema.methods.validpassword = async function (PasswordInputByUser) {
  const user = this;
  console.log(PasswordInputByUser);
  console.log(user.password);
  const ispasswordvalid = await bcrypt.compare(
    PasswordInputByUser,
    user.password
  );
  return ispasswordvalid;
};

export const Usermodel = mongoose.model("user", userSchema);
