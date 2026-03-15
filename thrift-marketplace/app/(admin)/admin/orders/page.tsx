"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Loader2 } from "lucide-react";
import OrderCard from "@/components/OrderCard";

interface Order {
  _id: string;
  productId?: { title: string; price: number; images: string[] };
  buyerId?: { name: string; email: string };
  sellerId?: { name: string; email: string };
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <ShoppingBag className="w-6 h-6 text-emerald-500" />
        All Orders
      </h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-400 py-20">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order._id} className="space-y-1">
              <OrderCard order={order} />
              <div className="px-4 text-xs text-gray-400 flex gap-4">
                {order.buyerId && <span>Buyer: {order.buyerId.name} ({order.buyerId.email})</span>}
                {order.sellerId && <span>Seller: {order.sellerId.name} ({order.sellerId.email})</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
