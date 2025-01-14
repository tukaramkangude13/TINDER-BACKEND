import express from "express";
import { validtaeprofliedata } from "../utils/validation.js";
import { userAuth } from "../middlewares/auth.js";
import { compareSync } from "bcrypt";
const profilerouter = express.Router();
profilerouter.post("/profile", userAuth, async (req, res) => {
  try {
    // Retrieve the user from the middleware
    const user = req.user;
console.log(user);
    // Respond with the user profile
    res.status(200).send({
      message: "User profile  get  retrieved successfully",
      user: {
        _id:user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailId: user.emailId,
        address: user.address,
        age: user.age,
        gender: user.gender,
        about: user.about,
        phoneNo: user.phoneNo,
      },
    });
  } catch (err) {
    console.error("[ERROR] Error in /userprofile:", err);
    res
      .status(500)
      .send({ message: "Internal Server Error", error: err.message });
  }
});
profilerouter.patch("/profile/password",userAuth,(req,res)=>{
    try{
       if(!validtaeprofliedata(req)){

        const loogedinuser=req.user;
        Object.keys(req.body).forEach((key)=>(loogedinuser[key]=req.body[key]))
        loogedinuser.save();
        res.send("password Updated Successfully");

       }
       else{
        res.send(" please enter the passwoerd only")
       }
    } catch(err){
res.send("opps Something went wrng whol changin the password")
    }
})
profilerouter.patch("/profile/edit", userAuth, (req, res) => {
  try {
    if (!validtaeprofliedata(req)) {
      return res.send(" inavlid  password chnage not  allowed");
    }
    const loogedinuser=req.user;
Object.keys(req.body).forEach((key)=>(loogedinuser[key]=req.body[key]))
loogedinuser.save();
res.send(`${loogedinuser.firstName} your Profile Updated Successfully`);
  } catch (err) {
    res.send(" error is coming while the updating the proflie");
  }
});
export default profilerouter;
