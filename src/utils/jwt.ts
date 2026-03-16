import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";

if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
  throw new Error(
    "❌ Missing JWT secrets. Set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in environment variables."
  );
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES = (process.env.ACCESS_TOKEN_EXPIRES || "1d") as SignOptions["expiresIn"];
const REFRESH_EXPIRES = (process.env.REFRESH_TOKEN_EXPIRES || "15d") as SignOptions["expiresIn"];

export const generateToken = (
  payload: object,
  secret: string,
  options?: SignOptions
): string => jwt.sign(payload, secret, options);

export const verifyToken = (token: string, secret: string): JwtPayload =>
  jwt.verify(token, secret) as JwtPayload;

export const signAccessToken = (userId: number, role: string): string =>
  generateToken({ userId, role }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });

export const signRefreshToken = (userId: number): string =>
  generateToken({ userId }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });

export const verifyAccessToken = (token: string): JwtPayload =>
  verifyToken(token, ACCESS_SECRET);

export const verifyRefreshToken = (token: string): JwtPayload =>
  verifyToken(token, REFRESH_SECRET);