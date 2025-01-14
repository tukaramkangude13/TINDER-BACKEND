import express from "express";
import bcrypt from "bcrypt";
import { Usermodel } from "../models/user.js";
import Jwt from "jsonwebtoken";

const authRouter = express.Router();
export default authRouter;

authRouter.post("/signup", async (req, res) => {
  try {
    const { password, ...otherDetails } = req.body;
    if (!password) {
      return res.status(400).send({ message: "Password is required" });
    }

    // Hash the password before saving the user
    const passwordHash = await bcrypt.hash(password, 10);

    const userobject = { ...otherDetails, password: passwordHash };
    const user = new Usermodel(userobject);
    const UserData = await user.save();
    const token = await UserData.getJWT();
    res.cookie("token", token, { httpOnly: true });

    res.status(201).json({ data: UserData });
  } catch (err) {
    console.error("[ERROR] Error in /signup:", err);
    res
      .status(500)
      .send({ message: "Internal Server Error", error: err.message });
  }
});
authRouter.post("/logout", (req, res) => {
  try {
    res.clearCookie("token", { httpOnly: true });

    res.status(200).send({ message: "Logout successful" });
  } catch (err) {
    console.error("[ERROR] Error in /logout:", err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!emailId) {
      return res.status(400).send({ message: "Email is required" });
    }
    if (!password) {
      return res.status(400).send({ message: "Password is required" });
    }
    if (!emailId || !password) {
      return res
        .status(400)
        .send({ message: "Email and password are required" });
    }

    const user = await Usermodel.findOne({ emailId });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const isPasswordValid = await user.validpassword(password);
    if (!isPasswordValid) {
      return res.status(401).send({ message: "Invalid email or password" });
    }

    const token = user.getJWT();

    // Set the token in a cookie
    res.cookie("token", token, { httpOnly: true });

    res.status(200).send({
      message: "Login successful",

      user,
      token,
    });
  } catch (err) {
    console.error("[ERROR] Error in /login:", err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});
