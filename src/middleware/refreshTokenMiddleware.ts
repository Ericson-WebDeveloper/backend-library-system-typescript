import jwt from "jsonwebtoken";
import User from "../model/User";
import fs from "fs";
import { generateRefreshToken, generateToken } from "../helper/IndexHelper";
import { Request, Response, NextFunction } from "express";

export const refreshAthorization = async (req: Request, res: Response, next: NextFunction) => {
  const { refresh_token } = req.cookies;

  if (!refresh_token) {
      return res.status(401).json({message: 'You are unanthenticated. No valid token'});
  } else {
    try {

      const publickey = fs.readFileSync(
        "./src/config/refreshtoken/public.pem",
        { encoding: "utf8" }
      );

      let { email } = jwt.verify(refresh_token, publickey) as { email: string };

      if (!email) {
        // res.status(401);
        // throw new Error(`Token Invalid Cannot to Issue New.`);
        return res.status(401).json({message: 'Token Invalid Cannot to Issue New.'});
      }

      let user = await User.findOne({ email: email }).select("-password");

      if (!user) {
        // res.status(401);
        // throw new Error(`Token Invalid Cannot to Issue New.`);
        return res.status(401).json({message: 'Token Invalid Cannot to Issue New.'});
      }

      const token = generateToken(email);

      res.cookie("auth_token", token, {
        // expires: new Date(Date.now() + (1000 * 60 * 60 * 1)), // 1h hr automatic in browser delete when expired
        maxAge: 1 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV !== "development",
        httpOnly: true,
        // path: '/',
        sameSite: "lax",
        // sameSite: 'None'
      });
      return res.status(200).json({ message: "Token Refresh Success." });
    } catch (error: any) {

      return res.status(401).json({message: 'You are unanthenticated.'});
    }
  }
};
