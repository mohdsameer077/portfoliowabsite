"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Trash2, ShoppingCart } from "lucide-react";

interface Product {
  _id: string;
  title: string;
  price: number;
  images: string[];
  brand: string;
  size: string;
  status: string;
}

export default function CartPage() {
  const router = useRouter();
  const [cartIds, setCartIds] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCartProducts = useCallback(async (ids: string[]) => {
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const fetched: Product[] = [];
    for (const id of ids) {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.product) fetched.push(data.product);
        }
      } catch {
        // skip
      }
    }
    setProducts(fetched);
    setLoading(false);
  }, []);

  useEffect(() => {
    const ids: string[] = JSON.parse(localStorage.getItem("cart") ?? "[]");
    setCartIds(ids);
    fetchCartProducts(ids);
  }, [fetchCartProducts]);

  function removeItem(id: string) {
    const updated = cartIds.filter((c) => c !== id);
    setCartIds(updated);
    setProducts((prev) => prev.filter((p) => p._id !== id));
    localStorage.setItem("cart", JSON.stringify(updated));
  }

  const total = products.reduce((s, p) => s + p.price, 0);

  async function placeAllOrders() {
    let success = 0;
    for (const product of products) {
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product._id }),
        });
        if (res.ok || res.status === 409) success++;
      } catch {
        // skip
      }
    }
    if (success > 0) {
      localStorage.setItem("cart", "[]");
      router.push("/orders");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <ShoppingCart className="w-6 h-6 text-emerald-600" />
        Your Cart
      </h1>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 text-lg font-medium">Your cart is empty</p>
          <Link href="/" className="mt-4 inline-block text-emerald-600 hover:underline text-sm">
            Browse products
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 items-center"
              >
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                  <Image
                    src={product.images?.[0] ?? "/placeholder.png"}
                    alt={product.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${product._id}`}
                    className="font-semibold text-gray-900 hover:text-emerald-600 truncate block"
                  >
                    {product.title}
                  </Link>
                  <p className="text-sm text-gray-500">{product.brand} · Size {product.size}</p>
                  {product.status !== "approved" && (
                    <span className="text-xs text-red-500">Unavailable</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-emerald-600">${product.price.toFixed(2)}</span>
                  <button
                    onClick={() => removeItem(product._id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Subtotal ({products.length} items)</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-lg border-t pt-3 mb-4">
              <span>Total</span>
              <span className="text-emerald-600">${total.toFixed(2)}</span>
            </div>
            <button
              onClick={placeAllOrders}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
            >
              Place Order ({products.length} item{products.length > 1 ? "s" : ""})
            </button>
          </div>
        </>
      )}
    </div>
  );
}
