"use client";

import React, { useState } from "react";
import {
  X,
  ShoppingBag,
  Heart,
  CheckCircle2,
  Ruler,
  Layers,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Product } from "@/data/initialData";

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, color: string, quantity: number) => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
}

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
}: ProductDetailModalProps) {
  const [selectedColor, setSelectedColor] = useState<string>(
    product?.colors[0]?.name || "Default"
  );
  const [quantity, setQuantity] = useState(1);

  React.useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0]?.name || "Default");
      setQuantity(1);
    }
  }, [product]);

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden grid grid-cols-1 md:grid-cols-2 max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-stone-700 hover:bg-stone-900 hover:text-white transition shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image */}
        <div className="relative bg-stone-100 h-72 md:h-auto overflow-hidden">
          <img
            src={product.image}
            alt={product.nameEn}
            className="w-full h-full object-cover"
          />
          {product.badge && (
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-900 text-amber-50 shadow">
              {product.badge}
            </span>
          )}
        </div>

        {/* Product Info */}
        <div className="p-6 md:p-7 overflow-y-auto flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between text-xs text-amber-800 font-semibold uppercase tracking-wider mb-1">
              <span>{product.category}</span>
            </div>

            <h2 className="text-xl font-bold text-stone-900 leading-snug">
              {product.nameEn}
            </h2>

            {/* Price */}
            <div className="mt-3 space-y-1.5">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-extrabold text-stone-900">
                  {product.price.toLocaleString()} MMK
                </span>
                <span className="text-xs font-bold text-stone-500">
                  (လက်လီဈေး)
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-stone-400 line-through">
                    {product.originalPrice.toLocaleString()} MMK
                  </span>
                )}
              </div>
              {product.wholesalePrice && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-100/80 border border-amber-300 text-amber-950 text-xs font-bold">
                  <span>လက်ကားဈေး (၅ လုံးနှင့်အထက်):</span>
                  <span className="text-sm font-extrabold text-amber-900">
                    {product.wholesalePrice.toLocaleString()} MMK / တစ်လုံး
                  </span>
                </div>
              )}
            </div>

            {/* Descriptions */}
            <div className="mt-4 space-y-2 text-sm text-stone-600 bg-stone-50 p-3.5 rounded-2xl border border-stone-200/70">
              <p className="text-stone-800 font-medium leading-relaxed">
                {product.descriptionMm}
              </p>
              <p className="text-xs text-stone-500 leading-relaxed">
                {product.descriptionEn}
              </p>
            </div>

            {/* Specifications */}
            <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-100/80 text-stone-700">
                <Layers className="w-4 h-4 text-amber-800 shrink-0" />
                <div>
                  <span className="block text-[10px] text-stone-500">Material</span>
                  <span className="font-semibold line-clamp-1">{product.material}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-100/80 text-stone-700">
                <Ruler className="w-4 h-4 text-amber-800 shrink-0" />
                <div>
                  <span className="block text-[10px] text-stone-500">အရွယ်အစား (Size)</span>
                  <span className="font-semibold">{product.dimensions}</span>
                </div>
              </div>
            </div>

            {/* Color Selection */}
            <div className="mt-4">
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                အရောင်ရွေးချယ်ရန် (Color):{" "}
                <span className="text-amber-900 font-bold">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedColor(c.name)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                      selectedColor === c.name
                        ? "border-amber-800 bg-amber-50 text-stone-900 ring-2 ring-amber-800/20"
                        : "border-stone-200 bg-white text-stone-600 hover:border-stone-400"
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-stone-300"
                      style={{ backgroundColor: c.hex }}
                    />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity & Stock */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-stone-700">
                  အရေအတွက် (Qty):
                </span>
                <div className="flex items-center rounded-xl border border-stone-300 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-sm font-bold text-stone-700 hover:bg-stone-100"
                  >
                    -
                  </button>
                  <span className="px-3.5 py-1.5 text-sm font-semibold text-stone-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock || 10, q + 1))
                    }
                    className="px-3 py-1.5 text-sm font-bold text-stone-700 hover:bg-stone-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                In Stock ({product.stock} လုံးကျန်)
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-stone-200 space-y-3">
            <div className="flex gap-3">
              <button
                type="button"
                disabled={product.stock <= 0}
                onClick={() => {
                  onAddToCart(product, selectedColor, quantity);
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-stone-900 hover:bg-amber-900 disabled:bg-stone-300 text-white font-semibold text-sm transition shadow-lg"
              >
                <ShoppingBag className="w-4 h-4" />
                {product.stock > 0
                  ? "ဈေးခြင်းတောင်းထဲထည့်မည် (Add to Cart)"
                  : "ပစ္စည်းပြတ်နေပါသည် (Out of Stock)"}
              </button>
              <button
                type="button"
                onClick={() => onToggleWishlist(product.id)}
                className={`p-3.5 rounded-2xl border transition ${
                  isWishlisted
                    ? "bg-rose-50 border-rose-300 text-rose-600"
                    : "border-stone-300 text-stone-600 hover:bg-stone-100"
                }`}
                title="Wishlist"
              >
                <Heart
                  className={`w-5 h-5 ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" /> 100% Quality Guarantee
              </span>
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-amber-700" /> 100,000 MMK အထက် ပို့ခအခမဲ့
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
