"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Package,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Smartphone,
  MapPin,
  Phone,
  Users,
  ShieldCheck,
  Mail,
  Megaphone,
  Upload,
  Tag,
} from "lucide-react";
import {
  Announcement,
  CategoryItem,
  Order,
  Product,
  UserProfile,
} from "@/data/initialData";

interface AdminDashboardProps {
  currentUser: UserProfile;
  users: UserProfile[];
  products: Product[];
  orders: Order[];
  announcements: Announcement[];
  categories: CategoryItem[];
  onAddProduct: (product: Product) => Promise<void>;
  onUpdateProduct: (product: Product) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
  onUpdateOrderStatus: (
    orderId: string,
    status: Order["status"]
  ) => Promise<void>;
  onUpdateUserRole: (
    userId: string,
    role: "admin" | "customer"
  ) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onAddAnnouncement: (announcement: Announcement) => Promise<void>;
  onDeleteAnnouncement: (announcementId: string) => Promise<void>;
  onAddCategory: (category: CategoryItem) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  onBackToShop: () => void;
}

const PRESET_BAG_IMAGES = [
  {
    label: "Luxury Tan Leather Tote",
    url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: "Quilted Designer Crossbody",
    url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: "Minimalist Crescent Shoulder Bag",
    url: "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: "Evening Pearl Clutch",
    url: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=900&q=80",
  },
];

const CATEGORY_MAP: Record<Product["category"], string> = {
  Tote: "လက်ဆွဲအိတ် / တုတ်အိတ်",
  Crossbody: "ဘေးလွယ်အိတ်",
  Shoulder: "ပုခုံးလွယ်အိတ်",
  Clutch: "ပိုက်ဆံအိတ် / ပွဲတက်အိတ်",
  Backpack: "ကျောပိုးအိတ်",
};

