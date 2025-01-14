import express from "express";
import { Usermodel } from "../models/user.js";
import { connectionrequest } from "../models/connectionRequest.js";
import { userAuth } from "../middlewares/auth.js";
const requestRouter = express.Router();

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;
      // Validate `toUserId` and `status`
      if (!toUserId || !status) {
        return res.status(400).send({ message: "Missing required parameters" });
      }
      const isinclude = await Usermodel.findOne({ _id: toUserId });
      if (!isinclude) {
        return res.send("user is not found");
      }
      const existingrequest = await connectionrequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { toUserId, fromUserId },
        ],
      });
      if (existingrequest) {
        return res.send(" connection request is allready send ");
      }
      const connection = new connectionrequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connection.save();
      res
        .status(201)
        .send({ message: "Connection request sent successfully", data });
    } catch (err) {
      console.error("[ERROR] Sending connection request failed:", err);
      res.status(500).send({
        message: "Cannot send the connection request, something went wrong",
        error: err.message,
      });
    }
  }
);
requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUserId = req.user._id;
      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(req.params.status)) {
        return res.status(400).send("Invalid status");
      }
      
      const requestId = req.params.requestId.trim();
      if (!requestId) {
        return res.status(400).send("Request ID is missing");
      }
      const connectionRequest = await connectionrequest.findOne({
        _id: requestId,
        toUserId: loggedInUserId,
        status: "interested",
      });

      if (!connectionRequest) {
        return res.status(404).send("Request ID not found");
      }

      connectionRequest.status = req.params.status;
      await connectionRequest.save();
      res.send("Request is reviewed successfully");
    } catch (err) {
      console.error("[ERROR] Reviewing connection request failed:", err);
      res.status(500).send({
        message: "Cannot review the connection request, something went wrong",
        error: err.message,
      });
    }
  }
);
export default requestRouter;
