"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ShoppingCart, Star, Tag, Ruler, CheckCircle, Loader2, ArrowLeft } from "lucide-react";

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  size: string;
  brand: string;
  condition: string;
  images: string[];
  sellerId?: { name: string };
  status: string;
}

interface Review {
  _id: string;
  rating: number;
  comment: string;
  userId?: { name: string };
  createdAt: string;
}

const conditionColors: Record<string, string> = {
  new: "bg-green-100 text-green-800",
  "like-new": "bg-emerald-100 text-emerald-800",
  good: "bg-blue-100 text-blue-800",
  fair: "bg-yellow-100 text-yellow-800",
  poor: "bg-red-100 text-red-800",
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [selectedImg, setSelectedImg] = useState(0);

  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        setProduct(data.product ?? null);
        setReviews(data.reviews ?? []);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  // Check if in cart
  useEffect(() => {
    const cart: string[] = JSON.parse(localStorage.getItem("cart") ?? "[]");
    if (cart.includes(id)) setOrdered(true);
  }, [id]);

  function addToCart() {
    const cart: string[] = JSON.parse(localStorage.getItem("cart") ?? "[]");
    if (!cart.includes(id)) {
      cart.push(id);
      localStorage.setItem("cart", JSON.stringify(cart));
    }
    router.push("/cart");
  }

  async function placeOrder() {
    setOrdering(true);
    setOrderError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        setOrderError(data.error ?? "Order failed");
      } else {
        setOrdered(true);
        router.push("/orders");
      }
    } catch {
      setOrderError("Something went wrong");
    } finally {
      setOrdering(false);
    }
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setReviewError("");
    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, ...reviewForm }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReviewError(data.error ?? "Failed to submit review");
      } else {
        setReviewSuccess(true);
        setReviews((prev) => [data.review, ...prev]);
        setReviewForm({ rating: 5, comment: "" });
      }
    } catch {
      setReviewError("Something went wrong");
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Product not found.</p>
        <button onClick={() => router.back()} className="mt-4 text-emerald-600 hover:underline text-sm">Go back</button>
      </div>
    );
  }

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-10 bg-white rounded-2xl border border-gray-200 p-6">
        {/* Images */}
        <div>
          <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 mb-3">
            <Image
              src={product.images[selectedImg] ?? "/placeholder.png"}
              alt={product.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImg(i)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImg === i ? "border-emerald-500" : "border-gray-200"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" unoptimized />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h1>

          {avgRating && (
            <div className="flex items-center gap-1 mb-3">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{avgRating}</span>
              <span className="text-xs text-gray-400">({reviews.length} reviews)</span>
            </div>
          )}

          <p className="text-3xl font-bold text-emerald-600 mb-4">
            ${product.price.toFixed(2)}
          </p>

          <p className="text-gray-600 text-sm leading-relaxed mb-5">{product.description}</p>

          <div className="flex flex-wrap gap-3 mb-6">
            <span className={`text-sm px-3 py-1 rounded-full font-medium capitalize ${conditionColors[product.condition] ?? "bg-gray-100 text-gray-700"}`}>
              {product.condition}
            </span>
            <span className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              <Ruler className="w-3.5 h-3.5" /> Size: {product.size}
            </span>
            <span className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              <Tag className="w-3.5 h-3.5" /> {product.brand}
            </span>
          </div>

          {product.sellerId && (
            <p className="text-sm text-gray-500 mb-5">
              Sold by <span className="font-medium text-gray-700">{product.sellerId.name}</span>
            </p>
          )}

          {orderError && (
            <p className="text-red-500 text-sm mb-3 bg-red-50 px-3 py-2 rounded-lg">{orderError}</p>
          )}

          {ordered ? (
            <div className="flex items-center gap-2 text-emerald-600 font-medium">
              <CheckCircle className="w-5 h-5" />
              Order placed!
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={addToCart}
                className="flex-1 flex items-center justify-center gap-2 border-2 border-emerald-600 text-emerald-600 py-2.5 rounded-xl font-medium hover:bg-emerald-50 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
              <button
                onClick={placeOrder}
                disabled={ordering}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-2.5 rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-60 transition-colors"
              >
                {ordering ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Buy Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Reviews</h2>

        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h3 className="font-medium text-gray-800 mb-3">Write a Review</h3>
          {reviewSuccess ? (
            <p className="text-emerald-600 text-sm">Review submitted!</p>
          ) : (
            <form onSubmit={submitReview} className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: n })}
                    >
                      <Star
                        className={`w-6 h-6 ${n <= reviewForm.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                required
                minLength={5}
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                placeholder="Share your experience..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {reviewError && <p className="text-red-500 text-xs">{reviewError}</p>}
              <button
                type="submit"
                disabled={submittingReview}
                className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-60"
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          )}
        </div>

        {reviews.length === 0 ? (
          <p className="text-gray-400 text-sm">No reviews yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`w-4 h-4 ${n <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {review.userId?.name ?? "Anonymous"}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{review.comment}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
