import express from "express";
import {
  createRoom,
  joinRoom,
  getRoom,
  endRoom,
  cancelRoom
} from "../controller/roomController.js"; 
  

import isAuth from "../middlewares/isAuth.js";
const router = express.Router();

router.post("/create", isAuth, createRoom);
router.post("/join", isAuth, joinRoom);
router.get("/:roomId", isAuth, getRoom);
router.delete("/cancel", isAuth, cancelRoom);
router.post("/end", isAuth, endRoom);

export default router;
