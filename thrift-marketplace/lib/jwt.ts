import jwt from "jsonwebtoken";

export interface JWTPayload {
  userId: string;
  email: string;
  role: "buyer" | "seller" | "admin";
}

export function signToken(payload: JWTPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined");
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined");
  return jwt.verify(token, secret) as JWTPayload;
}