export default function AdminDashboard({
  currentUser,
  users,
  products,
  orders,
  announcements,
  categories,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onUpdateUserRole,
  onDeleteUser,
  onAddAnnouncement,
  onDeleteAnnouncement,
  onAddCategory,
  onDeleteCategory,
  onBackToShop,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "orders" | "products" | "categories" | "users" | "announcements" | "add"
  >("orders");

  // New Category Form State
  const [newCatId, setNewCatId] = useState("");
  const [newCatLabel, setNewCatLabel] = useState("");

  // New Announcement Form State
  const [annTitle, setAnnTitle] = useState("");
  const [annTag, setAnnTag] = useState<Announcement["tag"]>("Promotion");
  const [annContent, setAnnContent] = useState("");
  const [annImage, setAnnImage] = useState(PRESET_BAG_IMAGES[1].url);

  // New Product Form State
  const [nameEn, setNameEn] = useState("");
  const [category, setCategory] = useState<Product["category"]>("Crossbody");
  const [price, setPrice] = useState("29500");
  const [originalPrice, setOriginalPrice] = useState("36000");
  const [wholesalePrice, setWholesalePrice] = useState("24000");
  const [stock, setStock] = useState("30");
  const [badge, setBadge] = useState<string>("New Arrival");
  const [image, setImage] = useState(PRESET_BAG_IMAGES[0].url);
  const [material, setMaterial] = useState("High-Grade PU Leather");
  const [dimensions, setDimensions] = useState("25cm x 18cm x 9cm");
  const [descriptionMm, setDescriptionMm] = useState(
    "ပုံ့ပုံ့ အိတ်ဆိုင် (မန္တလေး) ၏ ဒီဇိုင်းဆန်းသစ်ပြီး အရည်အသွေးမြင့်မားသော လက်လီ/လက်ကား လက်ကိုင်အိတ်သစ်။"
  );
  const [descriptionEn, setDescriptionEn] = useState(
    "Quality handbag from Pont Pont Bag Shop Mandalay, available for retail and wholesale."
  );
  const [toast, setToast] = useState("");

  const totalRevenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + o.total, 0);
  const pendingOrdersCount = orders.filter(
    (o) => o.status === "Pending"
  ).length;

  const showNotice = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() || !price) return;

    const newProd: Product = {
      id: `pp-bag-${Date.now()}`,
      nameEn: nameEn.trim(),
      nameMm: nameEn.trim(),
      category,
      categoryMm: category,
      price: Number(price) || 29500,
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      wholesalePrice: wholesalePrice ? Number(wholesalePrice) : undefined,
      image: image.trim() || PRESET_BAG_IMAGES[0].url,
      colors: [
        { name: "Classic Black", hex: "#1C1917" },
        { name: "Caramel Tan", hex: "#9C5B34" },
        { name: "Cream Ivory", hex: "#F5EFE6" },
      ],
      badge: badge ? (badge as Product["badge"]) : undefined,
      rating: 5.0,
      reviewsCount: 1,
      stock: Number(stock) || 20,
      material,
      dimensions,
      descriptionEn,
      descriptionMm,
    };

    await onAddProduct(newProd);
    setNameEn("");
    showNotice("အိတ်အသစ် အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ! (New Handbag Added)");
    setActiveTab("products");
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title: annTitle.trim(),
      content: annContent.trim(),
      tag: annTag,
      image: annImage.trim() || undefined,
      createdAt: new Date().toISOString(),
      authorName: currentUser.name,
    };

    await onAddAnnouncement(newAnn);
    setAnnTitle("");
    setAnnContent("");
    showNotice(
      "ကြေညာချက်ပိုစ့်အသစ် အောင်မြင်စွာ တင်ပြီးပါပြီ! (Announcement Published)"
    );
  };

  const handleAnnImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAnnImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const label = newCatLabel.trim();
    const id = (newCatId.trim() || label).replace(/\s+/g, "-");
    if (!label) return;
    await onAddCategory({ id, labelEn: label });
    setNewCatId("");
    setNewCatLabel("");
    showNotice(`Category "${label}" အသစ် ထည့်သွင်းပြီးပါပြီ!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-amber-300 font-bold">
            ပုံ့ပုံ့ (Pont Pont) အိတ်ဆိုင် စီမံခန့်ခွဲမှုစနစ်
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Admin Dashboard ({currentUser.name})
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 mt-1">
            အော်ဒါများ စစ်ဆေးခြင်း၊ အိတ်အသစ်ထည့်သွင်းခြင်း နှင့် အသုံးပြုသူအကောင့်များ (Users) စီမံခန့်ခွဲခြင်း
          </p>
        </div>
        <button
          onClick={onBackToShop}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-stone-900 text-xs sm:text-sm font-bold hover:bg-amber-100 transition shadow"
        >
          <ArrowLeft className="w-4 h-4" />
          အရောင်းဆိုင်သို့ ပြန်သွားရန် (Storefront)
        </button>
      </div>

      {toast && (
        <div className="p-4 rounded-2xl bg-emerald-900 text-white text-sm font-semibold flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          {toast}
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500">
              စုစုပေါင်း ရောင်းရငွေ (Revenue)
            </p>
            <p className="text-2xl font-extrabold text-stone-900 mt-1">
              {totalRevenue.toLocaleString()}{" "}
              <span className="text-sm font-bold text-amber-900">MMK</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500">
              အော်ဒါစုစုပေါင်း (Total Orders)
            </p>
            <p className="text-2xl font-extrabold text-stone-900 mt-1">
              {orders.length}{" "}
              <span className="text-sm font-normal text-stone-500">
                ခု (Pending: {pendingOrdersCount})
              </span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500">
              အသုံးပြုသူအကောင့်များ (Users)
            </p>
            <p className="text-2xl font-extrabold text-stone-900 mt-1">
              {users.length}{" "}
              <span className="text-sm font-normal text-stone-500">ဦး</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500">
              အိတ်အမျိုးအစားပေါင်း (Products)
            </p>
            <p className="text-2xl font-extrabold text-stone-900 mt-1">
              {products.length}{" "}
              <span className="text-sm font-normal text-stone-500">မျိုး</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-800 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3">
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === "orders"
              ? "bg-stone-900 text-white shadow"
              : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-100"
          }`}
        >
          အော်ဒါများ စီမံရန် (Orders - {orders.length})
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === "products"
              ? "bg-stone-900 text-white shadow"
              : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-100"
          }`}
        >
          အိတ်စာရင်းနှင့် လက်ကျန် (Inventory - {products.length})
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition ${
            activeTab === "categories"
              ? "bg-stone-900 text-white shadow"
              : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-100"
          }`}
        >
          <Tag className="w-4 h-4 text-amber-700" />
          Categories ({categories.filter((c) => c.id !== "All").length})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition ${
            activeTab === "users"
              ? "bg-stone-900 text-white shadow"
              : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-100"
          }`}
        >
          <Users className="w-4 h-4" />
          အသုံးပြုသူများ စီမံရန် (Users - {users.length})
        </button>
        <button
          onClick={() => setActiveTab("announcements")}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition ${
            activeTab === "announcements"
              ? "bg-stone-900 text-white shadow"
              : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-100"
          }`}
        >
          <Megaphone className="w-4 h-4 text-amber-700" />
          ကြေညာချက်တင်ရန် (Announcements - {announcements.length})
        </button>
        <button
          onClick={() => setActiveTab("add")}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition ${
            activeTab === "add"
              ? "bg-amber-800 text-white shadow"
              : "bg-amber-50 text-amber-950 border border-amber-200 hover:bg-amber-100"
          }`}
        >
          <Plus className="w-4 h-4" />
          အိတ်အသစ်ထည့်ရန် (Add New Handbag)
        </button>
      </div>

      {/* Tab 1: Manage Orders */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-xl bg-stone-900 text-white text-xs font-extrabold">
                    {order.id}
                  </span>
                  <span className="text-xs text-stone-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-stone-600">
                    Status ပြောင်းရန်:
                  </label>
                  <select
                    value={order.status}
                    onChange={(e) => {
                      onUpdateOrderStatus(
                        order.id,
                        e.target.value as Order["status"]
                      );
                      showNotice(
                        `Order ${order.id} အခြေအနေကို ${e.target.value} သို့ ပြောင်းလဲပြီးပါပြီ။`
                      );
                    }}
                    className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 bg-stone-50 focus:outline-none focus:border-amber-800"
                  >
                    <option value="Pending">Pending (စစ်ဆေးဆဲ)</option>
                    <option value="Confirmed">Confirmed (အတည်ပြုပြီး)</option>
                    <option value="Shipped">Shipped (ပို့ဆောင်နေပြီ)</option>
                    <option value="Delivered">Delivered (ပို့ဆောင်ပြီး)</option>
                    <option value="Cancelled">Cancelled (ပယ်ဖျက်)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Customer Info */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-1.5">
                  <p className="font-bold text-stone-900 text-sm">
                    {order.customerName}
                  </p>
                  <p className="text-stone-600 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-800" />{" "}
                    {order.phone}
                  </p>
                  <p className="text-stone-600 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-800 shrink-0 mt-0.5" />
                    <span>
                      {order.city} — {order.address}
                    </span>
                  </p>
                  {order.note && (
                    <p className="text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 mt-1">
                      မှတ်ချက်: {order.note}
                    </p>
                  )}
                </div>

                {/* Items Ordered */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-2">
                  <p className="font-bold text-stone-700">
                    မှာယူထားသော အိတ်များ:
                  </p>
                  {order.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="text-stone-800 font-medium">
                        • {item.nameEn} ({item.selectedColor}) × {item.quantity}
                      </span>
                      <span className="font-bold text-stone-900 shrink-0">
                        {(item.price * item.quantity).toLocaleString()} MMK
                      </span>
                    </div>
                  ))}
                </div>

                {/* Payment Info */}
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/70 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] uppercase font-bold text-stone-500">
                      ငွေပေးချေမှုစနစ် (Payment)
                    </span>
                    <p className="text-sm font-extrabold text-stone-900 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-amber-800" />
                      {order.paymentMethod}
                    </p>
                    {order.transactionRef && (
                      <p className="text-xs font-mono bg-white px-2.5 py-1 rounded-lg border border-amber-200 text-amber-950">
                        ပြေစာနံပါတ်: <strong>#{order.transactionRef}</strong>
                      </p>
                    )}
                  </div>
                  <div className="pt-2 border-t border-amber-200/60 flex justify-between items-baseline">
                    <span className="font-bold text-stone-700">စုစုပေါင်း:</span>
                    <span className="text-base font-extrabold text-amber-950">
                      {order.total.toLocaleString()} MMK
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Product Inventory */}
      {activeTab === "products" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-2xl bg-white border border-stone-200 flex gap-4 items-center"
            >
              <img
                src={p.image}
                alt={p.nameEn}
                className="w-20 h-24 rounded-xl object-cover bg-stone-100 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-amber-800">
                      {p.category}
                    </span>
                    <h4 className="text-sm font-bold text-stone-900 truncate">
                      {p.nameEn}
                    </h4>
                  </div>
                  <button
                    onClick={() => {
                      onDeleteProduct(p.id);
                      showNotice(`${p.nameEn} ကို စာရင်းမှ ဖျက်ပြီးပါပြီ။`);
                    }}
                    className="p-1.5 text-stone-400 hover:text-rose-600 transition"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-sm font-extrabold text-stone-900">
                      {p.price.toLocaleString()} MMK
                    </span>
                    {p.wholesalePrice && (
                      <span className="text-[11px] text-amber-800 font-semibold ml-2">
                        (လက်ကား: {p.wholesalePrice.toLocaleString()})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500">Stock:</span>
                    <button
                      onClick={() =>
                        onUpdateProduct({
                          ...p,
                          stock: Math.max(0, p.stock - 1),
                        })
                      }
                      className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-800"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-stone-900 min-w-[24px] text-center">
                      {p.stock}
                    </span>
                    <button
                      onClick={() =>
                        onUpdateProduct({
                          ...p,
                          stock: p.stock + 1,
                        })
                      }
                      className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-800"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2.5: Category Management */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleCreateCategory}
            className="lg:col-span-5 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 h-fit"
          >
            <h3 className="text-base font-extrabold text-stone-900 border-b border-stone-200 pb-3 flex items-center gap-2">
              <Tag className="w-5 h-5 text-amber-800" />
              Category အသစ်ထည့်ရန် (Add New Category)
            </h3>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Category Name (English Display Label) *
              </label>
              <input
                type="text"
                required
                value={newCatLabel}
                onChange={(e) => setNewCatLabel(e.target.value)}
                placeholder="e.g. Travel & Luggage, Men's Bags, Cosmetic Pouches"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 text-stone-900 focus:border-amber-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Short Category Code / Tag (English - Optional)
              </label>
              <input
                type="text"
                value={newCatId}
                onChange={(e) => setNewCatId(e.target.value)}
                placeholder="e.g. Travel, Men, Pouch (အလွတ်ထားပါက အပေါ်အမည်အတိုင်း သုံးပါမည်)"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 text-stone-900 focus:border-amber-800 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-stone-900 hover:bg-amber-900 text-white font-bold text-sm transition shadow-md"
            >
              Category အသစ် ထည့်သွင်းမည် (Add Category)
            </button>
          </form>

          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-base font-extrabold text-stone-900">
                လက်ရှိ Category စာရင်း (Active Categories)
              </h3>
              <span className="text-xs text-stone-500">
                Storefront နှင့် Add Handbag တွင် အသုံးပြုနေသော အမျိုးအစားများ
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories
                .filter((c) => c.id !== "All")
                .map((cat) => {
                  const count = products.filter(
                    (p) => p.category === cat.id
                  ).length;
                  return (
                    <div
                      key={cat.id}
                      className="p-4 rounded-2xl border border-stone-200 bg-stone-50/70 flex items-center justify-between gap-2"
                    >
                      <div>
                        <span className="text-[11px] font-bold uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                          {cat.id}
                        </span>
                        <h4 className="text-sm font-bold text-stone-900 mt-1">
                          {cat.labelEn}
                        </h4>
                        <p className="text-xs text-stone-500">
                          အိတ်အရေအတွက်: {count} မျိုး
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteCategory(cat.id);
                          showNotice(`Category "${cat.labelEn}" ကို ဖျက်ပြီးပါပြီ။`);
                        }}
                        className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: User Management */}
      {activeTab === "users" && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-800" />
                အသုံးပြုသူအကောင့်များ စီမံခန့်ခွဲခြင်း (User Management)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                ပထမဆုံး Sign Up ပြုလုပ်သူသည် Admin ဖြစ်ပြီး ကျန်အသုံးပြုသူများကိုလည်း Admin သို့မဟုတ် Customer အဖြစ် ပြောင်းလဲသတ်မှတ်နိုင်ပါသည်။
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
              စုစုပေါင်း အကောင့် ({users.length}) ခု
            </span>
          </div>

          {users.length === 0 ? (
            <div className="p-12 text-center text-sm text-stone-500">
              အကောင့်ဖွင့်ထားသူ မရှိသေးပါ။
            </div>
          ) : (
            <div className="divide-y divide-stone-200">
              {users.map((u, idx) => {
                const isSelf = u.id === currentUser.id;
                const userOrdersCount = orders.filter(
                  (o) =>
                    (o.userEmail &&
                      o.userEmail.toLowerCase() === u.email.toLowerCase()) ||
                    o.phone.trim() === u.phone.trim()
                ).length;

                return (
                  <div
                    key={u.id}
                    className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-stone-50/70 transition"
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-base shrink-0 ${
                          u.role === "admin"
                            ? "bg-amber-800 text-white"
                            : "bg-stone-200 text-stone-800"
                        }`}
                      >
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-extrabold text-stone-900">
                            {u.name}
                          </span>
                          {idx === 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                              First Sign-Up (Founder)
                            </span>
                          )}
                          {isSelf && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              လက်ရှိအကောင့် (You)
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-stone-600">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-stone-400" />
                            {u.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-stone-400" />
                            {u.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-stone-400" />
                            {u.city} ({u.address})
                          </span>
                        </div>

                        <p className="text-[11px] text-stone-400">
                          အော်ဒါအရေအတွက်: <strong>{userOrdersCount} ခု</strong> •
                          အကောင့်ဖွင့်သည့်ရက်:{" "}
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleString()
                            : "-"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end lg:self-center">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-amber-800" />
                        <select
                          value={u.role}
                          disabled={isSelf}
                          onChange={(e) => {
                            const newRole = e.target.value as
                              | "admin"
                              | "customer";
                            onUpdateUserRole(u.id, newRole);
                            showNotice(
                              `${u.name} ၏ အဆင့်ကို ${
                                newRole === "admin" ? "Admin" : "Customer"
                              } သို့ ပြောင်းလဲပြီးပါပြီ။`
                            );
                          }}
                          className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 bg-white disabled:bg-stone-100 disabled:text-stone-500"
                        >
                          <option value="admin">Admin (ဆိုင်ရှင်)</option>
                          <option value="customer">Customer (ဝယ်ယူသူ)</option>
                        </select>
                      </div>

                      {!isSelf && (
                        <button
                          onClick={() => {
                            onDeleteUser(u.id);
                            showNotice(
                              `${u.name} ၏ အကောင့်ကို ဖျက်သိမ်းပြီးပါပြီ။`
                            );
                          }}
                          className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3.5: Announcements Management */}
      {activeTab === "announcements" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Create New Announcement Form */}
          <form
            onSubmit={handleCreateAnnouncement}
            className="lg:col-span-5 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 h-fit"
          >
            <h3 className="text-base font-extrabold text-stone-900 border-b border-stone-200 pb-3 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-amber-800" />
              ကြော်ငြာနှင့် အသိပေးချက်အသစ် တင်ရန် (New Post)
            </h3>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                ခေါင်းစဉ် (Announcement Title) *
              </label>
              <input
                type="text"
                required
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                placeholder="ဥပမာ - သီတင်းကျွတ် အထူးလျှော့ဈေး 15% OFF!"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 text-stone-900 focus:border-amber-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                အမျိုးအစား (Tag / Category)
              </label>
              <select
                value={annTag}
                onChange={(e) =>
                  setAnnTag(e.target.value as Announcement["tag"])
                }
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 text-stone-900 bg-white focus:border-amber-800 focus:outline-none"
              >
                <option value="Promotion">Promotion (ကြော်ငြာ / လျှော့ဈေး)</option>
                <option value="New Arrival">New Arrival (ပစ္စည်းအသစ်ရောက်ရှိခြင်း)</option>
                <option value="Wholesale">Wholesale (လက်ကားအသိပေးချက်)</option>
                <option value="Notice">Notice (အရေးကြီး အသိပေးချက်)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                အကြောင်းအရာ အပြည့်အစုံ (Content / Message) *
              </label>
              <textarea
                rows={4}
                required
                value={annContent}
                onChange={(e) => setAnnContent(e.target.value)}
                placeholder="ကြော်ငြာ သို့မဟုတ် အသိပေးချက် အကြောင်းအရာ အပြည့်အစုံကို ရေးသားပါ..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 text-stone-900 focus:border-amber-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                ဓာတ်ပုံ (Image - ဖုန်း/ကွန်ပျူတာမှ တင်ရန် သို့မဟုတ် URL ထည့်ရန်)
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {PRESET_BAG_IMAGES.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setAnnImage(preset.url)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                      annImage === preset.url
                        ? "bg-amber-900 text-white border-amber-900"
                        : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                    }`}
                  >
                    {preset.label.split(" ")[0]}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAnnImage("")}
                  className="text-[11px] px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100"
                >
                  ပုံမထည့်ပါ (Text Only)
                </button>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 text-xs font-bold transition">
                  <Upload className="w-3.5 h-3.5" />
                  ပုံရွေးတင်ရန် (Upload Photo)
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAnnImageFileUpload}
                    className="hidden"
                  />
                </label>
                {annImage && (
                  <img
                    src={annImage}
                    alt="Preview"
                    className="w-10 h-10 rounded-lg object-cover border border-stone-200"
                  />
                )}
              </div>

              <input
                type="text"
                value={annImage}
                onChange={(e) => setAnnImage(e.target.value)}
                placeholder="https://... (သို့မဟုတ် ပုံမပါလိုပါက အလွတ်ထားပါ)"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 text-stone-900"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-stone-900 hover:bg-amber-900 text-white font-bold text-sm transition shadow-md"
            >
              ကြေညာချက် တင်မည် (Publish Announcement)
            </button>
          </form>

          {/* Right: Existing Announcements List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h3 className="text-base font-extrabold text-stone-900">
                  တင်ထားသော ကြေညာချက်များ ({announcements.length})
                </h3>
                <span className="text-xs text-stone-500">
                  ပင်မစာမျက်နှာ ညာဘက်ခြမ်း Slider တွင် ပြသနေပါသည်
                </span>
              </div>

              {announcements.length === 0 ? (
                <div className="text-center py-10 text-xs text-stone-500">
                  လက်ရှိတွင် တင်ထားသော ကြေညာချက် မရှိသေးပါ။
                </div>
              ) : (
                <div className="space-y-3">
                  {announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 flex gap-4 items-start"
                    >
                      {ann.image && (
                        <img
                          src={ann.image}
                          alt={ann.title}
                          className="w-20 h-20 rounded-xl object-cover bg-stone-200 shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900">
                              {ann.tag}
                            </span>
                            <span className="text-[11px] text-stone-400 ml-2">
                              {new Date(ann.createdAt).toLocaleDateString()}
                            </span>
                            <h4 className="text-sm font-bold text-stone-900 mt-1">
                              {ann.title}
                            </h4>
                          </div>
                          <button
                            onClick={() => {
                              onDeleteAnnouncement(ann.id);
                              showNotice("ကြေညာချက်ကို ဖျက်သိမ်းပြီးပါပြီ။");
                            }}
                            className="p-1.5 text-stone-400 hover:text-rose-600 transition shrink-0"
                            title="Delete Announcement"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                          {ann.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Add New Handbag */}
      {activeTab === "add" && (
        <form
          onSubmit={handleCreateProduct}
          className="max-w-2xl bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4"
        >
          <h3 className="text-lg font-extrabold text-stone-900 border-b border-stone-200 pb-3">
            ပုံ့ပုံ့ (Pont Pont) အိတ်ဒီဇိုင်းအသစ် ထည့်သွင်းရန် (Add New Handbag)
          </h3>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Product Name (English) *
            </label>
            <input
              type="text"
              required
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="e.g. Pont Pont Classic Sling Bag"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 text-stone-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Category (English)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 text-stone-900 bg-white"
              >
                {categories
                  .filter((c) => c.id !== "All")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.labelEn} ({c.id})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                လက်လီဈေး (Retail Price MMK) *
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                လက်ကားဈေး (Wholesale MMK)
              </label>
              <input
                type="number"
                value={wholesalePrice}
                onChange={(e) => setWholesalePrice(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 text-stone-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                မူရင်းဈေး (Original Price MMK)
              </label>
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                လက်ကျန်အရေအတွက် (Stock) *
              </label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                အထူးတံဆိပ် (Badge)
              </label>
              <select
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 text-stone-900 bg-white"
              >
                <option value="New Arrival">New Arrival</option>
                <option value="Best Seller">Best Seller</option>
                <option value="Wholesale Hot">
                  Wholesale Hot (လက်ကားရောင်းအားကောင်း)
                </option>
                <option value="Sale">Sale</option>
                <option value="">None</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              ဓာတ်ပုံရွေးချယ်ရန် သို့မဟုတ် Image URL ထည့်ရန်
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {PRESET_BAG_IMAGES.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setImage(preset.url)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition ${
                    image === preset.url
                      ? "bg-amber-900 text-white border-amber-900"
                      : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 text-stone-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                သားရေအမျိုးအစား (Material)
              </label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 text-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                အရွယ်အစား (Dimensions)
              </label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 text-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              အိတ်အကြောင်း အသေးစိတ် (မြန်မာဘာသာဖြင့်)
            </label>
            <textarea
              rows={2}
              value={descriptionMm}
              onChange={(e) => setDescriptionMm(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 text-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Description (English)
            </label>
            <textarea
              rows={2}
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 text-stone-900"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-stone-900 hover:bg-amber-900 text-white font-bold text-sm transition shadow-lg"
          >
            အိတ်အသစ် စာရင်းသွင်းမည် (Save & Publish Handbag)
          </button>
        </form>
      )}
    </div>
  );
}
