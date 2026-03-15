"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingBag,
  Clock,
  Loader2,
} from "lucide-react";

interface Stats {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  pendingProducts: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) => setStats(d.stats ?? null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <LayoutDashboard className="w-6 h-6 text-emerald-600" />
        Admin Dashboard
      </h1>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Products", value: stats.totalProducts, icon: <Package className="w-6 h-6 text-blue-500" />, color: "bg-blue-50" },
            { label: "Pending Review", value: stats.pendingProducts, icon: <Clock className="w-6 h-6 text-yellow-500" />, color: "bg-yellow-50" },
            { label: "Total Users", value: stats.totalUsers, icon: <Users className="w-6 h-6 text-purple-500" />, color: "bg-purple-50" },
            { label: "Total Orders", value: stats.totalOrders, icon: <ShoppingBag className="w-6 h-6 text-emerald-500" />, color: "bg-emerald-50" },
          ].map((s) => (
            <div key={s.label} className={`${s.color} rounded-xl p-5 border border-gray-100`}>
              {s.icon}
              <p className="text-2xl font-bold text-gray-900 mt-2">{s.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {[
          {
            href: "/admin/products",
            icon: <Package className="w-8 h-8 text-blue-500" />,
            title: "Manage Products",
            desc: "Approve or reject product listings",
            badge: stats?.pendingProducts,
          },
          {
            href: "/admin/users",
            icon: <Users className="w-8 h-8 text-purple-500" />,
            title: "Manage Users",
            desc: "Block or unblock user accounts",
          },
          {
            href: "/admin/orders",
            icon: <ShoppingBag className="w-8 h-8 text-emerald-500" />,
            title: "View Orders",
            desc: "Monitor all marketplace orders",
          },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-emerald-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              {card.icon}
              {card.badge !== undefined && card.badge > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                  {card.badge}
                </span>
              )}
            </div>
            <h2 className="font-semibold text-gray-900 group-hover:text-emerald-600">{card.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
