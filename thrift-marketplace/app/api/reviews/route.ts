import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Review";
import { verifyToken } from "@/lib/jwt";

const ReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5).max(1000),
});

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);

    const body = await request.json();
    const parsed = ReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    await connectDB();

    const existing = await Review.findOne({
      userId: user.userId,
      productId: parsed.data.productId,
    });

    if (existing) {
      return NextResponse.json({ error: "Already reviewed this product" }, { status: 409 });
    }

    const review = await Review.create({ userId: user.userId, ...parsed.data });
    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("POST review error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
