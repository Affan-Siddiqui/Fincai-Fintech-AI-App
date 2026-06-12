import mongoose from "mongoose";
import UserModel from "../models/user.model";
import { NotFoundException, UnauthorizedException } from "../utils/app-error";
import { LoginSchemaType, RegisterSchemaType } from "../validators/auth.validator";
import ReportSettingModel from "../models/report-setting.model";
import { calulateNextReportDate } from "../utils/helper";
import { signJwtToken } from "../utils/jwt";

export const registerService = async(body : RegisterSchemaType) => {
    
    const { email } = body;

    const session = await mongoose.startSession();

    try {
        const user = await session.withTransaction(async () => {
            const existingUser = await UserModel.findOne({email}).session(session);
            if (existingUser) throw new UnauthorizedException("User ALready Exist");
        
            const newUser = new UserModel({
                ... body,
            })

            console.log("Connection DB:", mongoose.connection.db?.databaseName);
            console.log("User DB:", UserModel.db?.name);
            console.log("User Namespace:", UserModel.collection.namespace);
        
            await newUser.save({ session });

            const reportSetting = new ReportSettingModel({
                userId : newUser._id,
                isEnabled : true,
                nextReportDate: calulateNextReportDate(),
                lastSentDate : null, 
            })

            await reportSetting.save({ session });

            return { 
                user : newUser.omitPassword(),
                reportSetting,
            }
        })

        return user;

    } catch (error) {
        throw error;
    }finally{
        await session.endSession();
    }


}




export const loginService = async(body : LoginSchemaType) => {
    
    const { email, password } = body;
    const user = await UserModel.findOne({ email });
    if (!user) throw new NotFoundException("User with this email does not exist !");

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) throw new UnauthorizedException("Invalid credentials");

    const { token, expiresAt } = signJwtToken({
        userId : user.id
    });

    const reportSetting = await ReportSettingModel.findOne({
        userId : user.id,
    },{
        id : 1,
        frequency : 1,
        isEnabled : 1 
    }).lean()

    return {
        user: user.omitPassword(),
        accessToken: token,
        expiresAt,
        reportSetting,
    };
}


