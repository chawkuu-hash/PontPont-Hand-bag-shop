"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ShoppingBag,
  Trash2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  Smartphone,
  Banknote,
  Tag,
  Truck,
  QrCode,
} from "lucide-react";
import { CartItem, CITIES, Order, UserProfile } from "@/data/initialData";

interface CartCheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQty: (productId: string, color: string, delta: number) => void;
  onRemoveItem: (productId: string, color: string) => void;
  onClearCart: () => void;
  user: UserProfile | null;
  onOrderCreated: (order: Order) => Promise<void>;
  lang?: "mm" | "en";
}

export default function CartCheckoutDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  user,
  onOrderCreated,
  lang = "mm",
}: CartCheckoutDrawerProps) {
  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");
  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoMessage, setPromoMessage] = useState("");

  // Checkout fields
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState(CITIES[0].name);
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"KPay" | "WavePay" | "COD">("KPay");
  const [transactionRef, setTransactionRef] = useState("");
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user) {
      setCustomerName(user.name || "");
      setPhone(user.phone || "");
      setCity(user.city || CITIES[0].name);
      setAddress(user.address || "");
    }
  }, [user]);

  if (!isOpen) return null;

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const selectedCityObj = CITIES.find((c) => c.name === city) || CITIES[0];
  const deliveryFee =
    subtotal === 0 ? 0 : subtotal - discount >= 100000 ? 0 : selectedCityObj.fee;
  const total = subtotal - discount + deliveryFee;

  const handleApplyPromo = () => {
    if (promoInput.trim().toUpperCase() === "PONTPONT10") {
      setPromoApplied(true);
      setPromoMessage("10% Discount ကူပွန် အသုံးပြုပြီးပါပြီ!");
    } else {
      setPromoApplied(false);
      setPromoMessage("ကူပွန်ကုဒ် မှားယွင်းနေပါသည် (Try: PONTPONT10)");
    }
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText("09963000502");
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      setFormError(
        "ကျေးဇူးပြု၍ အမည်၊ ဖုန်းနံပါတ် နှင့် ပို့ဆောင်ရမည့်လိပ်စာ အပြည့်အစုံ ဖြည့်စွက်ပေးပါ။"
      );
      return;
    }

    if (
      (paymentMethod === "KPay" || paymentMethod === "WavePay") &&
      transactionRef.trim().length < 4
    ) {
      setFormError(
        `${paymentMethod} ဖြင့် ငွေလွှဲထားသော ပြေစာနံပါတ် နောက်ဆုံး (၆) လုံး ထည့်သွင်းပေးပါ။`
      );
      return;
    }

    setSubmitting(true);
    const newOrder: Order = {
      id: `PP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: customerName.trim(),
      phone: phone.trim(),
      city,
      address: address.trim(),
      note: note.trim() || undefined,
      paymentMethod,
      transactionRef:
        paymentMethod === "COD" ? undefined : transactionRef.trim(),
      items: cart.map((item) => ({
        productId: item.product.id,
        nameEn: item.product.nameEn,
        nameMm: item.product.nameMm,
        price: item.product.price,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        image: item.product.image,
      })),
      subtotal,
      discount,
      deliveryFee,
      total,
      status: "Pending",
      createdAt: new Date().toISOString(),
      userEmail: user?.email,
    };

    await onOrderCreated(newOrder);
    setCompletedOrder(newOrder);
    onClearCart();
    setSubmitting(false);
    setStep("success");
  };

  const resetAndClose = () => {
    setStep("cart");
    setCompletedOrder(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Top Bar */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-base">
                {step === "cart" &&
                  (lang === "en"
                    ? "Shopping Bag"
                    : "ဈေးခြင်းတောင်း (Shopping Bag)")}
                {step === "checkout" &&
                  (lang === "en"
                    ? "Checkout & Payment"
                    : "အော်ဒါမှာယူရန် & ငွေပေးချေမှု (Checkout)")}
                {step === "success" &&
                  (lang === "en"
                    ? "Order Confirmed"
                    : "အော်ဒါအောင်မြင်ပါသည် (Order Confirmed)")}
              </h3>
              <p className="text-xs text-stone-400">
                {lang === "en"
                  ? "Pont Pont Bag Shop (Mandalay Retail & Wholesale)"
                  : "ပုံ့ပုံ့ အိတ်အမျိုးမျိုး လက်လီ/လက်ကား ရောင်းဝယ်ရေး (မန္တလေး)"}
              </p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {step === "cart" && (
            <>
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center text-amber-800 mb-4">
                    <ShoppingBag className="w-10 h-10" />
                  </div>
                  <h4 className="text-lg font-bold text-stone-800">
                    ဈေးခြင်းတောင်းထဲတွင် ပစ္စည်းမရှိသေးပါ
                  </h4>
                  <p className="text-sm text-stone-500 mt-1 max-w-xs">
                    PontPont ၏ လှပသေသပ်သော လက်ကိုင်အိတ်ဒီဇိုင်းများကို စိတ်ကြိုက်ရွေးချယ်ထည့်သွင်းနိုင်ပါသည်။
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-6 px-6 py-2.5 rounded-full bg-stone-900 text-white text-sm font-semibold hover:bg-amber-900 transition"
                  >
                    အိတ်များကြည့်ရှုရန် (Browse Handbags)
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Free shipping banner */}
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center gap-3 text-xs text-amber-950">
                    <Truck className="w-5 h-5 text-amber-700 shrink-0" />
                    {subtotal - discount >= 100000 ? (
                      <span className="font-semibold text-emerald-800">
                        ဂုဏ်ယူပါတယ်! ၁ သိန်းကျပ်ပြည့်သဖြင့် အိမ်အရောက် ပို့ဆောင်ခ အခမဲ့ (Free Delivery) ရရှိပါပြီ။
                      </span>
                    ) : (
                      <span>
                        နောက်ထပ်{" "}
                        <strong>
                          {(100000 - (subtotal - discount)).toLocaleString()} MMK
                        </strong>{" "}
                        ဖိုး ဝယ်ယူပါက ပို့ဆောင်ခ အခမဲ့ ရရှိပါမည်။
                      </span>
                    )}
                  </div>

                  {/* Cart Items */}
                  <div className="space-y-3.5">
                    {cart.map((item) => (
                      <div
                        key={`${item.product.id}-${item.selectedColor}`}
                        className="flex gap-3.5 p-3.5 rounded-2xl border border-stone-200 bg-stone-50/60"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.nameEn}
                          className="w-20 h-24 rounded-xl object-cover bg-stone-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-sm font-bold text-stone-900 truncate">
                                {item.product.nameEn}
                              </h4>
                              <p className="text-[11px] text-amber-800 font-semibold uppercase">
                                {item.product.category}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                onRemoveItem(item.product.id, item.selectedColor)
                              }
                              className="text-stone-400 hover:text-rose-600 p-1"
                              title="Remove"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <p className="text-xs text-stone-500 mt-1">
                            အရောင် (Color):{" "}
                            <span className="font-semibold text-stone-700">
                              {item.selectedColor}
                            </span>
                          </p>

                          <div className="mt-2.5 flex items-center justify-between">
                            <div className="flex items-center rounded-lg border border-stone-300 bg-white">
                              <button
                                onClick={() =>
                                  onUpdateQty(
                                    item.product.id,
                                    item.selectedColor,
                                    -1
                                  )
                                }
                                className="px-2.5 py-1 text-xs font-bold text-stone-700 hover:bg-stone-100"
                              >
                                -
                              </button>
                              <span className="px-2.5 py-1 text-xs font-bold text-stone-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  onUpdateQty(
                                    item.product.id,
                                    item.selectedColor,
                                    1
                                  )
                                }
                                className="px-2.5 py-1 text-xs font-bold text-stone-700 hover:bg-stone-100"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-sm font-extrabold text-stone-900">
                              {(
                                item.product.price * item.quantity
                              ).toLocaleString()}{" "}
                              MMK
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Promo Code */}
                  <div className="p-4 rounded-2xl bg-stone-100/80 border border-stone-200/80">
                    <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5 mb-2">
                      <Tag className="w-3.5 h-3.5 text-amber-800" />
                      လျှော့ဈေးကူပွန် (Promo Code: <code className="text-amber-900 font-bold">PONTPONT10</code>)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="PONTPONT10"
                        className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-amber-800 uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-amber-900 transition"
                      >
                        Apply
                      </button>
                    </div>
                    {promoMessage && (
                      <p
                        className={`text-xs mt-1.5 font-medium ${
                          promoApplied ? "text-emerald-700" : "text-rose-600"
                        }`}
                      >
                        {promoMessage}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {step === "checkout" && (
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-5">
              <button
                type="button"
                onClick={() => setStep("cart")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> ဈေးခြင်းတောင်းသို့ ပြန်သွားရန်
              </button>

              {formError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {formError}
                </div>
              )}

              {/* Shipping Info */}
              <div className="space-y-3.5">
                <h4 className="text-sm font-bold text-stone-900 border-b border-stone-200 pb-2">
                  ၁။ ပို့ဆောင်ရမည့် လိပ်စာအချက်အလက် (Delivery Details)
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    ဝယ်ယူသူအမည် (Customer Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="ဥပမာ - မသီရိဆွေ"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 text-stone-900 focus:border-amber-800 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      ဖုန်းနံပါတ် (Phone Number) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="09xxxxxxxxx"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 text-stone-900 focus:border-amber-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      မြို့နယ် (City / Region) *
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 text-stone-900 bg-white focus:border-amber-800 focus:outline-none"
                    >
                      {CITIES.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name} (+{c.fee.toLocaleString()} MMK)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    အိမ်အမှတ်၊ လမ်း၊ ရပ်ကွက်၊ မြို့နယ် အပြည့်အစုံ (Full Address) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="အိမ်အမှတ်၊ လမ်းအမည်၊ မြို့နယ် အပြည့်အစုံ ရေးပေးပါ..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 text-stone-900 focus:border-amber-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    မှတ်ချက် (Order Note - Optional)
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="ဥပမာ - မွေးနေ့လက်ဆောင်ကတ် ထည့်ပေးပါ / ဖုန်းကြိုဆက်ပေးပါ"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 text-stone-900 focus:border-amber-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3.5 pt-2">
                <h4 className="text-sm font-bold text-stone-900 border-b border-stone-200 pb-2">
                  ၂။ ငွေပေးချေမှုပုံစံ ရွေးချယ်ရန် (Payment Method)
                </h4>

                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("KPay")}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                      paymentMethod === "KPay"
                        ? "border-blue-600 bg-blue-50/70 text-blue-950 ring-2 ring-blue-600/20"
                        : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-bold">KBZPay</span>
                    <span className="text-[10px] text-stone-500">KPay ငွေလွှဲ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("WavePay")}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                      paymentMethod === "WavePay"
                        ? "border-amber-500 bg-amber-50/80 text-amber-950 ring-2 ring-amber-500/20"
                        : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-amber-600" />
                    <span className="text-xs font-bold">WavePay</span>
                    <span className="text-[10px] text-stone-500">Wave ငွေလွှဲ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("COD")}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                      paymentMethod === "COD"
                        ? "border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-600/20"
                        : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-bold">Cash (COD)</span>
                    <span className="text-[10px] text-stone-500">အိမ်အရောက်ငွေချေ</span>
                  </button>
                </div>

                {/* KPay / WavePay Account Details Box */}
                {(paymentMethod === "KPay" || paymentMethod === "WavePay") && (
                  <div
                    className={`p-4 rounded-2xl border space-y-3 ${
                      paymentMethod === "KPay"
                        ? "bg-blue-50/50 border-blue-200"
                        : "bg-amber-50/50 border-amber-200"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[11px] uppercase font-bold tracking-wider text-stone-500">
                          {paymentMethod} Account (ပုံ့ပုံ့ အိတ်ဆိုင် အကောင့်)
                        </span>
                        <p className="text-sm sm:text-base font-extrabold text-stone-900 mt-0.5">
                          09-963000502 / 09-750072752
                        </p>
                        <p className="text-xs text-stone-600 font-medium">
                          Account Name: Ma Pont Pont (ပုံ့ပုံ့ အိတ်ဆိုင် - မန္တလေး)
                        </p>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1.5">
                        <button
                          type="button"
                          onClick={handleCopyNumber}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs font-semibold text-stone-800 hover:bg-stone-100 shadow-xs"
                        >
                          {copiedAccount ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy Number
                            </>
                          )}
                        </button>
                        <span className="inline-flex items-center gap-1 text-[11px] text-stone-500">
                          <QrCode className="w-3.5 h-3.5" /> Scan or Transfer
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-800 mb-1">
                        {paymentMethod} ပြေစာနံပါတ် နောက်ဆုံး (၆) လုံး (Last 6 Digits of Transaction ID) *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={12}
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        placeholder="ဥပမာ - 893412"
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 bg-white text-stone-900 focus:border-stone-800 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === "COD" && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950">
                    ပစ္စည်းလက်ခံရရှိသည့်အချိန်မှသာ ပို့ဆောင်သူထံ ငွေသားဖြင့် တိုက်ရိုက်ပေးချေနိုင်ပါသည် (Cash on Delivery)။
                  </div>
                )}
              </div>
            </form>
          )}

          {step === "success" && completedOrder && (
            <div className="py-6 space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                  Order ID: {completedOrder.id}
                </span>
                <h4 className="text-xl font-extrabold text-stone-900 mt-3">
                  ဝယ်ယူအားပေးမှုအတွက် ကျေးဇူးအထူးတင်ရှိပါသည်!
                </h4>
                <p className="text-xs text-stone-500 mt-1">
                  PontPont Hand-bag Shop မှ လူကြီးမင်း၏ အော်ဒါကို လက်ခံရရှိပါပြီ။ မကြာမီ ဖုန်းဆက်အတည်ပြုပေးပါမည်။
                </p>
              </div>

              <div className="text-left bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2 text-xs text-stone-700">
                <div className="flex justify-between py-1 border-b border-stone-200">
                  <span className="text-stone-500">ဝယ်ယူသူ (Customer):</span>
                  <span className="font-bold text-stone-900">
                    {completedOrder.customerName} ({completedOrder.phone})
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-200">
                  <span className="text-stone-500">ပို့ဆောင်မည့်မြို့ (City):</span>
                  <span className="font-semibold">{completedOrder.city}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-200">
                  <span className="text-stone-500">ငွေပေးချေမှု (Payment):</span>
                  <span className="font-bold text-amber-900">
                    {completedOrder.paymentMethod}
                    {completedOrder.transactionRef
                      ? ` (#${completedOrder.transactionRef})`
                      : ""}
                  </span>
                </div>
                <div className="flex justify-between py-1 text-sm">
                  <span className="font-bold text-stone-800">စုစုပေါင်းကျသင့်ငွေ:</span>
                  <span className="font-extrabold text-stone-900">
                    {completedOrder.total.toLocaleString()} MMK
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={resetAndClose}
                className="w-full py-3.5 rounded-2xl bg-stone-900 hover:bg-amber-900 text-white font-semibold text-sm transition"
              >
                ဆိုင်သို့ပြန်သွားမည် (Continue Shopping)
              </button>
            </div>
          )}
        </div>

        {/* Footer Totals & Action */}
        {cart.length > 0 && step !== "success" && (
          <div className="p-4 sm:p-6 bg-stone-50 border-t border-stone-200 space-y-3">
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>ပစ္စည်းတန်ဖိုး (Subtotal):</span>
                <span className="font-semibold text-stone-900">
                  {subtotal.toLocaleString()} MMK
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>လျှော့ဈေး (Promo 10%):</span>
                  <span>-{discount.toLocaleString()} MMK</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>ပို့ဆောင်ခ (Delivery - {city.split(" ")[0]}):</span>
                <span className="font-semibold text-stone-900">
                  {deliveryFee === 0
                    ? "FREE (အခမဲ့)"
                    : `${deliveryFee.toLocaleString()} MMK`}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-stone-900 pt-2 border-t border-stone-200">
                <span>စုစုပေါင်း (Total):</span>
                <span className="text-amber-900">
                  {total.toLocaleString()} MMK
                </span>
              </div>
            </div>

            {step === "cart" ? (
              <button
                type="button"
                onClick={() => setStep("checkout")}
                className="w-full py-3.5 px-5 rounded-2xl bg-stone-900 hover:bg-amber-900 text-white font-semibold text-sm flex items-center justify-center gap-2 transition shadow-lg"
              >
                {lang === "en"
                  ? "Proceed to Checkout"
                  : "အော်ဒါမှာယူရန် ဆက်သွားမည် (Proceed to Checkout)"}
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                form="checkout-form"
                disabled={submitting}
                className="w-full py-3.5 px-5 rounded-2xl bg-amber-800 hover:bg-amber-900 disabled:bg-stone-400 text-white font-semibold text-sm flex items-center justify-center gap-2 transition shadow-lg"
              >
                {submitting
                  ? lang === "en"
                    ? "Placing Order..."
                    : "အော်ဒါတင်နေပါသည်..."
                  : lang === "en"
                  ? `Confirm Order (${total.toLocaleString()} MMK)`
                  : `အော်ဒါအတည်ပြုမည် (${total.toLocaleString()} MMK)`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
