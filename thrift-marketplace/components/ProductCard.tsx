import Link from "next/link";
import Image from "next/image";
import { Tag, Ruler, Star } from "lucide-react";

interface Product {
  _id: string;
  title: string;
  price: number;
  size: string;
  brand: string;
  condition: string;
  images: string[];
  sellerId?: { name: string } | string;
}

const conditionColors: Record<string, string> = {
  new: "bg-green-100 text-green-800",
  "like-new": "bg-emerald-100 text-emerald-800",
  good: "bg-blue-100 text-blue-800",
  fair: "bg-yellow-100 text-yellow-800",
  poor: "bg-red-100 text-red-800",
};

export default function ProductCard({ product }: { product: Product }) {
  const image = product.images?.[0] ?? "/placeholder.png";
  const sellerName =
    typeof product.sellerId === "object" && product.sellerId !== null
      ? product.sellerId.name
      : "Unknown";

  return (
    <Link
      href={`/products/${product._id}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-emerald-300 transition-all duration-200"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Image
          src={image}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          unoptimized
        />
        <span
          className={`absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full capitalize ${conditionColors[product.condition] ?? "bg-gray-100 text-gray-700"}`}
        >
          {product.condition}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate group-hover:text-emerald-600 transition-colors">
          {product.title}
        </h3>

        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" />
            {product.brand}
          </span>
          <span className="flex items-center gap-1">
            <Ruler className="w-3.5 h-3.5" />
            {product.size}
          </span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="text-xl font-bold text-emerald-600">${product.price.toFixed(2)}</span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Star className="w-3 h-3" />
            {sellerName}
          </span>
        </div>
      </div>
    </Link>
  );
}
