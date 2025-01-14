import mongoose from "mongoose";

// const chatSchema = new mongoose.Schema(
//   {
//     fromUserId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "user",
//       required: true,
//     },
//     toUserId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "user",
//       required: true,
//     },
//     message: {
//       type: String,
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ["sent", "delivered", "seen"],
//       default: "sent",
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Prevent self-messaging
// chatSchema.pre("save", function (next) {
//   if (this.fromUserId.equals(this.toUserId)) {
//     return next(new Error("Cannot send a message to yourself."));
//   }
//   next();
// });

// // Remove the index that enforces uniqueness between fromUserId and toUserId
// // chatSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

// export const Chat = mongoose.model("Chat", chatSchema);



const chatSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    message: {
      type: String,
    },
    fileUrl: {
      type: String, // Store the file's URL here
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent self-messaging
chatSchema.pre("save", function (next) {
  if (this.fromUserId.equals(this.toUserId)) {
    return next(new Error("Cannot send a message to yourself."));
  }
  next();
});

export const Chat = mongoose.model("Chat", chatSchema);
