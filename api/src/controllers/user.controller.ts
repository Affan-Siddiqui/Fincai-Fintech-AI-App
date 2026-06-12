
import { asyncHandler } from "../middleware/asyncHandler.middleware";
import { Request, Response } from "express";
import { findByIdUserService } from "../services/user.services";
import { HTTPSTATUS } from "../config/http.config";

export const getCurrentUser = asyncHandler(
    async (req : Request, res : Response) => {
        
        console.log("we herer");
        
        const userId = req.user?._id?.toString();

        if (!userId) {
            return res.status(HTTPSTATUS.BAD_REQUEST).json({
                message: "User ID is missing",
            });
        }

        const user = await findByIdUserService(userId);

        return res.status(HTTPSTATUS.OK).json({
            message : "User Fetched successfully",
            user,
        })
    }
)