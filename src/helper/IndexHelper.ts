import bcrypt from 'bcrypt';
import * as fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

export const hashPass = async (password: string) => {
    // generate salt to hash password
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

export const comparePass = async(password: string, userpassword: string) => {
    return await bcrypt.compare(password, userpassword);
}

export const getAuthCookieExpiration = () => {
    let date = new Date();
    date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));  // 7 days
    return date;
}

export const generateToken = (email: string) => {
    const privatekey = fs.readFileSync('./src/config/private.pem',{ encoding: "utf8" });
    let token = jwt.sign({email}, privatekey, {
        expiresIn: '10m',
        algorithm: 'RS256'
    });
    return token;
}

export const generateRefreshToken = (email: string) => {
    const privatekey = fs.readFileSync('./src/config/refreshtoken/private.pem',{ encoding: "utf8" });
    let token = jwt.sign({email}, privatekey, {
        expiresIn: '1w',
        algorithm: 'RS256'
    });
    return token;
}