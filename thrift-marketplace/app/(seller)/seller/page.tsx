"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Plus, CheckCircle, Clock, XCircle, ShoppingBag, Loader2 } from "lucide-react";

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  orders: number;
}

interface Product {
  _id: string;
  title: string;
  price: number;
  status: string;
  condition: string;
  images: string[];
  createdAt: string;
}

const statusIcon: Record<string, React.ReactNode> = {
  pending: <Clock className="w-4 h-4 text-yellow-500" />,
  approved: <CheckCircle className="w-4 h-4 text-green-500" />,
  rejected: <XCircle className="w-4 h-4 text-red-500" />,
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export default function SellerDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/seller/products");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setProducts(data.products ?? []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p._id !== id));
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
        <Link
          href="/seller/add-product"
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total Products", value: stats.total, icon: <Package className="w-5 h-5 text-gray-500" />, color: "bg-gray-50" },
            { label: "Pending", value: stats.pending, icon: <Clock className="w-5 h-5 text-yellow-500" />, color: "bg-yellow-50" },
            { label: "Approved", value: stats.approved, icon: <CheckCircle className="w-5 h-5 text-green-500" />, color: "bg-green-50" },
            { label: "Rejected", value: stats.rejected, icon: <XCircle className="w-5 h-5 text-red-500" />, color: "bg-red-50" },
            { label: "Orders", value: stats.orders, icon: <ShoppingBag className="w-5 h-5 text-blue-500" />, color: "bg-blue-50" },
          ].map((s) => (
            <div key={s.label} className={`${s.color} rounded-xl p-4 border border-gray-100`}>
              <div className="flex items-center gap-2 mb-1">
                {s.icon}
                <span className="text-xs text-gray-500">{s.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Products */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Products</h2>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <Package className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">No products yet.</p>
            <Link href="/seller/add-product" className="text-emerald-600 hover:underline text-sm mt-2 inline-block">
              Add your first product
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Product</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Price</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Date</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/products/${product._id}`}
                          className="font-medium text-gray-900 hover:text-emerald-600"
                        >
                          {product.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-emerald-600 font-medium">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${statusColors[product.status]}`}>
                          {statusIcon[product.status]}
                          {product.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => deleteProduct(product._id)}
                          className="text-red-400 hover:text-red-600 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
