import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { verifyToken } from "@/lib/jwt";

// GET seller's own products
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (user.role !== "seller" && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const [products, totalOrders] = await Promise.all([
      Product.find({ sellerId: user.userId }).sort({ createdAt: -1 }).lean(),
      Order.countDocuments({ sellerId: user.userId }),
    ]);

    const stats = {
      total: products.length,
      pending: products.filter((p) => p.status === "pending").length,
      approved: products.filter((p) => p.status === "approved").length,
      rejected: products.filter((p) => p.status === "rejected").length,
      orders: totalOrders,
    };

    return NextResponse.json({ products, stats });
  } catch (error) {
    console.error("GET seller products error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
