import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import logger from "../utils/logger";

interface JwtPayload {
  userId: number;
  role: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
  userId?: number;
}

/**
 * Authentication Middleware
 * Validates JWT tokens and extracts user information
 */
export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    // Check if authorization header exists
    if (!authHeader) {
      logger.warn(
        `[AuthMiddleware] Missing authorization header - IP: ${req.ip}`
      );
      return res.status(401).json({
        message: "Authorization header missing",
        code: "MISSING_AUTH_HEADER",
      });
    }

    // Check if header starts with "Bearer "
    if (!authHeader.startsWith("Bearer ")) {
      logger.warn(
        `[AuthMiddleware] Invalid authorization header format - IP: ${req.ip}`
      );
      return res.status(401).json({
        message: "Invalid authorization header format",
        code: "INVALID_AUTH_FORMAT",
      });
    }

    // Extract token from header
    const token = authHeader.split(" ")[1];

    if (!token) {
      logger.warn(
        `[AuthMiddleware] Empty token provided - IP: ${req.ip}`
      );
      return res.status(401).json({
        message: "Token is empty",
        code: "EMPTY_TOKEN",
      });
    }

    // Verify token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        logger.warn(
          `[AuthMiddleware] Token expired - IP: ${req.ip}`
        );
        return res.status(401).json({
          message: "Token has expired",
          code: "TOKEN_EXPIRED",
        });
      }

      if (error.name === "JsonWebTokenError") {
        logger.warn(
          `[AuthMiddleware] Invalid token format - IP: ${req.ip}`
        );
        return res.status(401).json({
          message: "Invalid token",
          code: "INVALID_TOKEN",
        });
      }

      logger.error(
        `[AuthMiddleware] Token verification failed - Error: ${error.message}`
      );
      return res.status(401).json({
        message: "Token verification failed",
        code: "VERIFICATION_FAILED",
      });
    }

    // Validate payload structure
    if (!decoded.userId || !decoded.role) {
      logger.warn(
        `[AuthMiddleware] Invalid token payload - Missing userId or role - IP: ${req.ip}`
      );
      return res.status(401).json({
        message: "Invalid token payload",
        code: "INVALID_PAYLOAD",
      });
    }

    // Attach user to request
    req.user = {
      id: decoded.userId,
      role: decoded.role,
    };
    req.userId = decoded.userId;

    logger.info(
      `[AuthMiddleware] User authenticated - ID: ${decoded.userId}, Role: ${decoded.role}`
    );
    next();
  } catch (error: any) {
    logger.error(
      `[AuthMiddleware] Unexpected error: ${error.message}`
    );
    return res.status(500).json({
      message: "Authentication failed",
      code: "AUTH_ERROR",
    });
  }
}

/**
 * Role-based Authorization Middleware
 * Checks if user has required role
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        logger.warn(
          `[RoleMiddleware] User not authenticated - IP: ${req.ip}`
        );
        return res.status(401).json({
          message: "User not authenticated",
          code: "NOT_AUTHENTICATED",
        });
      }

      const userRole = req.user.role;

      if (!allowedRoles.includes(userRole)) {
        logger.warn(
          `[RoleMiddleware] Insufficient permissions - User ID: ${req.user.id}, Role: ${userRole}, Required: ${allowedRoles.join(", ")}`
        );
        return res.status(403).json({
          message: "Insufficient permissions",
          code: "INSUFFICIENT_PERMISSIONS",
        });
      }

      logger.info(
        `[RoleMiddleware] Role check passed - User ID: ${req.user.id}, Role: ${userRole}`
      );
      next();
    } catch (error: any) {
      logger.error(
        `[RoleMiddleware] Unexpected error: ${error.message}`
      );
      return res.status(500).json({
        message: "Authorization check failed",
        code: "AUTH_CHECK_ERROR",
      });
    }
  };
}

