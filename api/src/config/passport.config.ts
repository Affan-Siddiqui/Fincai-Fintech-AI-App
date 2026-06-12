
import { ExtractJwt, Strategy as JwtStrategy, StrategyOptions } from "passport-jwt";
import { Env } from "./env.config";
import passport from "passport";
import { findByIdUserService } from "../services/user.services";

interface jwtPayload {
    userId : string
}

const options : StrategyOptions = {
    jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey : Env.JWT_SECRET,
    audience : ["user"],
    algorithms : ["HS256"]
}

passport.use( new JwtStrategy(options, async (payload : jwtPayload, done) => {
        try {
            if (!payload.userId) {
                return done(null, false, { message: "Invalid token payload" });
            }

            const user = await findByIdUserService(payload.userId);

            if (!user) {
                return done(null, false);
            }

            return done(null, user);
        } catch (error) {
            console.log("there is an error");
            
            return done(error, false);
        }
    })
)

// passport.serializeUser((user: any, done) => done(null, user));
// passport.deserializeUser((user: any, done) => done(null, user));

export const passportAuthenticateJwt = passport.authenticate("jwt", {
  session: false,
});