"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShoppingBag,
  Search,
  Heart,
  User,
  ShieldCheck,
  Truck,
  Smartphone,
  Package,
  SlidersHorizontal,
  Eye,
  CheckCircle2,
  PhoneCall,
  MapPin,
  Clock,
  Store,
  Mail,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  X,
  Globe,
} from "lucide-react";
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_ANNOUNCEMENTS,
  SHOP_INFO,
  Product,
  CartItem,
  Order,
  UserProfile,
  Announcement,
  CategoryItem,
  ShopThemeId,
} from "@/data/initialData";
import AuthModal from "@/components/AuthModal";
import ProductDetailModal from "@/components/ProductDetailModal";
import CartCheckoutDrawer from "@/components/CartCheckoutDrawer";
import OrdersModal from "@/components/OrdersModal";
import AdminDashboard from "@/components/AdminDashboard";
import UserProfilePage from "@/components/UserProfilePage";

export default function PontPontShopPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersCount, setUsersCount] = useState<number>(1);
  const [categories, setCategories] =
    useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [currentTheme, setCurrentTheme] =
    useState<ShopThemeId>("luxury-gold");
  const [announcements, setAnnouncements] = useState<Announcement[]>(
    INITIAL_ANNOUNCEMENTS
  );
  const [annIndex, setAnnIndex] = useState<number>(0);
  const [activeAnnouncement, setActiveAnnouncement] =
    useState<Announcement | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [lang, setLang] = useState<"mm" | "en">("mm");

  // Filters & UI state
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [showWishlistOnly, setShowWishlistOnly] = useState<boolean>(false);
  const [selectedColorsMap, setSelectedColorsMap] = useState<
    Record<string, string>
  >({});

  // Views & Modals
  const [viewMode, setViewMode] = useState<"shop" | "profile" | "admin">("shop");
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string>("");

  // Load persisted data from API and localStorage
  useEffect(() => {
    let savedUserId = "";
    try {
      const savedUserStr = localStorage.getItem("pontpont_user_v3");
      if (savedUserStr) {
        const parsed = JSON.parse(savedUserStr);
        if (parsed?.id) {
          savedUserId = parsed.id;
          setUser(parsed);
        }
      }
      const savedCart = localStorage.getItem("pontpont_cart_v2");
      if (savedCart) setCart(JSON.parse(savedCart));
      const savedWish = localStorage.getItem("pontpont_wishlist");
      if (savedWish) setWishlist(JSON.parse(savedWish));
      const savedLang = localStorage.getItem("pontpont_lang");
      if (savedLang === "en" || savedLang === "mm") setLang(savedLang);
    } catch {}

    fetch("/api/shop", {
      headers: savedUserId ? { "x-user-id": savedUserId } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
        if (data.orders) setOrders(data.orders);
        if (data.announcements) setAnnouncements(data.announcements);
        if (data.categories) setCategories(data.categories);
        if (data.theme) setCurrentTheme(data.theme);
        if (typeof data.usersCount === "number") setUsersCount(data.usersCount);
        if (data.users) setUsers(data.users);
        if (data.currentUser) {
          setUser(data.currentUser);
          try {
            localStorage.setItem(
              "pontpont_user_v3",
              JSON.stringify(data.currentUser)
            );
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("pontpont_cart_v2", JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem("pontpont_wishlist", JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  // Guard Admin view if user is not an admin
  useEffect(() => {
    if (viewMode === "admin" && (!user || user.role !== "admin")) {
      setViewMode("shop");
    }
    if (viewMode === "profile" && !user) {
      setViewMode("shop");
    }
  }, [viewMode, user]);

  // Auto-slide Announcements every 5 seconds
  useEffect(() => {
    if (announcements.length <= 1 || activeAnnouncement) return;
    const timer = setInterval(() => {
      setAnnIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [announcements.length, activeAnnouncement]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3200);
  };

  const handleToggleLang = () => {
    setLang((prev) => {
      const next = prev === "mm" ? "en" : "mm";
      try {
        localStorage.setItem("pontpont_lang", next);
      } catch {}
      return next;
    });
  };

  const handleAuthSuccess = (
    loggedInUser: UserProfile,
    updatedUsers: UserProfile[]
  ) => {
    setUser(loggedInUser);
    setUsers(updatedUsers);
    setUsersCount((c) => Math.max(c, updatedUsers.length || 1));
    // Refresh scoped orders & admin data with the newly set HttpOnly session cookie
    fetch("/api/shop")
      .then((r) => r.json())
      .then((d) => {
        if (d.orders) setOrders(d.orders);
        if (d.users) setUsers(d.users);
        if (typeof d.usersCount === "number") setUsersCount(d.usersCount);
      })
      .catch(() => {});
    if (loggedInUser.role === "admin") {
      triggerToast(
        `မင်္ဂလာပါ ${loggedInUser.name}! Admin (ဆိုင်ရှင်) အကောင့်ဖြင့် ဝင်ရောက်ပြီးပါပြီ။`
      );
    } else {
      triggerToast(`မင်္ဂလာပါ ${loggedInUser.name}! အကောင့်ဝင်ရောက်ပြီးပါပြီ။`);
    }
  };

  const handleUpdateUserProfile = (
    updatedUser: UserProfile,
    allUsers: UserProfile[]
  ) => {
    setUser(updatedUser);
    if (allUsers.length > 0) setUsers(allUsers);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "LOGOUT" }),
      });
    } catch {}
    setUser(null);
    setUsers([]);
    setOrders([]);
    setViewMode("shop");
    try {
      localStorage.removeItem("pontpont_user_v3");
    } catch {}
    triggerToast("အကောင့်မှ ထွက်ပြီးပါပြီ။");
  };

  const handleAddToCart = (
    product: Product,
    color?: string,
    quantity: number = 1
  ) => {
    const chosenColor =
      color ||
      selectedColorsMap[product.id] ||
      product.colors[0]?.name ||
      "Standard";

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id && item.selectedColor === chosenColor
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [...prev, { product, selectedColor: chosenColor, quantity }];
    });

    triggerToast(
      `"${product.nameEn}" (${chosenColor}) ကို ဈေးခြင်းတောင်းထဲ ထည့်ပြီးပါပြီ!`
    );
  };

  const handleUpdateCartQty = (
    productId: string,
    color: string,
    delta: number
  ) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId && item.selectedColor === color
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveCartItem = (productId: string, color: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(item.product.id === productId && item.selectedColor === color)
      )
    );
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const authHeaders = useMemo((): Record<string, string> => {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (user?.id) h["x-user-id"] = user.id;
    return h;
  }, [user]);

  // API Sync Handlers
  const handleOrderCreated = async (newOrder: Order) => {
    try {
      const res = await fetch("/api/shop", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ action: "CREATE_ORDER", order: newOrder }),
      });
      const data = await res.json();
      if (data.db) {
        setProducts(data.db.products);
        setOrders(data.db.orders);
        return;
      }
    } catch {}
    setOrders((prev) => [newOrder, ...prev]);
  };

  const handleAddProduct = async (newProduct: Product) => {
    try {
      const res = await fetch("/api/shop", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ action: "ADD_PRODUCT", product: newProduct }),
      });
      const data = await res.json();
      if (data.db) {
        setProducts(data.db.products);
        return;
      }
    } catch {}
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleUpdateProduct = async (updated: Product) => {
    try {
      const res = await fetch("/api/shop", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ action: "UPDATE_PRODUCT", product: updated }),
      });
      const data = await res.json();
      if (data.db) {
        setProducts(data.db.products);
        return;
      }
    } catch {}
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const res = await fetch("/api/shop", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ action: "DELETE_PRODUCT", productId }),
      });
      const data = await res.json();
      if (data.db) {
        setProducts(data.db.products);
        return;
      }
    } catch {}
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    status: Order["status"]
  ) => {
    try {
      const res = await fetch("/api/shop", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          action: "UPDATE_ORDER_STATUS",
          orderId,
          status,
        }),
      });
      const data = await res.json();
      if (data.db) {
        setOrders(data.db.orders);
        return;
      }
    } catch {}
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const handleUpdateUserRole = async (
    userId: string,
    role: "admin" | "customer"
  ) => {
    try {
      const res = await fetch("/api/shop", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ action: "UPDATE_USER_ROLE", userId, role }),
      });
      const data = await res.json();
      if (data.db?.users) {
        setUsers(data.db.users);
        return;
      }
    } catch {}
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role } : u))
    );
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await fetch("/api/shop", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ action: "DELETE_USER", userId }),
      });
      const data = await res.json();
      if (data.db?.users) {
        setUsers(data.db.users);
        return;
      }
    } catch {}
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleAddAnnouncement = async (announcement: Announcement) => {
    try {
      const res = await fetch("/api/shop", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ action: "ADD_ANNOUNCEMENT", announcement }),
      });
      const data = await res.json();
      if (data.db?.announcements) {
        setAnnouncements(data.db.announcements);
        setAnnIndex(0);
        return;
      }
    } catch {}
    setAnnouncements((prev) => [announcement, ...prev]);
    setAnnIndex(0);
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    try {
      const res = await fetch("/api/shop", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          action: "DELETE_ANNOUNCEMENT",
          announcementId,
        }),
      });
      const data = await res.json();
      if (data.db?.announcements) {
        setAnnouncements(data.db.announcements);
        setAnnIndex(0);
        return;
      }
    } catch {}
    setAnnouncements((prev) => prev.filter((a) => a.id !== announcementId));
    setAnnIndex(0);
  };

  const handleAddCategory = async (category: CategoryItem) => {
    try {
      const res = await fetch("/api/shop", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ action: "ADD_CATEGORY", category }),
      });
      const data = await res.json();
      if (data.db?.categories) {
        setCategories(data.db.categories);
        return;
      }
    } catch {}
    setCategories((prev) => [...prev, category]);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const res = await fetch("/api/shop", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ action: "DELETE_CATEGORY", categoryId }),
      });
      const data = await res.json();
      if (data.db?.categories) {
        setCategories(data.db.categories);
        if (selectedCategory === categoryId) setSelectedCategory("All");
        return;
      }
    } catch {}
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    if (selectedCategory === categoryId) setSelectedCategory("All");
  };

  const handleUpdateTheme = async (theme: ShopThemeId) => {
    setCurrentTheme(theme);
    try {
      const res = await fetch("/api/shop", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ action: "UPDATE_THEME", theme }),
      });
      const data = await res.json();
      if (data.db?.theme) {
        setCurrentTheme(data.db.theme);
      }
    } catch {}
  };

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (showWishlistOnly && !wishlist.includes(p.id)) return false;
        if (selectedCategory !== "All" && p.category !== selectedCategory)
          return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            p.nameEn.toLowerCase().includes(q) ||
            p.nameMm.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.categoryMm.toLowerCase().includes(q) ||
            p.descriptionMm.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "rating") return b.rating - a.rating;
        return 0;
      });
  }, [
    products,
    selectedCategory,
    searchQuery,
    sortBy,
    showWishlistOnly,
    wishlist,
  ]);

  const wishlistProducts = useMemo(
    () => products.filter((p) => wishlist.includes(p.id)),
    [products, wishlist]
  );

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Dynamic Theme Style Classes for the 3 distinct themes
  const themeStyles = useMemo(() => {
    if (currentTheme === "rose-paris") {
      return {
        pageBg: "bg-[#FFF5F7] text-stone-900",
        topBar: "bg-rose-950 text-pink-100",
        header: "bg-white/95 border-rose-200/80",
        logoBox:
          "rounded-full bg-gradient-to-br from-rose-500 to-pink-700 text-white shadow-rose-200",
        brandSub: "text-rose-600",
        cartBtn: "rounded-full bg-rose-600 hover:bg-rose-700 text-white",
        cartBadge: "bg-white text-rose-700",
        heroSection:
          "bg-gradient-to-br from-rose-900 via-pink-800 to-rose-950 text-white",
        heroPill: "bg-pink-400/20 border-pink-300/40 text-pink-200",
        heroHighlight: "text-pink-200",
        heroCtaPrimary:
          "rounded-full bg-pink-300 hover:bg-pink-200 text-rose-950",
        sliderCard:
          "rounded-[2rem] border-2 border-pink-300/50 bg-rose-950/90 shadow-2xl",
        sliderTag: "bg-pink-300 text-rose-950",
        filterBar:
          "bg-white/95 rounded-3xl sm:rounded-full border-2 border-rose-200 shadow-md shadow-rose-100/50",
        catActive: "rounded-full bg-rose-600 text-white shadow-sm",
        catInactive:
          "rounded-full bg-rose-50 text-rose-900 hover:bg-rose-100 border border-rose-200/60",
        card: "bg-white rounded-[2rem] border-2 border-rose-200/80 shadow-md shadow-rose-100/50 hover:shadow-xl hover:-translate-y-1",
        cardImgWrap:
          "relative h-40 sm:h-60 bg-rose-50 m-2 sm:m-2.5 rounded-t-[2.5rem] rounded-b-2xl overflow-hidden border border-rose-100",
        cardBadge: "rounded-full bg-rose-600 text-white",
        cardCategory: "text-rose-600",
        wholesaleBadge:
          "text-rose-800 bg-rose-50 border-rose-200 rounded-full",
        addBtn:
          "rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-sm",
      };
    }
    if (currentTheme === "minimal-noir") {
      return {
        pageBg: "bg-[#F4F6F8] text-zinc-950",
        topBar: "bg-zinc-950 text-emerald-300 border-b border-emerald-500/30",
        header: "bg-white border-b-2 border-zinc-950",
        logoBox:
          "rounded-none bg-zinc-950 text-emerald-400 border-2 border-emerald-400",
        brandSub: "text-emerald-700",
        cartBtn:
          "rounded-none bg-zinc-950 hover:bg-emerald-600 text-white border border-zinc-950",
        cartBadge: "bg-emerald-400 text-zinc-950 rounded-none",
        heroSection:
          "bg-gradient-to-r from-zinc-950 via-neutral-900 to-emerald-950 text-white border-b-4 border-emerald-500",
        heroPill:
          "rounded-none bg-emerald-400/15 border-emerald-400/50 text-emerald-300",
        heroHighlight: "text-emerald-400",
        heroCtaPrimary:
          "rounded-none bg-emerald-400 hover:bg-emerald-300 text-zinc-950 border-2 border-zinc-950 shadow-[4px_4px_0px_#000]",
        sliderCard:
          "rounded-none border-2 border-emerald-400 bg-zinc-950 shadow-[6px_6px_0px_#10b981]",
        sliderTag: "rounded-none bg-emerald-400 text-zinc-950",
        filterBar:
          "bg-white rounded-none border-2 border-zinc-950 shadow-[4px_4px_0px_#18181b]",
        catActive:
          "rounded-none bg-zinc-950 text-emerald-400 border border-zinc-950",
        catInactive:
          "rounded-none bg-zinc-100 text-zinc-800 hover:bg-zinc-200 border border-zinc-300",
        card: "bg-white rounded-none border-2 border-zinc-950 shadow-[4px_4px_0px_#18181b] hover:shadow-[6px_6px_0px_#10b981] hover:-translate-y-0.5",
        cardImgWrap:
          "relative h-40 sm:h-64 bg-zinc-100 overflow-hidden border-b-2 border-zinc-950",
        cardBadge:
          "rounded-none bg-emerald-400 text-zinc-950 border border-zinc-950",
        cardCategory: "text-emerald-700",
        wholesaleBadge:
          "text-emerald-950 bg-emerald-100 border-zinc-900 rounded-none",
        addBtn:
          "rounded-none bg-zinc-950 hover:bg-emerald-600 text-white uppercase tracking-wider",
      };
    }
    return {
      pageBg: "bg-[#FAF7F2] text-stone-900",
      topBar: "bg-stone-900 text-amber-100",
      header: "bg-white/95 border-stone-200/80",
      logoBox:
        "rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-800 to-stone-900 text-amber-100",
      brandSub: "text-amber-800",
      cartBtn: "rounded-xl bg-stone-900 hover:bg-amber-900 text-white",
      cartBadge: "bg-amber-400 text-stone-950 rounded-full",
      heroSection:
        "bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 text-white",
      heroPill: "bg-amber-400/15 border-amber-300/30 text-amber-300",
      heroHighlight: "text-amber-300",
      heroCtaPrimary: "rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950",
      sliderCard:
        "rounded-3xl border-2 border-amber-300/35 bg-stone-900/90 shadow-2xl",
      sliderTag: "rounded-full bg-amber-400 text-stone-950",
      filterBar:
        "bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-xs",
      catActive: "rounded-xl sm:rounded-2xl bg-stone-900 text-white shadow-sm",
      catInactive:
        "rounded-xl sm:rounded-2xl bg-stone-100 text-stone-700 hover:bg-stone-200",
      card: "bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-xs hover:shadow-xl",
      cardImgWrap: "relative h-40 sm:h-64 bg-stone-100 overflow-hidden",
      cardBadge: "rounded-full bg-stone-900/90 text-amber-300",
      cardCategory: "text-amber-800",
      wholesaleBadge:
        "text-amber-900 bg-amber-50 border-amber-200/80 rounded-md sm:rounded-lg",
      addBtn:
        "rounded-xl sm:rounded-2xl bg-stone-900 hover:bg-amber-900 text-white",
    };
  }, [currentTheme]);

  return (
    <div
      className={`min-h-screen ${themeStyles.pageBg} flex flex-col pb-16 md:pb-0 transition-colors duration-300`}
    >
      {/* Top Announcement Bar */}
      <div className={`${themeStyles.topBar} text-[11px] sm:text-xs py-2 px-3 sm:px-4`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 font-medium leading-snug">
            {lang === "en" ? (
              <span>
                <strong>Pont Pont Bag Shop (Mandalay):</strong> Retail & Wholesale Orders Available! Use code{" "}
                <code className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                  PONTPONT10
                </code>{" "}
                for 10% OFF.
              </span>
            ) : (
              <span>
                <strong>ပုံ့ပုံ့ (Pont Pont) အိတ်ဆိုင် - မန္တလေး:</strong> လက်လီ/လက်ကား စိတ်ကြိုက်မှာယူနိုင်ပါပြီ! ကူပွန်ကုဒ်{" "}
                <code className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                  PONTPONT10
                </code>{" "}
                ဖြင့် 10% လျှော့ဈေးရယူပါ။
              </span>
            )}
          </p>
          <div className="hidden md:flex items-center gap-4 text-[11px] text-stone-300">
            <span>
              {lang === "en" ? "Phone:" : "ဖုန်း:"} 09-963000502, 09-750072752, 09-404448881
            </span>
            <span>{lang === "en" ? "Open Daily 8:00 AM - 8:00 PM" : "နေ့စဉ် 8:00 AM - 8:00 PM"}</span>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-md border-b shadow-xs ${themeStyles.header}`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo */}
          <button
            onClick={() => {
              setViewMode("shop");
              setSelectedCategory("All");
              setShowWishlistOnly(false);
            }}
            className="flex items-center gap-2 sm:gap-3 text-left group min-w-0"
          >
            <div
              className={`w-9 h-9 sm:w-11 sm:h-11 ${themeStyles.logoBox} flex items-center justify-center font-serif font-extrabold text-base sm:text-xl shadow-md shrink-0`}
            >
              P
            </div>
            <div className="min-w-0">
              <span className="block text-base sm:text-2xl font-extrabold tracking-tight text-stone-900 truncate">
                Pont Pont{" "}
                <span className={`${themeStyles.brandSub} font-bold text-xs sm:text-lg`}>
                  {lang === "en" ? "Bag Shop" : "(ပုံ့ပုံ့)"}
                </span>
              </span>
              <span className="block text-[10px] sm:text-[11px] font-semibold text-stone-600 truncate">
                {lang === "en"
                  ? "Retail & Wholesale Handbags (Mandalay)"
                  : "အိတ်အမျိုးမျိုး လက်လီ/လက်ကား (မန္တလေး)"}
              </span>
            </div>
          </button>

          {/* Search Bar (Desktop) */}
          {viewMode === "shop" && (
            <div className="hidden lg:flex flex-1 max-w-md relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-4 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  lang === "en"
                    ? "Search bags by name or category (e.g. Tote, Sling, Wallet)..."
                    : "အိတ်အမည် သို့မဟုတ် အမျိုးအစား ရှာဖွေရန် (ဥပမာ - ဘေးလွယ်အိတ်၊ ပိုက်ဆံအိတ်)..."
                }
                className="w-full pl-11 pr-4 py-2.5 text-xs rounded-full border border-stone-300 bg-stone-50 focus:bg-white focus:border-amber-800 focus:outline-none text-stone-900 transition"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Language Switcher (MM | EN) */}
            <button
              type="button"
              onClick={handleToggleLang}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-extrabold border border-stone-300 bg-stone-100 hover:bg-stone-200 text-stone-900 transition"
              title="Switch Language (Myanmar / English)"
            >
              <Globe className="w-3.5 h-3.5 text-amber-800" />
              <span>{lang === "en" ? "EN" : "MM"}</span>
            </button>

            {/* Branches Link */}
            {viewMode === "shop" && (
              <a
                href="#branches"
                className="hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 border border-stone-200 transition"
              >
                <Store className="w-4 h-4 text-amber-800" />
                <span>{lang === "en" ? "Branches" : "ဆိုင်ခွဲလိပ်စာများ"}</span>
              </a>
            )}

            {/* Admin Dashboard Toggle — ONLY visible to Admin users */}
            {user?.role === "admin" && (
              <button
                onClick={() =>
                  setViewMode((v) => (v === "admin" ? "shop" : "admin"))
                }
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                  viewMode === "admin"
                    ? "bg-amber-900 text-white border-amber-900"
                    : "bg-amber-50/90 text-amber-950 border-amber-200 hover:bg-amber-100"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {viewMode === "admin"
                    ? lang === "en"
                      ? "Storefront"
                      : "ဆိုင်သို့ပြန်ရန်"
                    : lang === "en"
                    ? "Admin"
                    : "Admin စနစ်"}
                </span>
              </button>
            )}

            {/* User Login / Profile Page Button */}
            <button
              onClick={() => {
                if (user) {
                  setViewMode((v) => (v === "profile" ? "shop" : "profile"));
                } else {
                  setIsAuthOpen(true);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                viewMode === "profile"
                  ? "bg-stone-900 text-white border-stone-900"
                  : "text-stone-700 hover:bg-stone-100 border-stone-200"
              }`}
            >
              <User className="w-4 h-4" />
              <span className="hidden md:inline max-w-[110px] truncate">
                {user
                  ? user.name
                  : lang === "en"
                  ? "Sign In"
                  : "အကောင့်ဝင်ရန်"}
              </span>
            </button>

            {/* Wishlist Toggle */}
            <button
              onClick={() => {
                setViewMode("shop");
                setShowWishlistOnly((w) => !w);
              }}
              className={`relative p-2.5 rounded-xl border transition ${
                showWishlistOnly
                  ? "bg-rose-50 border-rose-300 text-rose-600"
                  : "border-stone-200 text-stone-700 hover:bg-stone-100"
              }`}
              title="Wishlist"
            >
              <Heart
                className={`w-4 h-4 ${
                  showWishlistOnly ? "fill-rose-500 text-rose-500" : ""
                }`}
              />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs font-bold transition shadow-sm ${themeStyles.cartBtn}`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">
                {lang === "en" ? "Bag" : "ဈေးခြင်း"}
              </span>
              <span
                className={`px-1.5 py-0.5 text-[11px] font-extrabold ${themeStyles.cartBadge}`}
              >
                {totalCartItems}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {viewMode === "shop" && (
          <div className="lg:hidden px-4 pb-3">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  lang === "en"
                    ? "Search bags by name or category..."
                    : "အိတ်အမည် သို့မဟုတ် အမျိုးအစား ရှာဖွေရန်..."
                }
                className="w-full pl-10 pr-4 py-2 text-xs rounded-full border border-stone-300 bg-stone-50 text-stone-900 focus:outline-none focus:border-amber-800"
              />
            </div>
          </div>
        )}
      </header>

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-stone-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-amber-500/40 flex items-center gap-2.5 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Content */}
      {viewMode === "admin" && user?.role === "admin" ? (
        <main className="flex-1">
          <AdminDashboard
            currentUser={user}
            users={users}
            products={products}
            orders={orders}
            announcements={announcements}
            categories={categories}
            currentTheme={currentTheme}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdateUserRole={handleUpdateUserRole}
            onDeleteUser={handleDeleteUser}
            onAddAnnouncement={handleAddAnnouncement}
            onDeleteAnnouncement={handleDeleteAnnouncement}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onUpdateTheme={handleUpdateTheme}
            onBackToShop={() => setViewMode("shop")}
            lang={lang}
            onToggleLang={handleToggleLang}
          />
        </main>
      ) : viewMode === "profile" && user ? (
        <main className="flex-1">
          <UserProfilePage
            user={user}
            orders={orders}
            wishlistProducts={wishlistProducts}
            onUpdateUser={handleUpdateUserProfile}
            onLogout={handleLogout}
            onBackToShop={() => setViewMode("shop")}
            onOpenAdmin={
              user.role === "admin" ? () => setViewMode("admin") : undefined
            }
            onAddToCart={(p) => handleAddToCart(p)}
            lang={lang}
          />
        </main>
      ) : (
        <main className="flex-1">
          {/* Compact Hero Section with Style (A) Announcement Slider Card */}
          <section
            className={`relative overflow-hidden ${themeStyles.heroSection}`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Side: Compact Shop Info */}
              <div className="lg:col-span-7 space-y-3.5">
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold ${themeStyles.heroPill}`}
                >
                  {lang === "en"
                    ? "Mandalay's Leading Retail & Wholesale Handbag Boutique"
                    : "မန္တလေးမြို့၏ နာမည်ကြီး လက်လီ/လက်ကား အိတ်အရောင်းဆိုင်ကြီး"}
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-snug">
                  <span className={themeStyles.heroHighlight}>
                    {lang === "en" ? "Pont Pont" : "ပုံ့ပုံ့ (Pont Pont)"}
                  </span>{" "}
                  {lang === "en"
                    ? "Handbags & Accessories"
                    : "အိတ်အမျိုးမျိုး ရောင်းဝယ်ရေး"}
                </h1>

                <p className="text-xs sm:text-sm text-stone-300 max-w-xl leading-relaxed">
                  {lang === "en" ? (
                    <>
                      Discover quality women&apos;s and men&apos;s handbags, tote bags, sling bags, wallets, and backpacks across our 3 Mandalay branches and online for both{" "}
                      <strong>Retail & Wholesale</strong>.
                    </>
                  ) : (
                    <>
                      အရည်အသွေးကောင်းမွန်သော အမျိုးသမီးနှင့် အမျိုးသား လက်ကိုင်အိတ်၊ လက်ဆွဲအိတ်၊ ဘေးလွယ်အိတ်၊ ပိုက်ဆံအိတ်နှင့် ကျောပိုးအိတ် အမျိုးမျိုးကို မန္တလေးမြို့ ဆိုင်ခွဲ (၃) ခုနှင့် အွန်လိုင်းမှတစ်ဆင့် <strong>လက်လီ / လက်ကား</strong> ဝယ်ယူရရှိနိုင်ပါပြီ။
                    </>
                  )}
                </p>

                {/* Quick Branch Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-stone-200">
                  <div className="p-2 rounded-xl bg-white/10 border border-white/10">
                    <span className="font-bold text-amber-300 block">
                      {lang === "en" ? "Branch (1) Main" : "ဆိုင်ခွဲ (၁) ပင်မဆိုင်"}
                    </span>
                    <span>
                      {lang === "en"
                        ? "73rd St, Bet 36th & 37th St, Mandalay"
                        : "၇၃ လမ်း၊ ၃၆×၃၇ လမ်းကြား၊ မန္တလေး"}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/10 border border-white/10">
                    <span className="font-bold text-amber-300 block">
                      {lang === "en" ? "Branch (2)" : "ဆိုင်ခွဲ (၂)"}
                    </span>
                    <span>
                      {lang === "en"
                        ? "65th St, Bet 107th & 108th St, Mandalay"
                        : "၆၅ လမ်း၊ ၁၀၇×၁၀၈ လမ်းကြား၊ မန္တလေး"}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/10 border border-white/10">
                    <span className="font-bold text-amber-300 block">
                      {lang === "en" ? "Branch (3) Thakhun Taing" : "ဆိုင်ခွဲ (၃) တံခွန်တိုင်"}
                    </span>
                    <span>
                      {lang === "en"
                        ? "78th St, Near Thakhun Taing Market"
                        : "၇၈ လမ်း၊ တံခွန်တိုင်ဈေးအနီး၊ မန္တလေး"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
                  <a
                    href="#catalog"
                    className={`w-full sm:w-auto text-center px-5 py-2.5 font-extrabold text-xs sm:text-sm transition shadow-md ${themeStyles.heroCtaPrimary}`}
                  >
                    {lang === "en"
                      ? "Shop Handbags Now"
                      : "အိတ်ဒီဇိုင်းများ ကြည့်ရှုရန် (Shop Now)"}
                  </a>
                  <a
                    href="#branches"
                    className="w-full sm:w-auto text-center px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/15 transition"
                  >
                    {lang === "en"
                      ? "Branches & Contact"
                      : "ဆိုင်ခွဲလိပ်စာနှင့် ဖုန်းနံပါတ်များ"}
                  </a>
                </div>
              </div>

              {/* Right Side: Style (A) Image + Text Announcement Slider Card */}
              <div className="lg:col-span-5">
                {announcements.length > 0 ? (
                  (() => {
                    const currentAnn =
                      announcements[annIndex % announcements.length] ||
                      announcements[0];
                    return (
                      <div
                        className={`relative overflow-hidden flex flex-col justify-between h-64 sm:h-72 group ${themeStyles.sliderCard}`}
                      >
                        {/* Background Image or Luxury Gradient */}
                        {currentAnn.image ? (
                          <img
                            src={currentAnn.image}
                            alt={currentAnn.title}
                            className="absolute inset-0 w-full h-full object-cover opacity-55 group-hover:scale-105 transition duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-stone-900 to-stone-950" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30" />

                        {/* Slider Top Bar */}
                        <div className="relative z-10 px-5 pt-4 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider shadow ${themeStyles.sliderTag}`}
                            >
                              <Megaphone className="w-3 h-3" />
                              {currentAnn.tag}
                            </span>
                            <span className="text-[11px] text-stone-300 font-medium">
                              {new Date(
                                currentAnn.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>

                          {announcements.length > 1 && (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  setAnnIndex(
                                    (prev) =>
                                      (prev - 1 + announcements.length) %
                                      announcements.length
                                  )
                                }
                                className="p-1.5 rounded-full bg-black/50 hover:bg-amber-400 hover:text-stone-950 text-white border border-white/15 transition"
                                title="Previous Announcement"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-[11px] font-bold text-amber-200 px-1">
                                {(annIndex % announcements.length) + 1} /{" "}
                                {announcements.length}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setAnnIndex(
                                    (prev) => (prev + 1) % announcements.length
                                  )
                                }
                                className="p-1.5 rounded-full bg-black/50 hover:bg-amber-400 hover:text-stone-950 text-white border border-white/15 transition"
                                title="Next Announcement"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Slider Content Bottom */}
                        <div
                          onClick={() => setActiveAnnouncement(currentAnn)}
                          className="relative z-10 p-5 cursor-pointer space-y-1.5"
                        >
                          <h3 className="text-base sm:text-lg font-extrabold text-white leading-snug line-clamp-2 group-hover:text-amber-300 transition">
                            {currentAnn.title}
                          </h3>
                          <p className="text-xs text-stone-200 line-clamp-2 leading-relaxed">
                            {currentAnn.content}
                          </p>
                          <div className="pt-1 flex items-center justify-between">
                            <span className="text-[11px] font-bold text-amber-300 underline">
                              အပြည့်အစုံဖတ်ရန် (Read More) →
                            </span>
                            {/* Dots indicator */}
                            {announcements.length > 1 && (
                              <div className="flex items-center gap-1.5">
                                {announcements.map((a, i) => (
                                  <button
                                    key={a.id}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setAnnIndex(i);
                                    }}
                                    className={`h-1.5 rounded-full transition-all ${
                                      i === annIndex % announcements.length
                                        ? "w-5 bg-amber-400"
                                        : "w-1.5 bg-white/40 hover:bg-white/70"
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="rounded-3xl border border-white/15 bg-white/5 p-6 text-center h-60 flex flex-col items-center justify-center">
                    <Megaphone className="w-8 h-8 text-amber-300 mb-2" />
                    <p className="text-sm font-bold text-white">
                      ပုံ့ပုံ့ (Pont Pont) အိတ်ဆိုင်မှ ကြိုဆိုပါသည်
                    </p>
                    <p className="text-xs text-stone-400 mt-1">
                      လက်ရှိတွင် အသိပေးကြေညာချက်အသစ် မရှိသေးပါ။
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Catalog & Category Filtering Section */}
          <section
            id="catalog"
            className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-5 sm:space-y-8"
          >
            {/* Category Filter Pills & Sort Controls */}
            <div
              className={`flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 ${themeStyles.filterBar}`}
            >
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5 lg:pb-0">
                {categories.map((cat) => {
                  const active =
                    selectedCategory === cat.id && !showWishlistOnly;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setShowWishlistOnly(false);
                        setSelectedCategory(cat.id);
                      }}
                      className={`px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold whitespace-nowrap transition ${
                        active
                          ? themeStyles.catActive
                          : themeStyles.catInactive
                      }`}
                    >
                      {cat.labelEn}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full lg:w-auto border-t sm:border-t-0 border-stone-100 pt-2 sm:pt-0">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 shrink-0">
                  <SlidersHorizontal className="w-4 h-4 text-amber-800" />
                  <span>{lang === "en" ? "Sort by:" : "စီစဉ်ရန်:"}</span>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 sm:flex-initial px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-xs font-bold text-stone-800 focus:outline-none focus:border-amber-800"
                >
                  <option value="featured">
                    {lang === "en" ? "Featured" : "Featured (အထူးရွေးချယ်ထားသော)"}
                  </option>
                  <option value="price-asc">
                    {lang === "en"
                      ? "Price: Low to High"
                      : "ဈေးနှုန်း: အနည်းမှ အများ (Low to High)"}
                  </option>
                  <option value="price-desc">
                    {lang === "en"
                      ? "Price: High to Low"
                      : "ဈေးနှုန်း: အများမှ အနည်း (High to Low)"}
                  </option>
                  <option value="rating">
                    {lang === "en" ? "Top Rated" : "Rating အမြင့်ဆုံး (Top Rated)"}
                  </option>
                </select>
              </div>
            </div>

            {showWishlistOnly && (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold">
                <span>
                  သိမ်းဆည်းထားသော အိတ်များ (My Wishlist - {filteredProducts.length})
                </span>
                <button
                  onClick={() => setShowWishlistOnly(false)}
                  className="underline font-bold"
                >
                  အိတ်အားလုံး ပြန်ကြည့်မည်
                </button>
              </div>
            )}

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
                <ShoppingBag className="w-12 h-12 text-stone-400 mx-auto" />
                <h3 className="text-lg font-bold text-stone-800">
                  ရှာဖွေထားသော အိတ်အမျိုးအစား မတွေ့ရှိပါ
                </h3>
                <p className="text-xs text-stone-500">
                  အခြား စကားလုံး သို့မဟုတ် Category တစ်ခုကို ပြောင်းလဲရွေးချယ်ကြည့်ပါ။
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSearchQuery("");
                    setShowWishlistOnly(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold"
                >
                  အိတ်အားလုံး ပြန်ကြည့်ရန်
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {filteredProducts.map((product) => {
                  const chosenColor =
                    selectedColorsMap[product.id] ||
                    product.colors[0]?.name ||
                    "Default";
                  const wishlisted = wishlist.includes(product.id);

                  return (
                    <div
                      key={product.id}
                      className={`group overflow-hidden transition-all duration-300 flex flex-col justify-between ${themeStyles.card}`}
                    >
                      <div>
                        {/* Image Container */}
                        <div className={themeStyles.cardImgWrap}>
                          <img
                            src={product.image}
                            alt={product.nameEn}
                            onClick={() => setActiveProduct(product)}
                            className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition duration-500"
                          />

                          {product.badge && (
                            <span
                              className={`absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5 px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-xs ${themeStyles.cardBadge}`}
                            >
                              {product.badge}
                            </span>
                          )}

                          <div className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 flex flex-col gap-1.5 sm:gap-2">
                            <button
                              onClick={() => handleToggleWishlist(product.id)}
                              className="p-1.5 sm:p-2 rounded-full bg-white/90 hover:bg-white text-stone-700 shadow-md transition"
                              title="Wishlist"
                            >
                              <Heart
                                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                                  wishlisted
                                    ? "fill-rose-500 text-rose-500"
                                    : ""
                                }`}
                              />
                            </button>
                            <button
                              onClick={() => setActiveProduct(product)}
                              className="p-1.5 sm:p-2 rounded-full bg-white/90 hover:bg-white text-stone-700 shadow-md transition"
                              title="Quick View"
                            >
                              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Card Details */}
                        <div className="p-3 sm:p-5">
                          <div
                            className={`flex items-center justify-between text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${themeStyles.cardCategory}`}
                          >
                            <span className="truncate">{product.category}</span>
                          </div>

                          <h3
                            onClick={() => setActiveProduct(product)}
                            className="font-bold text-stone-900 text-xs sm:text-sm mt-1 line-clamp-2 sm:line-clamp-1 cursor-pointer hover:opacity-80 min-h-[2rem] sm:min-h-0"
                          >
                            {product.nameEn}
                          </h3>

                          {/* Price */}
                          <div className="mt-2 sm:mt-3 space-y-1">
                            <div className="flex flex-wrap items-baseline gap-1 sm:gap-2">
                              <span className="text-sm sm:text-lg font-extrabold text-stone-900">
                                {product.price.toLocaleString()} MMK
                              </span>
                              {product.originalPrice && (
                                <span className="text-[10px] sm:text-xs text-stone-400 line-through">
                                  {product.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                            {product.wholesalePrice && (
                              <p
                                className={`text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 border w-fit truncate max-w-full ${themeStyles.wholesaleBadge}`}
                              >
                                {lang === "en" ? "Wholesale:" : "လက်ကား:"}{" "}
                                {product.wholesalePrice.toLocaleString()} MMK
                              </p>
                            )}
                          </div>

                          {/* Color Swatches */}
                          <div className="mt-2.5 sm:mt-3 flex items-center gap-1 sm:gap-1.5">
                            {product.colors.map((c) => (
                              <button
                                key={c.name}
                                type="button"
                                onClick={() =>
                                  setSelectedColorsMap((prev) => ({
                                    ...prev,
                                    [product.id]: c.name,
                                  }))
                                }
                                title={c.name}
                                className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border transition shrink-0 ${
                                  chosenColor === c.name
                                    ? "ring-2 ring-stone-900 ring-offset-1 scale-110"
                                    : "border-stone-300 opacity-80 hover:opacity-100"
                                }`}
                                style={{ backgroundColor: c.hex }}
                              />
                            ))}
                            <span className="hidden sm:inline text-[11px] text-stone-500 ml-1 truncate">
                              {chosenColor}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="px-3 pb-3 sm:px-5 sm:pb-5 pt-1">
                        <button
                          type="button"
                          disabled={product.stock <= 0}
                          onClick={() => handleAddToCart(product, chosenColor, 1)}
                          className={`w-full py-2 sm:py-2.5 px-2.5 sm:px-4 disabled:bg-stone-300 text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition shadow-sm ${themeStyles.addBtn}`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                          <span className="sm:hidden">
                            {product.stock > 0 ? "Add to Bag" : "Sold Out"}
                          </span>
                          <span className="hidden sm:inline">
                            {product.stock > 0
                              ? lang === "en"
                                ? "Add to Bag"
                                : "ခြင်းတောင်းထဲထည့်မည် (Add to Bag)"
                              : lang === "en"
                              ? "Sold Out"
                              : "ပစ္စည်းပြတ်နေပါသည် (Sold Out)"}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Pont Pont Mandalay Branches & Store Info Section */}
          <section
            id="branches"
            className="bg-white border-t border-stone-200 py-12 mt-8"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="text-center max-w-2xl mx-auto">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
                  Mandalay Retail & Wholesale Branches
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
                  ပုံ့ပုံ့ (Pont Pont) အိတ်ဆိုင် — မန္တလေး ဆိုင်ခွဲလိပ်စာများ
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-2">
                  ဆိုင်သို့ လူကိုယ်တိုင် လာရောက်ကြည့်ရှုဝယ်ယူနိုင်သလို အွန်လိုင်းနှင့် ဖုန်း/Viber မှတစ်ဆင့် မြန်မာနိုင်ငံအနှံ့ လက်လီ/လက်ကား မှာယူနိုင်ပါသည်။
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SHOP_INFO.branches.map((branch, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-3xl bg-[#FAF7F2] border border-stone-200/90 space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-900 text-amber-100 flex items-center justify-center font-bold text-sm shrink-0">
                        {idx + 1}
                      </div>
                      <h3 className="font-extrabold text-stone-900 text-base">
                        {branch.name}
                      </h3>
                    </div>
                    <p className="text-sm font-semibold text-stone-800 leading-relaxed">
                      {branch.addressMm}
                    </p>
                    <p className="text-xs text-stone-500">{branch.addressEn}</p>
                    <div className="pt-2 border-t border-stone-200/70 flex items-center justify-between text-xs text-amber-900 font-semibold">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> 8:00 AM - 8:00 PM
                      </span>
                      <span>လက်လီ / လက်ကား</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="p-5 rounded-3xl bg-stone-50 border border-stone-200/80 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-amber-900 text-amber-100 flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">
                      KPay / WavePay & COD စနစ်
                    </h4>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      KBZPay၊ WavePay (09-963000502) ဖြင့် ငွေပေးချေနိုင်သလို မန္တလေးမြို့တွင်း အိမ်အရောက်ငွေချေနှင့် နယ်ဝေး ကားဂိတ်တင် စနစ်များ ရှိပါသည်။
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-stone-50 border border-stone-200/80 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-amber-900 text-amber-100 flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">
                      လက်လီ / လက်ကား အမြန်ပို့ဆောင်မှု
                    </h4>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      နယ်ပြန်ရောင်းလိုသူများအတွက် လက်ကားဈေးနှုန်း သက်သာစွာဖြင့် မြန်မာနိုင်ငံအနှံ့ အမြန်ချောနှင့် ကားဂိတ်များသို့ နေ့ချင်းပို့ဆောင်ပေးပါသည်။
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-stone-50 border border-stone-200/80 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-amber-900 text-amber-100 flex items-center justify-center shrink-0">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">
                      တိုက်ရိုက် ဆက်သွယ်မှာယူရန်
                    </h4>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      ဖုန်း - 09-963000502, 09-750072752, 09-404448881 သို့မဟုတ် Viber မှတစ်ဆင့်လည်း တိုက်ရိုက် ဆက်သွယ်မေးမြန်းနိုင်ပါသည်။
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-300 py-12 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-extrabold text-base">
                P
              </div>
              <div>
                <span className="text-lg font-extrabold text-white block">
                  Pont Pont Bag Shop (ပုံ့ပုံ့)
                </span>
                <span className="text-[11px] text-amber-400">
                  အိတ်အမျိုးမျိုး လက်လီ/လက်ကား ရောင်းဝယ်ရေး (မန္တလေး)
                </span>
              </div>
            </div>
            <p className="text-stone-400 leading-relaxed">
              အရည်အသွေးကောင်းမွန်သော အမျိုးသမီးနှင့် အမျိုးသား လက်ကိုင်အိတ်၊ လက်ဆွဲအိတ်၊ ဘေးလွယ်အိတ်၊ ပိုက်ဆံအိတ်နှင့် ကျောပိုးအိတ်မျိုးစုံ လက်လီ/လက်ကား ရောင်းဝယ်ရေး။
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white mb-2">
              ဆက်သွယ်ရန် (Contact & Branches)
            </h4>
            <p className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-amber-400 shrink-0" />
              <span>09-963000502, 09-750072752, 09-404448881</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{SHOP_INFO.email}</span>
            </p>
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                ပင်မဆိုင်: ၇၃ လမ်း၊ ၃၆×၃၇ လမ်းကြား၊ မန္တလေးမြို့ (ဆိုင်ခွဲ ၂: ၆၅ လမ်း၊ ၁၀၇×၁၀၈ ကြား / ဆိုင်ခွဲ ၃: ၇၈ လမ်း၊ တံခွန်တိုင်ဈေးအနီး)
              </span>
            </p>
            <p className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{SHOP_INFO.hours}</span>
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white mb-2">
              အမြန်လင့်ခ်များ (Quick Links)
            </h4>
            <div className="flex flex-col gap-1.5 items-start">
              <button
                onClick={() => setViewMode("shop")}
                className="hover:text-amber-300"
              >
                • အိတ်ဒီဇိုင်းများ ကြည့်ရန် (Product Catalog)
              </button>
              <button
                onClick={() => {
                  if (user) {
                    setViewMode("profile");
                  } else {
                    setIsAuthOpen(true);
                  }
                }}
                className="hover:text-amber-300"
              >
                • {user ? "ကိုယ်ရေးအချက်အလက်နှင့် အော်ဒါမှတ်တမ်း (My Profile)" : "အကောင့်ဝင်ရန် / အကောင့်ဖွင့်ရန် (Login / Sign Up)"}
              </button>
              {user?.role === "admin" && (
                <button
                  onClick={() => setViewMode("admin")}
                  className="hover:text-amber-300 font-semibold text-amber-400"
                >
                  • ဆိုင်စီမံခန့်ခွဲမှုစနစ် (Admin Dashboard)
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-stone-800 text-center text-[11px] text-stone-500">
          © 2026 Pont Pont Bag Shop (ပုံ့ပုံ့ အိတ်အမျိုးမျိုး ရောင်းဝယ်ရေး - မန္တလေး). All rights reserved.
        </div>
      </footer>

      {/* Sticky Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => {
            setViewMode("shop");
            setShowWishlistOnly(false);
          }}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-[10px] font-bold transition ${
            viewMode === "shop" && !showWishlistOnly
              ? "text-amber-900"
              : "text-stone-500"
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Shop</span>
        </button>

        <button
          onClick={() => {
            setViewMode("shop");
            setShowWishlistOnly((w) => !w);
          }}
          className={`relative flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-[10px] font-bold transition ${
            showWishlistOnly ? "text-rose-600" : "text-stone-500"
          }`}
        >
          <Heart
            className={`w-4 h-4 ${
              showWishlistOnly ? "fill-rose-500 text-rose-500" : ""
            }`}
          />
          <span>Wishlist</span>
          {wishlist.length > 0 && (
            <span className="absolute top-0 right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center">
              {wishlist.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-[10px] font-bold text-stone-700"
        >
          <ShoppingBag className="w-4 h-4 text-amber-800" />
          <span>Bag ({totalCartItems})</span>
        </button>

        <button
          onClick={() => {
            if (user) {
              setViewMode("profile");
            } else {
              setIsAuthOpen(true);
            }
          }}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-[10px] font-bold transition ${
            viewMode === "profile" ? "text-amber-900" : "text-stone-500"
          }`}
        >
          <User className="w-4 h-4" />
          <span className="max-w-[60px] truncate">
            {user ? user.name.split(" ")[0] : "Login"}
          </span>
        </button>

        {user?.role === "admin" && (
          <button
            onClick={() =>
              setViewMode((v) => (v === "admin" ? "shop" : "admin"))
            }
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-[10px] font-bold transition ${
              viewMode === "admin" ? "text-amber-900" : "text-stone-500"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin</span>
          </button>
        )}
      </nav>

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={activeProduct}
        onClose={() => setActiveProduct(null)}
        onAddToCart={handleAddToCart}
        isWishlisted={
          activeProduct ? wishlist.includes(activeProduct.id) : false
        }
        onToggleWishlist={handleToggleWishlist}
        lang={lang}
      />

      <CartCheckoutDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCart([])}
        user={user}
        onOrderCreated={handleOrderCreated}
        lang={lang}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        usersCount={usersCount}
        onAuthSuccess={handleAuthSuccess}
        lang={lang}
      />

      <OrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        orders={orders}
        user={user}
      />

      {/* Full Announcement Detail Modal */}
      {activeAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden">
            <button
              onClick={() => setActiveAnnouncement(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black transition"
            >
              <X className="w-4 h-4" />
            </button>
            {activeAnnouncement.image && (
              <img
                src={activeAnnouncement.image}
                alt={activeAnnouncement.title}
                className="w-full h-56 object-cover bg-stone-100"
              />
            )}
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold uppercase">
                  {activeAnnouncement.tag}
                </span>
                <span className="text-xs text-stone-500">
                  {new Date(activeAnnouncement.createdAt).toLocaleString()}
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-stone-900 leading-snug">
                {activeAnnouncement.title}
              </h3>
              <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                {activeAnnouncement.content}
              </p>
              <div className="pt-3 border-t border-stone-200 flex justify-end">
                <button
                  onClick={() => setActiveAnnouncement(null)}
                  className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-amber-900 transition"
                >
                  ပိတ်မည် (Close)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
