"use client";

import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  ShieldCheck,
  Package,
  Heart,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  ShoppingBag,
} from "lucide-react";
import { CITIES, Order, Product, UserProfile } from "@/data/initialData";

interface UserProfilePageProps {
  user: UserProfile;
  orders: Order[];
  wishlistProducts: Product[];
  onUpdateUser: (
    updatedUser: UserProfile,
    allUsers: UserProfile[]
  ) => void;
  onLogout: () => void;
  onBackToShop: () => void;
  onOpenAdmin?: () => void;
  onAddToCart: (product: Product) => void;
}

export default function UserProfilePage({
  user,
  orders,
  wishlistProducts,
  onUpdateUser,
  onLogout,
  onBackToShop,
  onOpenAdmin,
  onAddToCart,
}: UserProfilePageProps) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [city, setCity] = useState(user.city || CITIES[0].name);
  const [address, setAddress] = useState(user.address);
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const myOrders = orders.filter(
    (o) =>
      (o.userEmail && o.userEmail.toLowerCase() === user.email.toLowerCase()) ||
      o.phone.trim() === user.phone.trim()
  );

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_PROFILE",
          userId: user.id,
          name,
          phone,
          city,
          address,
          newPassword: newPassword.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        onUpdateUser(data.user, data.db?.users || []);
        setNewPassword("");
        setMessage("ကိုယ်ရေးအချက်အလက်များကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ!");
        setTimeout(() => setMessage(""), 3500);
      }
    } finally {
      setSaving(false);
    }
  };

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-extrabold text-2xl shadow-md shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold">{user.name}</h1>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                  user.role === "admin"
                    ? "bg-amber-400 text-stone-950"
                    : "bg-white/15 text-amber-200"
                }`}
              >
                {user.role === "admin"
                  ? "Admin (ဆိုင်ရှင် / စီမံခန့်ခွဲသူ)"
                  : "Member (ဝယ်ယူသူအကောင့်)"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-300 mt-1">
              {user.email} • {user.phone}
            </p>
            {user.createdAt && (
              <p className="text-[11px] text-stone-400 mt-0.5">
                အကောင့်စတင်ဖွင့်သည့်ရက်:{" "}
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onBackToShop}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            အရောင်းဆိုင်သို့ ပြန်သွားရန်
          </button>

          {user.role === "admin" && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-extrabold transition shadow"
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Dashboard သို့ဝင်ရန်
            </button>
          )}

          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow"
          >
            <LogOut className="w-4 h-4" />
            အကောင့်မှထွက်ရန် (Logout)
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-900 text-white text-sm font-semibold flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Edit Profile Form */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleSaveProfile}
            className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4"
          >
            <h2 className="text-base font-extrabold text-stone-900 border-b border-stone-200 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-800" />
              ကိုယ်ရေးအချက်အလက် ပြင်ဆင်ရန် (Edit Profile)
            </h2>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                အမည် (Full Name) *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-stone-300 text-stone-900 focus:border-amber-800 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                အီးမေးလ် (Email - ပြောင်းလဲ၍မရပါ)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-stone-200 bg-stone-100 text-stone-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                ဖုန်းနံပါတ် (Phone Number) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-stone-300 text-stone-900 focus:border-amber-800 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                မြို့နယ် (City)
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 text-stone-900 bg-white focus:border-amber-800 focus:outline-none"
              >
                {CITIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                ပို့ဆောင်ရမည့် နေရပ်လိပ်စာ (Default Delivery Address)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-stone-300 text-stone-900 focus:border-amber-800 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                စကားဝှက်အသစ် ပြောင်းရန် (New Password - Optional)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="မပြောင်းလိုပါက အလွတ်ထားပါ"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-stone-300 text-stone-900 focus:border-amber-800 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-2xl bg-stone-900 hover:bg-amber-900 disabled:bg-stone-400 text-white font-bold text-sm transition shadow"
            >
              {saving
                ? "သိမ်းဆည်းနေပါသည်..."
                : "ပြင်ဆင်မှုများ သိမ်းဆည်းမည် (Save Changes)"}
            </button>
          </form>
        </div>

        {/* Right Column: User Orders & Wishlist */}
        <div className="lg:col-span-7 space-y-6">
          {/* My Orders */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-stone-900 border-b border-stone-200 pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-800" />
                ကျွန်ုပ်၏ အော်ဒါမှတ်တမ်းများ (My Orders)
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-bold">
                {myOrders.length} ခု
              </span>
            </h2>

            {myOrders.length === 0 ? (
              <div className="text-center py-8 text-xs text-stone-500">
                သင်မှာယူထားသော အော်ဒါမှတ်တမ်း မရှိသေးပါ။
              </div>
            ) : (
              <div className="space-y-3">
                {myOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/70 pb-2">
                      <div>
                        <span className="text-xs font-extrabold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-lg">
                          {order.id}
                        </span>
                        <span className="text-xs text-stone-500 ml-2">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-stone-700 font-medium">
                            • {item.nameEn} ({item.selectedColor}) ×{" "}
                            {item.quantity}
                          </span>
                          <span className="font-bold text-stone-900">
                            {(item.price * item.quantity).toLocaleString()} MMK
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-stone-200/70 flex justify-between items-center text-xs">
                      <span className="text-stone-500">
                        ငွေပေးချေမှု: <strong>{order.paymentMethod}</strong>
                      </span>
                      <span className="text-sm font-extrabold text-amber-900">
                        စုစုပေါင်း: {order.total.toLocaleString()} MMK
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Wishlist */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-stone-900 border-b border-stone-200 pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                သိမ်းဆည်းထားသော အိတ်များ (My Wishlist)
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold">
                {wishlistProducts.length} မျိုး
              </span>
            </h2>

            {wishlistProducts.length === 0 ? (
              <div className="text-center py-6 text-xs text-stone-500">
                သိမ်းဆည်းထားသော အိတ် မရှိသေးပါ။
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {wishlistProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-2xl border border-stone-200 flex items-center gap-3"
                  >
                    <img
                      src={p.image}
                      alt={p.nameEn}
                      className="w-14 h-16 rounded-xl object-cover bg-stone-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-stone-900 truncate">
                        {p.nameEn}
                      </p>
                      <p className="text-[10px] font-semibold text-amber-800 uppercase">
                        {p.category}
                      </p>
                      <p className="text-xs font-extrabold text-stone-900 mt-0.5">
                        {p.price.toLocaleString()} MMK
                      </p>
                      <button
                        onClick={() => onAddToCart(p)}
                        className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-stone-900 hover:text-amber-800"
                      >
                        <ShoppingBag className="w-3 h-3" /> ခြင်းတောင်းထဲထည့်ရန်
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
