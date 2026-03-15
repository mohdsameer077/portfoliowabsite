import Image from "next/image";
import { Package, Clock } from "lucide-react";

interface Order {
  _id: string;
  productId?: {
    title: string;
    price: number;
    images: string[];
  };
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
}

const orderStatusColors: Record<string, string> = {
  placed: "bg-blue-100 text-blue-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  shipped: "bg-yellow-100 text-yellow-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const paymentStatusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600",
  paid: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-orange-100 text-orange-700",
};

export default function OrderCard({ order }: { order: Order }) {
  const product = order.productId;
  const image = product?.images?.[0] ?? "/placeholder.png";

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 items-start">
      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
        {product ? (
          <Image src={image} alt={product.title} fill className="object-cover" unoptimized />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package className="w-8 h-8 text-gray-300" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">
          {product?.title ?? "Product unavailable"}
        </h3>
        {product && (
          <p className="text-emerald-600 font-bold">${product.price.toFixed(2)}</p>
        )}

        <div className="flex flex-wrap gap-2 mt-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${orderStatusColors[order.orderStatus] ?? "bg-gray-100 text-gray-600"}`}>
            {order.orderStatus}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${paymentStatusColors[order.paymentStatus] ?? "bg-gray-100 text-gray-600"}`}>
            Payment: {order.paymentStatus}
          </span>
        </div>

        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(order.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
