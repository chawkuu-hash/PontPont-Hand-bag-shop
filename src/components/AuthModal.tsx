"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { UserProfile, CITIES } from "@/data/initialData";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  usersCount: number;
  onAuthSuccess: (user: UserProfile, updatedUsers: UserProfile[]) => void;
  lang?: "mm" | "en";
}

export default function AuthModal({
  isOpen,
  onClose,
  usersCount,
  onAuthSuccess,
  lang = "mm",
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState(CITIES[0].name);
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && usersCount === 0) {
      setMode("register");
    }
  }, [isOpen, usersCount]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        if (!email.trim() || !password) {
          setError("အီးမေးလ်နှင့် စကားဝှက် ထည့်သွင်းပေးပါ။");
          setLoading(false);
          return;
        }
        const res = await fetch("/api/shop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "LOGIN",
            email: email.trim(),
            password,
          }),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          setError(
            data.error || "အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်။"
          );
          setLoading(false);
          return;
        }
        onAuthSuccess(data.user, data.db?.users || []);
        onClose();
      } else {
        if (!name.trim() || !email.trim() || !phone.trim() || !password) {
          setError("လိုအပ်သော အချက်အလက်များ အားလုံးဖြည့်စွက်ပေးပါ။");
          setLoading(false);
          return;
        }
        const res = await fetch("/api/shop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "REGISTER",
            name: name.trim(),
            email: email.trim(),
            password,
            phone: phone.trim(),
            city,
            address: address.trim() || city,
          }),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          setError(data.error || "အကောင့်ဖွင့်ရာတွင် အမှားအယွင်းရှိနေပါသည်။");
          setLoading(false);
          return;
        }
        onAuthSuccess(data.user, data.db?.users || []);
        onClose();
      }
    } catch {
      setError("ဆာဗာနှင့် ချိတ်ဆက်ရာတွင် အမှားအယွင်းရှိနေပါသည်။");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 px-6 py-5 text-white flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest text-amber-300 font-semibold flex items-center gap-1">
              {lang === "en" ? "Pont Pont Bag Shop" : "ပုံ့ပုံ့ (Pont Pont) အိတ်ဆိုင်"}
            </span>
            <h3 className="text-lg font-bold mt-0.5">
              {mode === "login"
                ? lang === "en"
                  ? "Sign In"
                  : "အကောင့်ဝင်ရန် (Sign In)"
                : lang === "en"
                ? "Create Account (Sign Up)"
                : "အကောင့်သစ်ဖွင့်ရန် (Sign Up)"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-stone-300 hover:bg-white/10 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[82vh] overflow-y-auto">
          {/* First Sign-up Admin Notice */}
          {usersCount === 0 && (
            <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  {lang === "en"
                    ? "First Sign Up = Admin (Shop Owner)"
                    : "ပထမဆုံး အကောင့်သစ်ဖွင့်သူ = Admin (ဆိုင်ရှင်)"}
                </p>
                <p className="text-stone-600 mt-0.5">
                  {lang === "en"
                    ? "No accounts exist yet. The first user to Sign Up will automatically receive Admin privileges."
                    : "လက်ရှိတွင် အကောင့်ဖွင့်ထားသူ မရှိသေးပါသဖြင့် ပထမဆုံး Sign Up ပြုလုပ်သူသည် Admin အခွင့်အရေး အလိုအလျောက် ရရှိပါမည်။"}
                </p>
              </div>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100 rounded-xl mb-4">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition ${
                mode === "login"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              {lang === "en" ? "Sign In (Login)" : "အကောင့်ဝင်ရန် (Login)"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition ${
                mode === "register"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              {lang === "en" ? "Sign Up (Register)" : "အကောင့်သစ်ဖွင့်ရန် (Sign Up)"}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {lang === "en" ? "Full Name *" : "အမည် (Full Name) *"}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={
                      lang === "en" ? "e.g. Ma Thiri Swe" : "ဥပမာ - မပုံ့ / မသီရိဆွေ"
                    }
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:border-amber-700 focus:outline-none text-stone-900"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {lang === "en" ? "Email Address *" : "အီးမေးလ် (Email Address) *"}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:border-amber-700 focus:outline-none text-stone-900"
                />
              </div>
            </div>

            {mode === "register" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {lang === "en" ? "Phone Number *" : "ဖုန်းနံပါတ် (Phone Number) *"}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="09xxxxxxxxx"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:border-amber-700 focus:outline-none text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {lang === "en" ? "City / Region" : "မြို့နယ် (City)"}
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:border-amber-700 focus:outline-none text-stone-900 bg-white"
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
                    {lang === "en" ? "Delivery Address" : "နေရပ်လိပ်စာ (Delivery Address)"}
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={
                        lang === "en"
                          ? "House No, Street, Township"
                          : "အိမ်အမှတ်၊ လမ်း၊ မြို့နယ်"
                      }
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:border-amber-700 focus:outline-none text-stone-900"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {lang === "en" ? "Password *" : "စကားဝှက် (Password) *"}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:border-amber-700 focus:outline-none text-stone-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-stone-900 hover:bg-amber-900 disabled:bg-stone-400 text-white font-semibold text-sm transition shadow-md mt-2"
            >
              {loading
                ? lang === "en"
                  ? "Please wait..."
                  : "ခေတ္တစောင့်ပေးပါ..."
                : mode === "login"
                ? lang === "en"
                  ? "Sign In"
                  : "အကောင့်ဝင်မည် (Sign In)"
                : usersCount === 0
                ? lang === "en"
                  ? "Sign Up as First Admin"
                  : "ပထမဆုံး Admin အကောင့်အဖြစ် ဖွင့်မည် (Sign Up as Admin)"
                : lang === "en"
                ? "Create Account"
                : "အကောင့်သစ်ဖွင့်မည် (Create Account)"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
