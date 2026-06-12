
/// <reference path="./@types/index.d.ts" />

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";

dotenv.config();

import { Env } from "./config/env.config";
import { Request, Response, NextFunction } from 'express';
import { HTTPSTATUS } from "./config/http.config";
import { errorHandler } from "./middleware/errorHandler.middleware";
import { BadRequestException } from "./utils/app-error";
import { asyncHandler } from "./middleware/asyncHandler.middleware";
import connctDatabase from "./config/database.config";
import authRoutes from "./routes/auth.route";
import userRoute from "./routes/user.route";
import { passportAuthenticateJwt } from "./config/passport.config";
import transactionRoute from "./routes/transaction.route";

const app = express();

const BASE_PATH = Env.BASE_PATH;
console.log(Env.MONGO_URI);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

app.use(
    cors({
        origin: Env.FRONTEND_ORIGIN,
        credentials: true,
    })
);

app.get(`/`, asyncHandler( async (req: Request, res: Response, next: NextFunction) => {
    throw new BadRequestException("This is a test error");
    res.status(HTTPSTATUS.OK).json({
        message: "This is main",
    });
}));

app.listen(Env.PORT, async () => {
    await connctDatabase();
    
    //   if (Env.NODE_ENV === "development") {
//     await initializeCrons();
//   }

  console.log(`Server is running on port ${Env.PORT} in ${Env.NODE_ENV} mode`);
});


app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, passportAuthenticateJwt, userRoute);
app.use(`${BASE_PATH}/transaction`, passportAuthenticateJwt, transactionRoute);


app.use(errorHandler);