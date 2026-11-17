import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { authConfig } from "../config/auth.js";
import { AppError } from "../shared/errors/AppError.js";
import { userRepository } from "../features/users/user.repository.js";

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new AppError(
        "Authentication token is required.",
        401
      );
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new AppError(
        "Invalid authentication format.",
        401
      );
    }

    let payload: string | jwt.JwtPayload;

    try {
      payload = jwt.verify(
        token,
        authConfig.jwtSecret
      );
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError(
          "Invalid or expired authentication token.",
          401
        );
      }

      throw error;
    }

    if (
      typeof payload !== "object" ||
      payload === null ||
      typeof payload.userId !== "number" ||
      typeof payload.roleId !== "number" ||
      typeof payload.role !== "string"
    ) {
      throw new AppError(
        "Invalid authentication token.",
        401
      );
    }

    const user = await userRepository.findById(payload.userId);

    if (!user) {
      throw new AppError(
        "User account no longer exists.",
        401
      );
    }

    if (user.status !== "ACTIVE") {
      throw new AppError(
        "Your account is inactive.",
        403
      );
    }

    req.user = {
      userId: user.id,
      roleId: user.roleId,
      role: user.role.name,
    };

    next();
  } catch (error) {
    next(error);
  }
}
