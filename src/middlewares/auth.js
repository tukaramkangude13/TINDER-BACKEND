import Jwt from "jsonwebtoken";
// import profilerouter from "../routes/profile.js";
import { Usermodel } from "../models/user.js";
import authRouter from "../routes/auth.js";
const JWT_SECRET = process.env.JWT_SECRET || "tukaram";

export const userAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).send( "Please Login!!!!!!!!!");
        }

        const decoded = Jwt.verify(token, "tukaram");

        const user = await Usermodel.findById(decoded._id);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        req.user =user;



        // https://t.me/unlocked_india/5630

        next(); 
    } catch (err) {
        console.error("[ERROR] Authentication failed:", err);
        res.status(401).send({ message: "Invalid token or unauthorized", error: err.message });
    }
};
