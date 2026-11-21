
/// <reference path="../src/types/express.d.ts" />

import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { authConfig } from "../src/config/auth.js";
import { authService } from "../src/features/auth/auth.service.js";
import { userRepository } from "../src/features/users/user.repository.js";
import { authenticate } from "../src/middleware/auth.middleware.js";
import { authorize } from "../src/middleware/permission.middleware.js";
import { errorMiddleware } from "../src/middleware/error.middleware.js";
import { AppError } from "../src/shared/errors/AppError.js";

vi.mock("../src/features/users/user.repository.js", () => ({
  userRepository: {
    findById: vi.fn(),
  },
}));

vi.mock("../src/features/auth/auth.service.js", () => ({
  authService: {
    getUserPermissions: vi.fn(),
  },
}));

const mockFindById = vi.mocked(userRepository.findById);

const mockGetUserPermissions = vi.mocked(
  authService.getUserPermissions
);

const activeUser = {
  id: 1,
  roleId: 2,
  status: "ACTIVE",
  role: {
    name: "Staff",
  },
};

function createToken(
  payload: Record<string, unknown> = {
    userId: 1,
    roleId: 2,
    role: "Staff",
  },
  expiresIn: string = "1h"
) {
  return jwt.sign(
    payload,
    authConfig.jwtSecret,
    { expiresIn } as jwt.SignOptions
  );
}

function createApp() {
  const app = express();

  app.get(
    "/protected",
    authenticate,
    (req, res) => {
      res.status(200).json({
        success: true,
        user: req.user,
      });

    }
  );

  app.get(
    "/restricted",
    authenticate,
    authorize("products.create"),
    (_req, res) => {
      res.status(200).json({
        success: true,
        message: "Access granted.",
      });
    }
  );

  app.get(
    "/authorize-only",
    authorize("products.create"),
    (_req, res) => {
      res.status(200).json({
        success: true,
      });
    }
  );

  app.use(errorMiddleware);

  return app;
}

const app = createApp();

describe("Authentication middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when the authorization header is missing", async () => {
    const response = await request(app).get("/protected");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "Authentication token is required."
    );
    expect(mockFindById).not.toHaveBeenCalled();
  });

  it("returns 401 when the Bearer format is invalid", async () => {
    const response = await request(app)
      .get("/protected")
      .set("Authorization", "Basic some-token");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "Invalid authentication format."
    );
  });

  it("returns 401 for an invalid token", async () => {
    const response = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "Invalid or expired authentication token."
    );
  });

  it("returns 401 for an expired token", async () => {
    const token = createToken(
      {
        userId: 1,
        roleId: 2,
        role: "Staff",
      },
      "-1h"
    );

    const response = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "Invalid or expired authentication token."
    );
  });

  it("returns 401 when required token claims are missing", async () => {
    const token = createToken({
      userId: 1,
      role: "Staff",
    });

    const response = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "Invalid authentication token."
    );
    expect(mockFindById).not.toHaveBeenCalled();
  });

  it("returns 401 when the user account no longer exists", async () => {
    mockFindById.mockResolvedValue(null);

    const token = createToken();

    const response = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "User account no longer exists."
    );
  });

  it("returns 403 when the user account is inactive", async () => {
    mockFindById.mockResolvedValue({
      ...activeUser,
      status: "INACTIVE",
    } as Awaited<
      ReturnType<typeof userRepository.findById>
    >);

    const token = createToken();

    const response = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "Your account is inactive."
    );
  });

  it("allows an active user and uses the current database role", async () => {
    mockFindById.mockResolvedValue(
      activeUser as Awaited<
        ReturnType<typeof userRepository.findById>
      >
    );

    const token = createToken({
      userId: 1,
      roleId: 99,
      role: "Administrator",
    });

    const response = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user).toEqual({
      userId: 1,
      roleId: 2,
      role: "Staff",
    });
    expect(mockFindById).toHaveBeenCalledWith(1);
  });
});

describe("Authorization middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockFindById.mockResolvedValue(
      activeUser as Awaited<
        ReturnType<typeof userRepository.findById>
      >
    );
  });

  it("returns 401 when req.user is missing", async () => {
    const response = await request(app).get("/authorize-only");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "Authentication required."
    );
    expect(mockGetUserPermissions).not.toHaveBeenCalled();
  });

  it("returns 404 when the permission service cannot find the user", async () => {
    mockGetUserPermissions.mockRejectedValue(
      new AppError("User not found.", 404)
    );

    const token = createToken();

    const response = await request(app)
      .get("/restricted")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("User not found.");
  });

  it("returns 403 when the required permission is missing", async () => {
    mockGetUserPermissions.mockResolvedValue([
      "products.read",
    ]);

    const token = createToken();

    const response = await request(app)
      .get("/restricted")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "You do not have permission to perform this action."
    );
    expect(mockGetUserPermissions).toHaveBeenCalledWith(1);
  });

  it("allows access when the required permission exists", async () => {
    mockGetUserPermissions.mockResolvedValue([
      "products.read",
      "products.create",
    ]);

    const token = createToken();

    const response = await request(app)
      .get("/restricted")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Access granted.");
  });
});
