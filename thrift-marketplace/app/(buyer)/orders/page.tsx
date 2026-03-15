"use client";

import { useState, useEffect } from "react";
import OrderCard from "@/components/OrderCard";
import { Package, Loader2 } from "lucide-react";

interface Order {
  _id: string;
  productId?: { title: string; price: number; images: string[] };
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) {
          setError("Failed to load orders");
          return;
        }
        const data = await res.json();
        setOrders(data.orders ?? []);
      } catch {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Package className="w-6 h-6 text-emerald-600" />
        My Orders
      </h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : error ? (
        <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-lg">{error}</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 text-lg font-medium">No orders yet</p>
          <a href="/" className="mt-4 inline-block text-emerald-600 hover:underline text-sm">
            Start shopping
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
