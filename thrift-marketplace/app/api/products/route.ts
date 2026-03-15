import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { verifyToken } from "@/lib/jwt";
import { apiRateLimit } from "@/lib/rateLimit";

const ProductSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(10).max(2000),
  price: z.number().min(0),
  size: z.string().min(1),
  brand: z.string().min(1),
  condition: z.enum(["new", "like-new", "good", "fair", "poor"]),
  images: z.array(z.string().url()).min(1).max(5),
});

// GET all approved products (public, with filtering)
export async function GET(request: NextRequest) {
  const limited = apiRateLimit(request);
  if (limited) return limited;

  try {
    await connectDB();

    const { searchParams } = request.nextUrl;
    const size = searchParams.get("size");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const condition = searchParams.get("condition");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "12"), 50);
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = { status: "approved" };
    if (size) query.size = size;
    if (condition) query.condition = condition;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("sellerId", "name")
        .lean(),
      Product.countDocuments(query),
    ]);

    return NextResponse.json({ products, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("GET products error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST create product (seller only)
export async function POST(request: NextRequest) {
  const limited = apiRateLimit(request);
  if (limited) return limited;

  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (user.role !== "seller" && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = ProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectDB();

    const product = await Product.create({
      ...parsed.data,
      sellerId: user.userId,
      status: "pending",
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("POST product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
