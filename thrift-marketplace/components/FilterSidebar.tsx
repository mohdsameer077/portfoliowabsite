"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

interface Filters {
  size: string;
  condition: string;
  minPrice: string;
  maxPrice: string;
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const sizes = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];
const conditions = ["new", "like-new", "good", "fair", "poor"];

export default function FilterSidebar({ filters, onChange }: Props) {
  const [open, setOpen] = useState(false);

  function update(key: keyof Filters, value: string) {
    onChange({ ...filters, [key]: value });
  }

  function clearAll() {
    onChange({ size: "", condition: "", minPrice: "", maxPrice: "" });
  }

  const hasFilters = Object.values(filters).some(Boolean);

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </h2>
        {hasFilters && (
          <button onClick={clearAll} className="text-xs text-emerald-600 hover:underline">
            Clear all
          </button>
        )}
      </div>

      {/* Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              onClick={() => update("size", filters.size === s ? "" : s)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                filters.size === s
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "border-gray-300 text-gray-600 hover:border-emerald-400"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
        <div className="flex flex-col gap-1">
          {conditions.map((c) => (
            <label key={c} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="condition"
                value={c}
                checked={filters.condition === c}
                onChange={() => update("condition", filters.condition === c ? "" : c)}
                className="accent-emerald-600"
              />
              <span className="text-sm text-gray-600 capitalize">{c}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Price Range ($)</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => update("minPrice", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            min="0"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => update("maxPrice", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            min="0"
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:border-emerald-400"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters {hasFilters && <span className="bg-emerald-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">!</span>}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative bg-white w-72 p-6 overflow-y-auto ml-auto shadow-xl">
            <button className="absolute top-4 right-4" onClick={() => setOpen(false)}>
              <X className="w-5 h-5 text-gray-500" />
            </button>
            {content}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block w-56 flex-shrink-0">{content}</div>
    </>
  );
}
