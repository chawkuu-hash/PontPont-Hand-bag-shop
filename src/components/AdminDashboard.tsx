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
  Palette,
  Globe,
  Bot,
  Sparkles,
  Key,
  Sliders,
} from "lucide-react";
import {
  Announcement,
  CategoryItem,
  Order,
  Product,
  SHOP_THEMES,
  ShopThemeId,
  UserProfile,
  ChatbotConfig,
  DEFAULT_CHATBOT_CONFIG,
} from "@/data/initialData";

interface AdminDashboardProps {
  currentUser: UserProfile;
  users: UserProfile[];
  products: Product[];
  orders: Order[];
  announcements: Announcement[];
  categories: CategoryItem[];
  currentTheme: ShopThemeId;
  chatbotConfig?: ChatbotConfig;
  onUpdateChatbotConfig?: (config: ChatbotConfig) => Promise<void>;
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
  onUpdateTheme: (theme: ShopThemeId) => Promise<void>;
  onBackToShop: () => void;
  lang?: "mm" | "en";
  onToggleLang?: () => void;
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
  currentTheme,
  chatbotConfig = DEFAULT_CHATBOT_CONFIG,
  onUpdateChatbotConfig,
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
  onUpdateTheme,
  onBackToShop,
  lang = "mm",
  onToggleLang,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    | "orders"
    | "products"
    | "categories"
    | "users"
    | "announcements"
    | "themes"
    | "chatbot"
    | "add"
  >("orders");

  // Chatbot Settings Form State
  const [botProvider, setBotProvider] = useState<ChatbotConfig["provider"]>(
    chatbotConfig?.provider || "mock"
  );
  const [botApiUrl, setBotApiUrl] = useState(chatbotConfig?.apiUrl || "");
  const [botApiKey, setBotApiKey] = useState(chatbotConfig?.apiKey || "");
  const [botModel, setBotModel] = useState(chatbotConfig?.model || "gemini-1.5-flash");
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [botName, setBotName] = useState(chatbotConfig?.botName || "Pont Pont AI Assistant");
  const [botSystemPrompt, setBotSystemPrompt] = useState(
    chatbotConfig?.systemPrompt || DEFAULT_CHATBOT_CONFIG.systemPrompt
  );
  const [botWelcomeMm, setBotWelcomeMm] = useState(
    chatbotConfig?.welcomeMessageMm || DEFAULT_CHATBOT_CONFIG.welcomeMessageMm
  );
  const [botWelcomeEn, setBotWelcomeEn] = useState(
    chatbotConfig?.welcomeMessageEn || DEFAULT_CHATBOT_CONFIG.welcomeMessageEn
  );
  const [botEnabled, setBotEnabled] = useState(chatbotConfig?.enabled ?? true);
  const [isSavingBot, setIsSavingBot] = useState(false);

