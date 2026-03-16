import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

const ACCESS_EXPIRES =
  process.env.ACCESS_TOKEN_EXPIRES as SignOptions["expiresIn"];

const REFRESH_EXPIRES =
  process.env.REFRESH_TOKEN_EXPIRES as SignOptions["expiresIn"];

/* ----------------------------------
   Generic helpers
----------------------------------- */

export const generateToken = (
  payload: object,
  secret: string,
  options?: SignOptions
): string => {
  return jwt.sign(payload, secret, options);
};

export const verifyToken = (
  token: string,
  secret: string
): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};

/* ----------------------------------
   Access / Refresh tokens
----------------------------------- */

export const signAccessToken = (userId: number, role: string): string => {
  const time = ACCESS_EXPIRES || "1d";
  console.log(`[AUTH DEBUG] Creating new token for User ${userId}. Expires in: ${time}`);
  
  const token = generateToken(
    { userId: userId, role },
    ACCESS_SECRET,
     { expiresIn: time }
  );
  
  console.log(`[AUTH DEBUG] NEW Token String: ${token.substring(0, 20)}...`);
  return token;
};

export const signRefreshToken = (userId: number): string => {
  return generateToken(
    { userId: userId },
    REFRESH_SECRET,
   
     { expiresIn: REFRESH_EXPIRES || "15d"}
  );
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return verifyToken(token, ACCESS_SECRET);
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return verifyToken(token, REFRESH_SECRET);
};
