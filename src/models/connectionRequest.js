import mongoose from "mongoose";
import userrouter from "../routes/user.js";
const connectionrequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"user",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"user",
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "pending",
      enum: ["ignore", "interested", "accepted", "rejected"],
    },
  },
  {
    timestamps: true,
  }
);
connectionrequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });
connectionrequestSchema.pre("save", function (next) {
  const connection = this;
  if (connection.fromUserId.equals(connection.toUserId)) {
    throw new Error(" can not send the request to yourself");
  }
  next();
}); 

export const connectionrequest = mongoose.model(
  "connectionrequest",
  connectionrequestSchema
);