  // Auto-fetch models when API Key or API URL changes
  const fetchAvailableModels = async (
    targetUrl?: string,
    targetKey?: string,
    targetProvider?: string
  ) => {
    const url = targetUrl !== undefined ? targetUrl : botApiUrl;
    const key = targetKey !== undefined ? targetKey : botApiKey;
    const provider = targetProvider !== undefined ? targetProvider : botProvider;

    if (provider === "mock") {
      setAvailableModels([]);
      return;
    }

    if (!key && !url) return;

    setIsLoadingModels(true);
    try {
      const res = await fetch("/api/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "FETCH_AI_MODELS",
          apiUrl: url,
          apiKey: key,
          provider: provider,
        }),
      });
      const data = await res.json();
      if (Array.isArray(data.models) && data.models.length > 0) {
        setAvailableModels(data.models);
        // Automatically select the first or best recommended model if current is not in list
        if (!data.models.includes(botModel)) {
          const preferred =
            data.models.find(
              (m: string) =>
                m.includes("flash") ||
                m.includes("gpt-4o-mini") ||
                m.includes("llama-3")
            ) || data.models[0];
          setBotModel(preferred);
        }
      }
    } catch (err) {
      console.error("Auto load models error:", err);
    } finally {
      setIsLoadingModels(false);
    }
  };

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
            {lang === "en"
              ? "Pont Pont Bag Shop Management"
              : "ပုံ့ပုံ့ (Pont Pont) အိတ်ဆိုင် စီမံခန့်ခွဲမှုစနစ်"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Admin Dashboard ({currentUser.name})
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 mt-1">
            {lang === "en"
              ? "Manage orders, inventory, categories, users, announcements, and storefront themes"
              : "အော်ဒါများ စစ်ဆေးခြင်း၊ အိတ်အသစ်ထည့်သွင်းခြင်း နှင့် အသုံးပြုသူအကောင့်များ (Users) စီမံခန့်ခွဲခြင်း"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {onToggleLang && (
            <button
              type="button"
              onClick={onToggleLang}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-extrabold border border-white/20 transition"
              title="Switch Language (MM / EN)"
            >
              <Globe className="w-4 h-4 text-amber-300" />
              <span>{lang === "en" ? "EN | မြန်မာ" : "မြန်မာ | EN"}</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab("themes")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-400 text-stone-950 text-xs sm:text-sm font-extrabold hover:bg-amber-300 transition shadow"
          >
            <Palette className="w-4 h-4" />
            {lang === "en" ? "Themes (3)" : "Theme ဒီဇိုင်းရွေးရန် (3 Themes)"}
          </button>
          <button
            onClick={onBackToShop}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-stone-900 text-xs sm:text-sm font-bold hover:bg-amber-100 transition shadow"
          >
            <ArrowLeft className="w-4 h-4" />
            {lang === "en" ? "Back to Storefront" : "အရောင်းဆိုင်သို့ ပြန်သွားရန်"}
          </button>
        </div>
      </div>

      {toast && (
        <div className="p-4 rounded-2xl bg-emerald-900 text-white text-sm font-semibold flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          {toast}
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs font-semibold text-stone-500 truncate">
              {lang === "en" ? "Total Revenue" : "စုစုပေါင်း ရောင်းရငွေ (Revenue)"}
            </p>
            <p className="text-base sm:text-2xl font-extrabold text-stone-900 mt-1">
              {totalRevenue.toLocaleString()}{" "}
              <span className="text-xs sm:text-sm font-bold text-amber-900">MMK</span>
            </p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs font-semibold text-stone-500 truncate">
              {lang === "en" ? "Total Orders" : "အော်ဒါစုစုပေါင်း (Total Orders)"}
            </p>
            <p className="text-base sm:text-2xl font-extrabold text-stone-900 mt-1">
              {orders.length}{" "}
              <span className="text-[11px] sm:text-sm font-normal text-stone-500">
                (Pending: {pendingOrdersCount})
              </span>
            </p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs font-semibold text-stone-500 truncate">
              {lang === "en" ? "Registered Users" : "အသုံးပြုသူအကောင့်များ (Users)"}
            </p>
            <p className="text-base sm:text-2xl font-extrabold text-stone-900 mt-1">
              {users.length}{" "}
              <span className="text-xs sm:text-sm font-normal text-stone-500">
                {lang === "en" ? "users" : "ဦး"}
              </span>
            </p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs font-semibold text-stone-500 truncate">
              {lang === "en" ? "Total Products" : "အိတ်အမျိုးအစားပေါင်း (Products)"}
            </p>
            <p className="text-base sm:text-2xl font-extrabold text-stone-900 mt-1">
              {products.length}{" "}
              <span className="text-xs sm:text-sm font-normal text-stone-500">
                {lang === "en" ? "items" : "မျိုး"}
              </span>
            </p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-stone-100 text-stone-800 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3">
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === "orders"
              ? "bg-stone-900 text-white shadow"
              : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-100"
          }`}
        >
          {lang === "en" ? `Orders (${orders.length})` : `အော်ဒါများ (${orders.length})`}
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === "products"
              ? "bg-stone-900 text-white shadow"
              : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-100"
          }`}
        >
          {lang === "en"
            ? `Inventory (${products.length})`
            : `အိတ်စာရင်း (${products.length})`}
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition ${
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
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition ${
            activeTab === "users"
              ? "bg-stone-900 text-white shadow"
              : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-100"
          }`}
        >
          <Users className="w-4 h-4" />
          Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("announcements")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition ${
            activeTab === "announcements"
              ? "bg-stone-900 text-white shadow"
              : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-100"
          }`}
        >
          <Megaphone className="w-4 h-4 text-amber-700" />
          {lang === "en"
            ? `Announcements (${announcements.length})`
            : `ကြေညာချက်များ (${announcements.length})`}
        </button>
        <button
          onClick={() => setActiveTab("themes")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition ${
            activeTab === "themes"
              ? "bg-stone-900 text-white shadow"
              : "bg-amber-50 text-amber-950 border border-amber-300 hover:bg-amber-100"
          }`}
        >
          <Palette className="w-4 h-4 text-amber-700" />
          {lang === "en" ? "Themes (3)" : "Theme ဒီဇိုင်းရွေးရန် (3 Themes)"}
        </button>
        <button
          onClick={() => setActiveTab("chatbot")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition ${
            activeTab === "chatbot"
              ? "bg-stone-900 text-white shadow"
              : "bg-amber-50 text-amber-950 border border-amber-300 hover:bg-amber-100"
          }`}
        >
          <Bot className="w-4 h-4 text-amber-700" />
          {lang === "en" ? "AI Chatbot Settings" : "AI Chatbot ဆက်တင်များ"}
        </button>
        <button
          onClick={() => setActiveTab("add")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition ${
            activeTab === "add"
              ? "bg-amber-800 text-white shadow"
              : "bg-amber-50 text-amber-950 border border-amber-200 hover:bg-amber-100"
          }`}
        >
          <Plus className="w-4 h-4" />
          {lang === "en" ? "Add Handbag" : "အိတ်အသစ်ထည့်ရန်"}
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
                    {lang === "en" ? "Status:" : "Status ပြောင်းရန်:"}
                  </label>
                  <select
                    value={order.status}
                    onChange={(e) => {
                      onUpdateOrderStatus(
                        order.id,
                        e.target.value as Order["status"]
                      );
                      showNotice(
                        lang === "en"
                          ? `Order ${order.id} updated to ${e.target.value}.`
                          : `Order ${order.id} အခြေအနေကို ${e.target.value} သို့ ပြောင်းလဲပြီးပါပြီ။`
                      );
                    }}
                    className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 bg-stone-50 focus:outline-none focus:border-amber-800"
                  >
                    <option value="Pending">
                      {lang === "en" ? "Pending" : "Pending (စစ်ဆေးဆဲ)"}
                    </option>
                    <option value="Confirmed">
                      {lang === "en" ? "Confirmed" : "Confirmed (အတည်ပြုပြီး)"}
                    </option>
                    <option value="Shipped">
                      {lang === "en" ? "Shipped" : "Shipped (ပို့ဆောင်နေပြီ)"}
                    </option>
                    <option value="Delivered">
                      {lang === "en" ? "Delivered" : "Delivered (ပို့ဆောင်ပြီး)"}
                    </option>
                    <option value="Cancelled">
                      {lang === "en" ? "Cancelled" : "Cancelled (ပယ်ဖျက်)"}
                    </option>
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
                      {lang === "en" ? "Note:" : "မှတ်ချက်:"} {order.note}
                    </p>
                  )}
                </div>

                {/* Items Ordered */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-2">
                  <p className="font-bold text-stone-700">
                    {lang === "en" ? "Ordered Items:" : "မှာယူထားသော အိတ်များ:"}
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
                      {lang === "en"
                        ? "Payment Method"
                        : "ငွေပေးချေမှုစနစ် (Payment)"}
                    </span>
                    <p className="text-sm font-extrabold text-stone-900 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-amber-800" />
                      {order.paymentMethod}
                    </p>
                    {order.transactionRef && (
                      <p className="text-xs font-mono bg-white px-2.5 py-1 rounded-lg border border-amber-200 text-amber-950">
                        {lang === "en" ? "Ref ID:" : "ပြေစာနံပါတ်:"}{" "}
                        <strong>#{order.transactionRef}</strong>
                      </p>
                    )}
                  </div>
                  <div className="pt-2 border-t border-amber-200/60 flex justify-between items-baseline">
                    <span className="font-bold text-stone-700">
                      {lang === "en" ? "Total:" : "စုစုပေါင်း:"}
                    </span>
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
                        ({lang === "en" ? "Wholesale:" : "လက်ကား:"}{" "}
                        {p.wholesalePrice.toLocaleString()})
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
              {lang === "en"
                ? "Add New Category"
                : "Category အသစ်ထည့်ရန် (Add New Category)"}
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
                placeholder={
                  lang === "en"
                    ? "e.g. Travel, Men, Pouch (optional)"
                    : "e.g. Travel, Men, Pouch (အလွတ်ထားပါက အပေါ်အမည်အတိုင်း သုံးပါမည်)"
                }
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 text-stone-900 focus:border-amber-800 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-stone-900 hover:bg-amber-900 text-white font-bold text-sm transition shadow-md"
            >
              {lang === "en"
                ? "Add Category"
                : "Category အသစ် ထည့်သွင်းမည် (Add Category)"}
            </button>
          </form>

          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-base font-extrabold text-stone-900">
                {lang === "en"
                  ? "Active Categories"
                  : "လက်ရှိ Category စာရင်း (Active Categories)"}
              </h3>
              <span className="text-xs text-stone-500">
                {lang === "en"
                  ? "Used in Storefront & Add Handbag"
                  : "Storefront နှင့် Add Handbag တွင် အသုံးပြုနေသော အမျိုးအစားများ"}
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
                          {lang === "en"
                            ? `Products: ${count}`
                            : `အိတ်အရေအတွက်: ${count} မျိုး`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteCategory(cat.id);
                          showNotice(
                            lang === "en"
                              ? `Category "${cat.labelEn}" deleted.`
                              : `Category "${cat.labelEn}" ကို ဖျက်ပြီးပါပြီ။`
                          );
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
                {lang === "en"
                  ? "User Management"
                  : "အသုံးပြုသူအကောင့်များ စီမံခန့်ခွဲခြင်း (User Management)"}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {lang === "en"
                  ? "The first Sign-Up user is automatically Admin. Manage roles (Admin / Customer) below."
                  : "ပထမဆုံး Sign Up ပြုလုပ်သူသည် Admin ဖြစ်ပြီး ကျန်အသုံးပြုသူများကိုလည်း Admin သို့မဟုတ် Customer အဖြစ် ပြောင်းလဲသတ်မှတ်နိုင်ပါသည်။"}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
              {lang === "en"
                ? `Total Accounts: ${users.length}`
                : `စုစုပေါင်း အကောင့် (${users.length}) ခု`}
            </span>
          </div>

          {users.length === 0 ? (
            <div className="p-12 text-center text-sm text-stone-500">
              {lang === "en"
                ? "No registered users yet."
                : "အကောင့်ဖွင့်ထားသူ မရှိသေးပါ။"}
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
                              {lang === "en" ? "You" : "လက်ရှိအကောင့် (You)"}
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
                          {lang === "en" ? "Orders:" : "အော်ဒါအရေအတွက်:"}{" "}
                          <strong>{userOrdersCount}</strong> •{" "}
                          {lang === "en" ? "Joined:" : "အကောင့်ဖွင့်သည့်ရက်:"}{" "}
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
                              lang === "en"
                                ? `${u.name} role updated to ${newRole}.`
                                : `${u.name} ၏ အဆင့်ကို ${
                                    newRole === "admin" ? "Admin" : "Customer"
                                  } သို့ ပြောင်းလဲပြီးပါပြီ။`
                            );
                          }}
                          className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 bg-white disabled:bg-stone-100 disabled:text-stone-500"
                        >
                          <option value="admin">
                            {lang === "en" ? "Admin" : "Admin (ဆိုင်ရှင်)"}
                          </option>
                          <option value="customer">
                            {lang === "en" ? "Customer" : "Customer (ဝယ်ယူသူ)"}
                          </option>
                        </select>
                      </div>

                      {!isSelf && (
                        <button
                          onClick={() => {
                            onDeleteUser(u.id);
                            showNotice(
                              lang === "en"
                                ? `Deleted user ${u.name}.`
                                : `${u.name} ၏ အကောင့်ကို ဖျက်သိမ်းပြီးပါပြီ။`
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
              {lang === "en"
                ? "Publish New Announcement"
                : "ကြော်ငြာနှင့် အသိပေးချက်အသစ် တင်ရန် (New Post)"}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {lang === "en"
                  ? "Announcement Title *"
                  : "ခေါင်းစဉ် (Announcement Title) *"}
              </label>
              <input
                type="text"
                required
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                placeholder={
                  lang === "en"
                    ? "e.g. Holiday Special 15% OFF!"
                    : "ဥပမာ - သီတင်းကျွတ် အထူးလျှော့ဈေး 15% OFF!"
                }
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 text-stone-900 focus:border-amber-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {lang === "en"
                  ? "Tag / Category"
                  : "အမျိုးအစား (Tag / Category)"}
              </label>
              <select
                value={annTag}
                onChange={(e) =>
                  setAnnTag(e.target.value as Announcement["tag"])
                }
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 text-stone-900 bg-white focus:border-amber-800 focus:outline-none"
              >
                <option value="Promotion">
                  {lang === "en"
                    ? "Promotion / Discount"
                    : "Promotion (ကြော်ငြာ / လျှော့ဈေး)"}
                </option>
                <option value="New Arrival">
                  {lang === "en"
                    ? "New Arrival"
                    : "New Arrival (ပစ္စည်းအသစ်ရောက်ရှိခြင်း)"}
                </option>
                <option value="Wholesale">
                  {lang === "en"
                    ? "Wholesale Notice"
                    : "Wholesale (လက်ကားအသိပေးချက်)"}
                </option>
                <option value="Notice">
                  {lang === "en"
                    ? "Important Notice"
                    : "Notice (အရေးကြီး အသိပေးချက်)"}
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {lang === "en"
                  ? "Content / Message *"
                  : "အကြောင်းအရာ အပြည့်အစုံ (Content / Message) *"}
              </label>
              <textarea
                rows={4}
                required
                value={annContent}
                onChange={(e) => setAnnContent(e.target.value)}
                placeholder={
                  lang === "en"
                    ? "Write your announcement details..."
                    : "ကြော်ငြာ သို့မဟုတ် အသိပေးချက် အကြောင်းအရာ အပြည့်အစုံကို ရေးသားပါ..."
                }
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 text-stone-900 focus:border-amber-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {lang === "en"
                  ? "Image (Upload Photo or Enter URL)"
                  : "ဓာတ်ပုံ (Image - ဖုန်း/ကွန်ပျူတာမှ တင်ရန် သို့မဟုတ် URL ထည့်ရန်)"}
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
                  {lang === "en" ? "Text Only" : "ပုံမထည့်ပါ (Text Only)"}
                </button>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 text-xs font-bold transition">
                  <Upload className="w-3.5 h-3.5" />
                  {lang === "en" ? "Upload Photo" : "ပုံရွေးတင်ရန် (Upload Photo)"}
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
                placeholder={
                  lang === "en"
                    ? "https://... (leave blank for text only)"
                    : "https://... (သို့မဟုတ် ပုံမပါလိုပါက အလွတ်ထားပါ)"
                }
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 text-stone-900"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-stone-900 hover:bg-amber-900 text-white font-bold text-sm transition shadow-md"
            >
              {lang === "en"
                ? "Publish Announcement"
                : "ကြေညာချက် တင်မည် (Publish Announcement)"}
            </button>
          </form>

          {/* Right: Existing Announcements List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h3 className="text-base font-extrabold text-stone-900">
                  {lang === "en"
                    ? `Published Announcements (${announcements.length})`
                    : `တင်ထားသော ကြေညာချက်များ (${announcements.length})`}
                </h3>
                <span className="text-xs text-stone-500">
                  {lang === "en"
                    ? "Displayed in Hero Slider"
                    : "ပင်မစာမျက်နှာ ညာဘက်ခြမ်း Slider တွင် ပြသနေပါသည်"}
                </span>
              </div>

              {announcements.length === 0 ? (
                <div className="text-center py-10 text-xs text-stone-500">
                  {lang === "en"
                    ? "No announcements published yet."
                    : "လက်ရှိတွင် တင်ထားသော ကြေညာချက် မရှိသေးပါ။"}
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
                              showNotice(
                                lang === "en"
                                  ? "Announcement deleted."
                                  : "ကြေညာချက်ကို ဖျက်သိမ်းပြီးပါပြီ။"
                              );
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

      {/* Tab 3.8: Theme Switcher */}
      {activeTab === "themes" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
            <h3 className="text-lg font-extrabold text-stone-900 flex items-center gap-2">
              <Palette className="w-5 h-5 text-amber-800" />
              {lang === "en"
                ? "Select Storefront Theme (3 Styles)"
                : "Website Theme ဒီဇိုင်းပုံစံ (၃) မျိုး ရွေးချယ်ရန်"}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              {lang === "en"
                ? "Choosing a theme immediately updates the storefront color palette, card shape, buttons, and layout for all visitors."
                : "သင်ရွေးချယ်လိုက်သော Theme ဒီဇိုင်းသည် အရောင်းဆိုင်တစ်ခုလုံး၏ အရောင်၊ ကတ်ပုံစံ၊ ခလုတ်ဒီဇိုင်းနှင့် မျက်နှာပြင်အပြင်အဆင်ကို ဝယ်ယူသူအားလုံးအတွက် ချက်ချင်း ပြောင်းလဲပေးသွားပါမည်။"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SHOP_THEMES.map((t) => {
              const isSelected = currentTheme === t.id;
              return (
                <div
                  key={t.id}
                  className={`rounded-3xl bg-white border-2 overflow-hidden transition flex flex-col justify-between ${
                    isSelected
                      ? "border-amber-700 ring-4 ring-amber-700/15 shadow-xl"
                      : "border-stone-200 hover:border-stone-300 shadow-xs"
                  }`}
                >
                  <div>
                    {/* Visual Mockup Preview Header */}
                    <div
                      className="p-5 h-44 flex flex-col justify-between relative overflow-hidden"
                      style={{ background: t.previewHero }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-stone-950"
                          style={{ backgroundColor: t.previewAccent }}
                        >
                          {t.styleSummary.split("•")[0]}
                        </span>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold shadow">
                            <CheckCircle2 className="w-3 h-3" />{" "}
                            {lang === "en" ? "Active" : "လက်ရှိသုံးနေသည်"}
                          </span>
                        )}
                      </div>

                      {/* Mini Card Shape Preview inside Hero */}
                      <div className="grid grid-cols-2 gap-2.5 pt-2">
                        <div
                          className={`p-2.5 bg-white/95 text-stone-900 text-[10px] font-bold ${
                            t.id === "luxury-gold"
                              ? "rounded-2xl shadow"
                              : t.id === "rose-paris"
                              ? "rounded-t-2xl rounded-b-xl border-2 border-rose-300 shadow-sm"
                              : "rounded-none border-2 border-zinc-950 shadow-[3px_3px_0px_#10b981]"
                          }`}
                        >
                          <div
                            className={`h-8 mb-1.5 ${
                              t.id === "luxury-gold"
                                ? "rounded-lg bg-amber-100"
                                : t.id === "rose-paris"
                                ? "rounded-t-full bg-rose-100"
                                : "rounded-none bg-emerald-100 border border-zinc-900"
                            }`}
                          />
                          Pont Pont Bag
                        </div>
                        <div
                          className={`p-2.5 bg-white/95 text-stone-900 text-[10px] font-bold ${
                            t.id === "luxury-gold"
                              ? "rounded-2xl shadow"
                              : t.id === "rose-paris"
                              ? "rounded-t-2xl rounded-b-xl border-2 border-rose-300 shadow-sm"
                              : "rounded-none border-2 border-zinc-950 shadow-[3px_3px_0px_#10b981]"
                          }`}
                        >
                          <div
                            className={`h-8 mb-1.5 ${
                              t.id === "luxury-gold"
                                ? "rounded-lg bg-stone-200"
                                : t.id === "rose-paris"
                                ? "rounded-t-full bg-pink-100"
                                : "rounded-none bg-zinc-200 border border-zinc-900"
                            }`}
                          />
                          38,000 MMK
                        </div>
                      </div>
                    </div>

                    {/* Theme Details */}
                    <div className="p-5 space-y-2">
                      <h4 className="text-base font-extrabold text-stone-900">
                        {t.nameEn}
                      </h4>
                      <p className="text-xs font-bold text-amber-900">
                        {lang === "en" ? t.styleSummary : t.nameMm}
                      </p>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {lang === "en" ? t.descriptionEn : t.descriptionMm}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateTheme(t.id);
                        showNotice(
                          lang === "en"
                            ? `Switched storefront theme to "${t.nameEn}"!`
                            : `"${t.nameEn}" ဒီဇိုင်းသို့ အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ!`
                        );
                      }}
                      className={`w-full py-3 rounded-2xl text-xs font-extrabold transition ${
                        isSelected
                          ? "bg-emerald-700 text-white cursor-default"
                          : "bg-stone-900 hover:bg-amber-900 text-white shadow-md"
                      }`}
                    >
                      {isSelected
                        ? lang === "en"
                          ? "✓ Currently Active Theme"
                          : "✓ လက်ရှိ အသုံးပြုနေသော Theme"
                        : lang === "en"
                        ? "Apply This Theme"
                        : "ဤ Theme ဒီဇိုင်းကို အသုံးပြုမည် (Apply Theme)"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: AI Chatbot Settings */}
      {activeTab === "chatbot" && (
        <div className="max-w-4xl bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-stone-900 flex items-center gap-2">
                  {lang === "en" ? "AI Chatbot Configuration" : "AI အရောင်းအကူ Chatbot ဆက်တင်များ"}
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </h3>
                <p className="text-xs text-stone-500">
                  {lang === "en"
                    ? "Manage AI API keys, LLM providers (Gemini/OpenAI/Groq), and shop knowledge system prompt."
                    : "AI API Key၊ Provider (Gemini / OpenAI / Groq) နှင့် ဆိုင်အချက်အလက် System Prompt များကို စိတ်ကြိုက်ပြင်ဆင်နိုင်ပါသည်။"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-stone-700 cursor-pointer flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={botEnabled}
                  onChange={(e) => setBotEnabled(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                />
                <span>{lang === "en" ? "Enable Chatbot" : "Chatbot ဖွင့်ထားမည်"}</span>
              </label>
            </div>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!onUpdateChatbotConfig) return;
              setIsSavingBot(true);
              try {
                await onUpdateChatbotConfig({
                  provider: botProvider,
                  apiUrl: botApiUrl.trim(),
                  apiKey: botApiKey.trim(),
                  model: botModel.trim(),
                  botName: botName.trim(),
                  systemPrompt: botSystemPrompt.trim(),
                  welcomeMessageMm: botWelcomeMm.trim(),
                  welcomeMessageEn: botWelcomeEn.trim(),
                  enabled: botEnabled,
                });
                alert(
                  lang === "en"
                    ? "Chatbot configuration updated successfully!"
                    : "Chatbot ဆက်တင်များကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီရှင်။"
                );
              } catch (err) {
                alert("Error saving chatbot config: " + err);
              } finally {
                setIsSavingBot(false);
              }
            }}
            className="space-y-5"
          >
            {/* Grid 1: Provider & API URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  AI Provider (ဝန်ဆောင်မှု ရွေးချယ်ရန်)
                </label>
                <select
                  value={botProvider}
                  onChange={(e) => {
                    const val = e.target.value as ChatbotConfig["provider"];
                    setBotProvider(val);
                    if (val === "gemini") {
                      setBotModel("gemini-1.5-flash");
                      setBotApiUrl("https://generativelanguage.googleapis.com/v1beta/models");
                    } else if (val === "openai") {
                      setBotModel("gpt-4o-mini");
                      setBotApiUrl("https://api.openai.com/v1");
                    } else if (val === "groq") {
                      setBotModel("llama-3.1-8b-instant");
                      setBotApiUrl("https://api.groq.com/openai/v1");
                    } else if (val === "custom") {
                      setBotApiUrl("http://localhost:11434/v1");
                    }
                    fetchAvailableModels(undefined, undefined, val);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-800 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="mock">Built-in Rule Engine (API Key မလိုပါ - မူလစနစ်)</option>
                  <option value="gemini">Google Gemini API (အကြံပြုချက် - မြန်မာစာကျွမ်းကျင်)</option>
                  <option value="openai">OpenAI (GPT-4o-mini)</option>
                  <option value="groq">Groq (Llama 3.1 / Ultra-fast)</option>
                  <option value="custom">Custom API URL (OpenWebUI / Local LLM / Ollama)</option>
                </select>
                <p className="text-[11px] text-stone-500 mt-1">
                  {botProvider === "gemini" && "⭐ aistudio.google.com မှ Free API Key ယူပြီး အသုံးပြုနိုင်ပါသည်။"}
                  {botProvider === "mock" && "API Key မထည့်ဘဲ စနစ်ထဲရှိ အိတ်အချက်အလက်များဖြင့် အလိုအလျောက် ဖြေကြားပေးပါသည်။"}
                  {botProvider === "openai" && "platform.openai.com မှ API Key ဖြင့် တိုက်ရိုက်ချိတ်ဆက်ပါသည်။"}
                  {botProvider === "custom" && "OpenWebUI, LMStudio, vLLM သို့မဟုတ် Ollama OpenAI-compatible Base URL"}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  AI API URL / Endpoint
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={botApiUrl}
                    onChange={(e) => {
                      const url = e.target.value;
                      setBotApiUrl(url);
                    }}
                    onBlur={() => {
                      if (botApiUrl) fetchAvailableModels(botApiUrl, botApiKey, botProvider);
                    }}
                    placeholder={
                      botProvider === "gemini"
                        ? "https://generativelanguage.googleapis.com/v1beta/models"
                        : botProvider === "openai"
                        ? "https://api.openai.com/v1"
                        : botProvider === "groq"
                        ? "https://api.groq.com/openai/v1"
                        : "http://localhost:11434/v1"
                    }
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-mono text-stone-800 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => fetchAvailableModels(botApiUrl, botApiKey, botProvider)}
                    disabled={isLoadingModels}
                    className="px-3 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 shrink-0"
                  >
                    {isLoadingModels ? "Loading..." : "Load Models"}
                  </button>
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  API URL ထည့်လိုက်သည်နှင့် ရရှိနိုင်သော Models များကို အလိုအလျောက် ဆွဲတင်ပေးပါမည်။
                </p>
              </div>
            </div>

            {/* API Key Input */}
            {botProvider !== "mock" && (
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 space-y-2">
                <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-amber-700" />
                  API Key ({botProvider.toUpperCase()})
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={botApiKey}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBotApiKey(val);
                    }}
                    onBlur={() => {
                      if (botApiKey) fetchAvailableModels(botApiUrl, botApiKey, botProvider);
                    }}
                    placeholder={
                      botProvider === "gemini"
                        ? "AIzaSy..."
                        : botProvider === "openai"
                        ? "sk-..."
                        : "gsk_..."
                    }
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-amber-200 text-xs font-mono text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => fetchAvailableModels(botApiUrl, botApiKey, botProvider)}
                    disabled={isLoadingModels}
                    className="px-3.5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 shrink-0 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isLoadingModels ? "Loading..." : "Fetch Models"}</span>
                  </button>
                </div>
                <p className="text-[11px] text-amber-800">
                  🔒 API Key သည် Server ဘက်ခြမ်း SQLite ထဲတွင် လုံခြုံစွာ သိမ်းဆည်းထားပြီး Frontend သို့ ပေါက်ကြားခြင်း မရှိပါ။
                </p>
              </div>
            )}

            {/* AI Model Name / Selection */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>AI Model Name (မော်ဒယ်အမည်)</span>
                {isLoadingModels && (
                  <span className="text-[11px] text-amber-600 font-bold animate-pulse">
                    ⚡ API မှ Models များ ဆွဲတင်နေပါသည်...
                  </span>
                )}
                {availableModels.length > 0 && !isLoadingModels && (
                  <span className="text-[11px] text-emerald-700 font-bold">
                    ✓ Models ({availableModels.length}) ခု အသင့်ရရှိပါသည်
                  </span>
                )}
              </label>

              {availableModels.length > 0 ? (
                <div className="space-y-1.5">
                  <select
                    value={botModel}
                    onChange={(e) => setBotModel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-300 text-xs font-mono font-bold text-stone-900 bg-emerald-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {availableModels.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-stone-500">
                    API URL / Key မှ Auto load လုပ်ထားသော မော်ဒယ်စာရင်းထဲမှ လိုချင်ရာကို ရွေးချယ်နိုင်ပါသည်။
                  </p>
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    value={botModel}
                    onChange={(e) => setBotModel(e.target.value)}
                    placeholder="e.g. gemini-1.5-flash, gemini-2.0-flash, gpt-4o-mini"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-mono text-stone-800 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    API URL သို့မဟုတ် API Key ထည့်ပြီး Fetch Models နှိပ်ပါက Models စာရင်း အလိုအလျောက် ဝင်ရောက်လာပါမည်။
                  </p>
                </div>
              )}
            </div>

            {/* Bot Name & Welcome Messages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Chatbot Display Name (ဘော့တ်အမည်)
                </label>
                <input
                  type="text"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Welcome Message (မြန်မာလို နှုတ်ခွန်းဆက်စာ)
                </label>
                <input
                  type="text"
                  value={botWelcomeMm}
                  onChange={(e) => setBotWelcomeMm(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* System Prompt Editor */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  AI System Prompt (ဆိုင်အချက်အလက်နှင့် သင်ကြားထားချက်များ)
                </label>
                <button
                  type="button"
                  onClick={() => setBotSystemPrompt(DEFAULT_CHATBOT_CONFIG.systemPrompt)}
                  className="text-[11px] text-amber-700 hover:text-amber-900 font-bold underline"
                >
                  Reset to Default Prompt
                </button>
              </div>
              <textarea
                rows={9}
                value={botSystemPrompt}
                onChange={(e) => setBotSystemPrompt(e.target.value)}
                placeholder="ဆိုင်လိပ်စာ၊ ဈေးနှုန်း၊ ဖုန်းနံပါတ်၊ ဖြေကြားရမည့် စည်းမျဉ်းများကို ဤနေရာတွင် ထည့်သွင်းပါ..."
                className="w-full p-3.5 rounded-2xl border border-stone-200 text-xs font-mono leading-relaxed text-stone-800 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                ဤ Prompt သည် AI ဖြေကြားရာတွင် လိုက်နာရမည့် စည်းမျဉ်းများ (ပင်မဆိုင်: ၆၅ လမ်း၊ ၁၀၇×၁၀၈ ကြား၊ ပို့ဆောင်ခ၊ ဖုန်းနံပါတ်) ကို သတ်မှတ်ပေးသည့် နေရာဖြစ်ပါသည်။
              </p>
            </div>

            {/* Save Button */}
            <div className="pt-3 border-t border-stone-200 flex justify-end">
              <button
                type="submit"
                disabled={isSavingBot}
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center gap-2"
              >
                <Bot className="w-4 h-4" />
                <span>{isSavingBot ? "သိမ်းဆည်းနေပါသည်..." : "Chatbot ဆက်တင်များ သိမ်းဆည်းမည်"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: Add New Handbag */}
      {activeTab === "add" && (
        <form
          onSubmit={handleCreateProduct}
          className="max-w-2xl bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4"
        >
          <h3 className="text-lg font-extrabold text-stone-900 border-b border-stone-200 pb-3">
            {lang === "en"
              ? "Add New Handbag"
              : "ပုံ့ပုံ့ (Pont Pont) အိတ်ဒီဇိုင်းအသစ် ထည့်သွင်းရန် (Add New Handbag)"}
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
                {lang === "en"
                  ? "Retail Price (MMK) *"
                  : "လက်လီဈေး (Retail Price MMK) *"}
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
                {lang === "en"
                  ? "Wholesale Price (MMK)"
                  : "လက်ကားဈေး (Wholesale MMK)"}
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
                {lang === "en"
                  ? "Original Price (MMK)"
                  : "မူရင်းဈေး (Original Price MMK)"}
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
                {lang === "en"
                  ? "Stock Quantity *"
                  : "လက်ကျန်အရေအတွက် (Stock) *"}
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
                {lang === "en" ? "Badge" : "အထူးတံဆိပ် (Badge)"}
              </label>
              <select
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 text-stone-900 bg-white"
              >
                <option value="New Arrival">New Arrival</option>
                <option value="Best Seller">Best Seller</option>
                <option value="Wholesale Hot">
                  {lang === "en"
                    ? "Wholesale Hot"
                    : "Wholesale Hot (လက်ကားရောင်းအားကောင်း)"}
                </option>
                <option value="Sale">Sale</option>
                <option value="">None</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {lang === "en"
                ? "Select Preset Photo or Enter Image URL"
                : "ဓာတ်ပုံရွေးချယ်ရန် သို့မဟုတ် Image URL ထည့်ရန်"}
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
                {lang === "en" ? "Material" : "သားရေအမျိုးအစား (Material)"}
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
                {lang === "en" ? "Dimensions" : "အရွယ်အစား (Dimensions)"}
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
              {lang === "en"
                ? "Description (Myanmar)"
                : "အိတ်အကြောင်း အသေးစိတ် (မြန်မာဘာသာဖြင့်)"}
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
            {lang === "en"
              ? "Save & Publish Handbag"
              : "အိတ်အသစ် စာရင်းသွင်းမည် (Save & Publish Handbag)"}
          </button>
        </form>
      )}
    </div>
  );
}
