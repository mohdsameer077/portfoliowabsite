import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/jwt";

const BlockSchema = z.object({ isBlocked: z.boolean() });

function requireAdmin(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  try {
    const user = verifyToken(token);
    if (user.role !== "admin") return null;
    return user;
  } catch {
    return null;
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const parsed = BlockSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { id } = await params;

    // Prevent admin from blocking themselves
    if (id === admin.userId) {
      return NextResponse.json({ error: "Cannot block yourself" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked: parsed.data.isBlocked },
      { new: true, select: "-password" }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Admin PATCH user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
