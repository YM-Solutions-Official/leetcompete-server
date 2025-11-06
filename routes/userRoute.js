import express from "express";
import isAuth from "../middlewares/isAuth.js";
import multer from "multer";
import { storage } from "../config/cloudinaryConfig.js";
import { getCurrentUser, updateDescription, updateName, updatePhotoURL } from "../controller/userController.js";
const userRouter = express.Router();
userRouter.get('/getcurrentuser', isAuth, getCurrentUser);
userRouter.post('/updateDescription', isAuth, updateDescription);   
userRouter.post('/updateName', isAuth, updateName);
userRouter.post('/updatePhotoURL', isAuth, multer({ storage }).single("photo"), updatePhotoURL);


export default userRouter;