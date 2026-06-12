
import { Router } from "express";
import { getCurrentUser } from "../controllers/user.controller";


const userRoute = Router();

userRoute.get("/current-user", getCurrentUser);


export default userRoute;