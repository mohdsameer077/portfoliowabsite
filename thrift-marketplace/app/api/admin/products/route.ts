import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Order from "@/models/Order";
import User from "@/models/User";
import { verifyToken } from "@/lib/jwt";

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

// GET all products for admin + stats
export async function GET(request: NextRequest) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await connectDB();

    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};
    if (status) query.status = status;

    const [products, totalUsers, totalOrders, pendingCount] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .populate("sellerId", "name email")
        .lean(),
      User.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments({ status: "pending" }),
    ]);

    return NextResponse.json({
      products,
      stats: {
        totalProducts: products.length,
        totalUsers,
        totalOrders,
        pendingProducts: pendingCount,
      },
    });
  } catch (error) {
    console.error("Admin GET products error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
