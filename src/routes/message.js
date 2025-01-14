import express from "express";
import mongoose from "mongoose";
import { Chat } from "../models/chat.js";
import { userAuth } from "../middlewares/auth.js";

const messagerouter = express.Router();

import multer from "multer";

// Set up Multer for file uploads
const upload = multer({ dest: "uploads/" }); // Files will be stored in the "uploads/" folder

// Send API with File Upload
messagerouter.post(
  "/send",
  userAuth,
  upload.single("file"), // Handle single file upload
  async (req, res) => {
    try {
      const { toUserId, message } = req.body;
      console.log(req.body);
      // Validate toUserId
      if (!mongoose.Types.ObjectId.isValid(toUserId)) {
        return res.status(400).json({ message: "Invalid toUserId" });
      }

      // Create the new message object
      const newMessage = new Chat({
        fromUserId: req.user._id,
        toUserId,
        message: req.message ? req.message : null,
        fileUrl: req.file ? `/uploads/${req.file.filename}` : null, // Add file URL if a file is uploaded
      });
      console.log(newMessage.fileUrl);
      await newMessage.save();

      res.status(201).json({
        message: "Message sent successfully",
        data: newMessage,
      });
    } catch (error) {
      console.error("[ERROR] Failed to send message:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

messagerouter.get("/get/:toUserId", userAuth, async (req, res) => {
  try {
    const toUserId = req.params.toUserId; // Get the toUserId from the URL parameter
    const fromUserId = req.user._id; // Get the fromUserId from the authenticated user

    // Convert the string IDs to ObjectId
    const toUserObjectId = new mongoose.Types.ObjectId(toUserId);
    const fromUserObjectId = new mongoose.Types.ObjectId(fromUserId);

    // Fetch the latest message between the two users
    const latestMessage = await Chat.find({
      $or: [
        { fromUserId: fromUserObjectId, toUserId: toUserObjectId },
        { fromUserId: toUserObjectId, toUserId: fromUserObjectId },
      ],
    }).sort({ createdAt: 1 }); // Sort by creation date to get the latest message

    if (!latestMessage || latestMessage.length === 0) {
      return res.status(404).send({ message: "No messages found" });
    }

    // Send the latest message as a response
    res.status(200).send({ latestMessage });
  } catch (error) {
    console.error("[ERROR] Failed to fetch message:", error);
    res
      .status(500)
      .send({ message: "Something went wrong", error: error.message });
  }
});

export default messagerouter;
