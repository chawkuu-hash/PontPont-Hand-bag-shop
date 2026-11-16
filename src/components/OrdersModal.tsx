"use client";

import React, { useState } from "react";
import { X, Package, Search, Clock, CheckCircle2, Truck, XCircle } from "lucide-react";
import { Order, UserProfile } from "@/data/initialData";

interface OrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  user: UserProfile | null;
}

export default function OrdersModal({
  isOpen,
  onClose,
  orders,
  user,
}: OrdersModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) {
      if (user && user.role === "customer") {
        return (
          o.userEmail === user.email ||
          o.phone.includes(user.phone) ||
          true // Show sample + user orders for easy demo visibility
        );
      }
      return true;
    }
    const q = searchQuery.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.phone.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" /> စစ်ဆေးဆဲ (Pending)
          </span>
        );
      case "Confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> အတည်ပြုပြီး (Confirmed)
          </span>
        );
      case "Shipped":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
            <Truck className="w-3.5 h-3.5" /> ပို့ဆောင်နေပြီ (Shipped)
          </span>
        );
      case "Delivered":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> ပို့ဆောင်ပြီး (Delivered)
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <XCircle className="w-3.5 h-3.5" /> ပယ်ဖျက် (Cancelled)
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[86vh]">
        <div className="px-6 py-5 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-base">
                အော်ဒါစာရင်းနှင့် ပို့ဆောင်မှုအခြေအနေ (Order Tracking)
              </h3>
              <p className="text-xs text-stone-400">
                Order ID သို့မဟုတ် ဖုန်းနံပါတ်ဖြင့် ရှာဖွေကြည့်ရှုနိုင်ပါသည်
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 border-b border-stone-200 bg-stone-50">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Order ID (ဥပမာ PP-2026-8841) သို့မဟုတ် ဖုန်းနံပါတ် ရိုက်ထည့်ပါ..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-amber-800"
            />
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-stone-500 text-sm">
              ရှာဖွေထားသော အော်ဒါမတွေ့ရှိပါ။
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl border border-stone-200 bg-white shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div>
                    <span className="text-xs font-extrabold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      {order.id}
                    </span>
                    <span className="text-xs text-stone-500 ml-2">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.image}
                          alt={item.nameEn}
                          className="w-10 h-10 rounded-lg object-cover bg-stone-100"
                        />
                        <div>
                          <p className="font-bold text-stone-800">
                            {item.nameMm}{" "}
                            <span className="text-stone-500 font-normal">
                              ({item.selectedColor})
                            </span>
                          </p>
                          <p className="text-stone-500">
                            {item.price.toLocaleString()} MMK × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-stone-900">
                        {(item.price * item.quantity).toLocaleString()} MMK
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600">
                  <div>
                    <span className="font-semibold text-stone-800">
                      {order.customerName}
                    </span>{" "}
                    • {order.phone} • {order.city}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-semibold">
                      {order.paymentMethod}
                    </span>
                    <span className="text-sm font-extrabold text-amber-900">
                      {order.total.toLocaleString()} MMK
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
