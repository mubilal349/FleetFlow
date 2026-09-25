import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { User, IUser, UserRole } from "../models/User.js";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

interface LoginInput {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthResponse {
  user: AuthUser;
  token: string;
}

/**
 * Temporary development organization.
 *
 * This will eventually come from the Organization Service
 * when FleetFlow supports real organization creation and
 * membership management.
 */
const DEFAULT_ORGANIZATION_ID = "org-demo-001";

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined.");
  }

  return secret;
};

const generateToken = (user: IUser): string => {
  const secret = getJwtSecret();

  console.log(
    "🔐 AUTH JWT SECRET CHECK:",
    secret.length,
    secret.slice(0, 3),
    secret.slice(-3),
  );

  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    },
    secret,
    {
      expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
    },
  );
};

const sanitizeUser = (user: IUser): AuthUser => {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

export const registerUser = async (
  input: RegisterInput,
): Promise<AuthResponse> => {
  try {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    const password = input.password;

    if (!name || !email || !password) {
      throw new Error("Name, email and password are required.");
    }

    if (name.length < 2) {
      throw new Error("Name must be at least 2 characters long.");
    }

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long.");
    }

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      throw new Error("An account with this email already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: input.role || "customer",

      // Temporary organization until the
      // Organization Service is implemented.
      organizationId: DEFAULT_ORGANIZATION_ID,
    });

    const token = generateToken(user);

    console.log(
      "🔑 AUTH TOKEN:",
      token.slice(0, 20) + "...",
      "length:",
      token.length,
    );

    return {
      user: sanitizeUser(user),
      token,
    };
  } catch (error) {
    console.error("❌ registerUser failed:", error);

    if (error instanceof Error) {
      console.error("❌ Error message:", error.message);

      console.error("❌ Error stack:", error.stack);
    }

    throw error;
  }
};

export const loginUser = async (input: LoginInput): Promise<AuthResponse> => {
  const email = input.email.trim().toLowerCase();

  const password = input.password;

  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  const user = await User.findOne({
    email,
  }).select("+password");

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  if (!user.isActive) {
    throw new Error("Your account has been deactivated.");
  }

  /*
   * Existing users created before organizationId
   * was introduced may not have an organization.
   */
  if (!user.organizationId) {
    user.organizationId = DEFAULT_ORGANIZATION_ID;

    await user.save();
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw new Error("Invalid email or password.");
  }

  const token = generateToken(user);

  return {
    user: sanitizeUser(user),
    token,
  };
};
