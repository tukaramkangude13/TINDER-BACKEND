import express from "express";
import { connectdb } from "./config/database.js";
import { Usermodel } from "./models/user.js";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Chat } from "./models/chat.js";
import http from "http";
import authRouter from "./routes/auth.js";
import profilerouter from "./routes/profile.js";
import userrouter from "./routes/user.js";
import requestRouter from "./routes/request.js";
import messagerouter from "./routes/message.js";
import { Server } from "socket.io";
import dotenv from 'dotenv';
dotenv.config();  // This loads variables from your .env file

const main = express();
const server = http.createServer(main);

main.use(express.json());
main.use(cookieParser());
main.use("/uploads", express.static("uploads"));




main.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Listen for 'send_message' event
  socket.on("send_message", async (data) => {
    const { fromUserId, toUserId, message } = data;

    try {
      // Save the message to the Chat collection
      const newMessage = new Chat({ fromUserId, toUserId, message });

      await newMessage.save();

      // Broadcast the message to all clients
      io.emit("receive_message", newMessage);

      // console.log("Message saved and broadcasted:", newMessage);
    } catch (error) {
      console.error("Error saving message:", error.message);
    }
  });
  socket.on("typing", (data) => {
    const { fromUserId, toUserId } = data;
    console.log(fromUserId, "yes this is from the fro user id ");
    console.log(toUserId);
    // Notify the recipient that the sender is typing
    io.emit("user_typing", { fromUserId });
  });
  socket.on("stop_typing", (data) => {
    io.emit("stop", data.fromUserId);
  });

  // Listen for 'disconnect_all' event
  socket.on("disconnect_all", () => {
    // console.log("Disconnecting all clients...");

    // Iterate through all connected sockets and disconnect them
    for (const [id, socketInstance] of io.sockets.sockets) {
      socketInstance.disconnect(true); // Disconnect the socket
      // console.log(`Disconnected socket: ${id}`);
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    // console.log("A user disconnected:", socket.id);
  });
});

// API Routes
main.use(
  "/",
  authRouter,
  profilerouter,
  requestRouter,
  userrouter,
  messagerouter
);

// Database Connection and Server Start
connectdb()
  .then(() => {
    server.listen(7777, () => {
      console.log("[INFO] Server is running on port 7777");
    });
    console.log("[INFO] Database is connected");
  })
  .catch((err) => {
    console.error("[ERROR] Failed to connect to the database:", err);
  });

// import express from "express";
// import { connectdb } from "./config/database.js";
// import { Usermodel } from "./models/user.js";
// import bcrypt from "bcrypt";
// import cookieParser from "cookie-parser";
// import validator from "validator";
// import messagerouter from "./routes/message.js";
// import cors from "cors";
// import http from "http";
// import authRouter from "./routes/auth.js";
// import profilerouter from "./routes/profile.js";
// import userrouter from "./routes/user.js";
// import requestRouter from "./routes/request.js";
// import { Server } from "http";
// import { userAuth } from "./middlewares/auth.js";
// import { Socket } from "socket.io";
// const main = express();
// const server=http.createServer(main);

// main.use(express.json());
// main.use(cookieParser());
// main.use(cors({
//   origin: "http://localhost:5173",
//   credentials: true,
// }));
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173", // Replace with your frontend URL
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });
// io.on("connection",(Socket)=>{
//   console.log("a user connected :",Socket.id);
// })

// socket.on("send_message", async (data) => {
//   const { fromUserId, toUserId, message } = data;

//   // Save message to database
//   const newMessage = new Message({ fromUserId, toUserId, message });
//   await newMessage.save();

//   // Emit the message to the specific user
//   io.emit("receive_message", newMessage); // Broadcast to all connected users
// });

// socket.on("disconnect", () => {
//   console.log("A user disconnected:", socket.id);
// });
// // const authrouter=require("./routes/auth.js")
// // const profilerouter=require("./routes/profile.js")
// // const requestrouter=require("./routes/request.js");
// main.use("/", authRouter, profilerouter, requestRouter,userrouter,messagerouter);

// connectdb()
//   .then(() => {
//     main.listen(7777, () => {
//       console.log("[INFO] Server is running on port 7777");
//     });
//     console.log("[INFO] Database is connected");
//   })
//   .catch((err) => {
//     console.error("[ERROR] Failed to connect to the database:", err);
//   });
// // main.post("/signup", async (req, res) => {
// //     try {
// //         debug("Signup request body:", req.body);

// //         const { password, ...otherDetails } = req.body;
// //         if (!password) {
// //             return res.status(400).send({ message: "Password is required" });
// //         }

// //         const passwordHash = await bcrypt.hash(password, 1);
// //         debug("Password hashed successfully.");

// //         const userobject = { ...otherDetails, password: passwordHash };
// //         const user = new Usermodel(userobject);
// //         await user.save();

// //         debug("User saved successfully:", user);
// //         res.status(201).send({ message: "Signup successful", data: user });
// //     } catch (err) {
// //         console.error("[ERROR] Error in /signup:", err);
// //         res.status(500).send({ message: "Internal Server Error", error: err.message });
// //     }
// // });

// // main.post("/login", async (req, res) => {
// //     try {
// //         const { emailId, password } = req.body;

// //         if (!emailId || !password) {
// //             return res.status(400).send({ message: "Email and password are required" });
// //         }

// //         const user = await Usermodel.findOne({ emailId });
// //         if (!user) {
// //             return res.status(404).send({ message: "User not found" });
// //         }

// //         const isPasswordValid = await user.validpassword(password);
// //         if (!isPasswordValid) {
// //             return res.status(401).send({ message: "Invalid email or password" });
// //         }

// //         const token =user.getJWT();

// //         res.status(200).send({
// //             message: "Login successful",
// //             user: {
// //                 firstName: user.firstName,
// //                 lastName: user.lastName,
// //                 emailId: user.emailId,
// //             },
// //             token,
// //         });
// //     } catch (err) {
// //         console.error("[ERROR] Error in /login:", err);
// //         res.status(500).send({ message: "Internal Server Error" });
// //     }
// // });

// // main.post("/userprofile", userAuth, async (req, res) => {
// //     try {
// //         // Retrieve the user from the middleware
// //         const user = req.user;

// //         // Respond with the user profile
// //         res.status(200).send({
// //             message: "User profile retrieved successfully",
// //             user: {
// //                 firstName: user.firstName,
// //                 lastName: user.lastName,
// //                 emailId: user.emailId,
// //                 address: user.address,
// //                 age: user.age,
// //                 gender: user.gender,
// //                 phoneNo: user.phoneNo,
// //             },
// //         });
// //     } catch (err) {
// //         console.error("[ERROR] Error in /userprofile:", err);
// //         res.status(500).send({ message: "Internal Server Error", error: err.message });
// //     }
// // });

// // main.get("/feed", async (req, res) => {
// //     try {
// //         const { firstName } = req.query;
// //         debug("Feed query parameter:", { firstName });

// //         const user = await Usermodel.findOne({ firstName });
// //         debug("User retrieved for feed:", user);

// //         if (!user) {
// //             return res.status(404).send({ message: "User not found" });
// //         }

// //         res.status(200).send({ user });
// //     } catch (err) {
// //         console.error("[ERROR] Error in /feed:", err);
// //         res.status(500).send({ message: "Internal Server Error", error: err.message });
// //     }
// // });
