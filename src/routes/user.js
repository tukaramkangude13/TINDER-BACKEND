import express from "express";
import fetch from 'node-fetch';

import { connectionrequest } from "../models/connectionRequest.js";
import { userAuth } from "../middlewares/auth.js";
import { Usermodel } from "../models/user.js";
const userrouter = express.Router();
userrouter.get("/user/requests/recived", userAuth, async (req, res) => {
  try {
    const loggeduser = req.user;
    const connectionreques = await connectionrequest
      .find({
        toUserId: loggeduser._id,
        status: "interested",
      })
      .populate("fromUserId", "firstName lastName  photoUrl gender age skills");
    res.send(connectionreques);
  } catch (err) {
    res.send(err.message);
  }
});
userrouter.get("/user/connections/recived", userAuth, async (req, res) => {
  try {
    const loggeduser = req.user;

    // Ensure the logged user is set properly
    console.log("Logged in User:", loggeduser);
    if (!loggeduser) {
      return res.status(401).send({ error: "User not authenticated" });
    }

    // Fetch connection requests with accepted status
    const connectionreques = await connectionrequest
      .find({
        $or: [
          { toUserId: loggeduser._id, status: "accepted" },
          { fromUserId: loggeduser._id, status: "accepted" },
        ],
      })
      .populate("fromUserId", "firstName lastName  photoUrl gender age skills")
      .populate("toUserId", "firstName lastName      photoUrl gender age skills       ");

    console.log("Connection Requests:", connectionreques); // Debugging log

    // Check if the result is empty
    if (!connectionreques || connectionreques.length === 0) {
      return res.status(404).send({ message: "No connection requests found" });
    }

    // Map to find the other user in each connection
    const data = connectionreques.map((row) => {
      // Use `.equals()` for ObjectId comparison
      if (row.fromUserId._id.equals(loggeduser._id)) {
        return row.toUserId; // Return the other user
      }
      return row.fromUserId;
    });

    console.log("Filtered Data:", data); // Debugging log
    res.send(data);
  } catch (err) {
    console.error("Error:", err.message); // Log the error for debugging
    res.status(500).send({ error: "Something went wrong. Please try again later." });
  }
});




userrouter.get("/feed", userAuth, async (req, res) => {
  try {
    const logginuser = req.user;
    const connections = await connectionrequest.find({
      $or: [
        {
          fromUserId: logginuser._id,
        },
        {
          toUserId: logginuser._id,
        },
      ],
    });

    const hidefromfeed = new Set();
    connections.forEach((element) => {
      hidefromfeed.add(element.fromUserId.toString());
      hidefromfeed.add(element.toUserId.toString());
    });
    const users = await Usermodel.find({
      $and: [
        { _id: { $nin: Array.from(hidefromfeed) } },
        {
          _id: { $ne: logginuser._id },
        },
      ],
    });
    res.send(users);
  } catch (err) {
    res.send(err.message);
  }
});


userrouter.get('/tinder-api', userAuth, async (req, res) => {
  try {
    const response = await fetch('https://api.gotinder.com/v2/profile?locale=en&include=account%2Cavailable_descriptors%2Cboost%2Cbouncerbypass%2Ccontact_cards%2Cemail_settings%2Cfeature_access%2Cinstagram%2Clikes%2Cprofile_meter%2Cnotifications%2Cmisc_merchandising%2Cofferings%2Conboarding%2Cpaywalls%2Cplus_control%2Cpurchase%2Creadreceipts%2Cspotify%2Csuper_likes%2Ctinder_u%2Ctravel%2Ctutorials%2Cuser%2Call_in_gender', {
      method: 'GET',
      headers: {
        Authorization: `Bearer 7c036787-d0c0-407a-b027-1ffb8180f509
`, // Use an environment variable for the token
      },
    });

    if (!response.ok) {
      // Handle HTTP errors (e.g., 401, 404)
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Fetch Error:', error.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});
userrouter.get("/profile", userAuth, async (req, res) => {
  try {
    // Get the logged-in user from the request
    const loggedInUser = req.user;

    // Fetch the user data from the database
    const userProfile = await Usermodel.findById(loggedInUser._id);

    if (!userProfile) {
      return res.status(404).send({ message: "User not found" });
    }

    // Send the profile data
    res.send({
      _id:req.user._id,
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      emailId: userProfile.emailId,
      address: userProfile.address,
      age: userProfile.age,
      skills: userProfile.skills,
      about:userProfile.about,
      gender: userProfile.gender,
      photoUrl: userProfile.photoUrl,
    });
  } catch (err) {
    console.error("[ERROR] Error in /profile:", err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});


export default userrouter;
