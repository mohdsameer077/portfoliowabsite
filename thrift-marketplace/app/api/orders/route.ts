import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { verifyToken } from "@/lib/jwt";
import { apiRateLimit } from "@/lib/rateLimit";

const OrderSchema = z.object({
  productId: z.string().min(1),
});

export async function GET(request: NextRequest) {
  const limited = apiRateLimit(request);
  if (limited) return limited;

  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    await connectDB();

    let orders;
    if (user.role === "admin") {
      orders = await Order.find({})
        .populate("buyerId", "name email")
        .populate("sellerId", "name email")
        .populate("productId", "title price images")
        .sort({ createdAt: -1 })
        .lean();
    } else if (user.role === "seller") {
      orders = await Order.find({ sellerId: user.userId })
        .populate("buyerId", "name email")
        .populate("productId", "title price images")
        .sort({ createdAt: -1 })
        .lean();
    } else {
      orders = await Order.find({ buyerId: user.userId })
        .populate("sellerId", "name")
        .populate("productId", "title price images")
        .sort({ createdAt: -1 })
        .lean();
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("GET orders error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const limited = apiRateLimit(request);
  if (limited) return limited;

  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (user.role !== "buyer" && user.role !== "admin") {
      return NextResponse.json({ error: "Only buyers can place orders" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = OrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    await connectDB();

    const product = await Product.findById(parsed.data.productId);
    if (!product || product.status !== "approved") {
      return NextResponse.json({ error: "Product not available" }, { status: 404 });
    }

    // Prevent seller from buying their own product
    if (product.sellerId.toString() === user.userId) {
      return NextResponse.json({ error: "Cannot order your own product" }, { status: 400 });
    }

    const existing = await Order.findOne({
      buyerId: user.userId,
      productId: parsed.data.productId,
    });
    if (existing) {
      return NextResponse.json({ error: "Already ordered this product" }, { status: 409 });
    }

    const order = await Order.create({
      buyerId: user.userId,
      sellerId: product.sellerId,
      productId: product._id,
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("POST order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
