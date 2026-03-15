"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { CheckCircle, XCircle, Loader2, Package } from "lucide-react";

interface Product {
  _id: string;
  title: string;
  price: number;
  status: string;
  condition: string;
  images: string[];
  brand: string;
  size: string;
  sellerId?: { name: string; email: string };
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/products?status=${filter}`)
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? []))
      .finally(() => setLoading(false));
  }, [filter]);

  async function updateStatus(id: string, status: "approved" | "rejected") {
    setActionLoading(id + status);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
      }
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm("Permanently delete this product?")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) setProducts((prev) => prev.filter((p) => p._id !== id));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Package className="w-6 h-6 text-blue-500" />
        Manage Products
      </h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {["pending", "approved", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 text-sm rounded-lg font-medium capitalize transition-colors ${
              filter === s
                ? "bg-emerald-600 text-white"
                : "bg-white text-gray-600 border border-gray-300 hover:border-emerald-400"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>No {filter} products</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                {product.images?.[0] ? (
                  <Image src={product.images[0]} alt={product.title} fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="w-6 h-6 text-gray-300" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900">{product.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize flex-shrink-0 ${statusColors[product.status]}`}>
                    {product.status}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mt-0.5">
                  ${product.price.toFixed(2)} · {product.brand} · {product.size} · {product.condition}
                </p>

                {product.sellerId && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Seller: {product.sellerId.name} ({product.sellerId.email})
                  </p>
                )}

                <p className="text-xs text-gray-400">
                  {new Date(product.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex flex-col gap-2 flex-shrink-0">
                {product.status === "pending" && (
                  <>
                    <button
                      onClick={() => updateStatus(product._id, "approved")}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-60"
                    >
                      {actionLoading === product._id + "approved" ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3 h-3" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(product._id, "rejected")}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1 text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 disabled:opacity-60"
                    >
                      {actionLoading === product._id + "rejected" ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => deleteProduct(product._id)}
                  className="text-xs text-gray-400 hover:text-red-500 text-center mt-1"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
