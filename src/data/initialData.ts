export type ShopThemeId = "luxury-gold" | "rose-paris" | "minimal-noir";

export interface ShopThemeOption {
  id: ShopThemeId;
  nameEn: string;
  nameMm: string;
  descriptionMm: string;
  descriptionEn: string;
  styleSummary: string;
  previewBg: string;
  previewHero: string;
  previewAccent: string;
}

export const SHOP_THEMES: ShopThemeOption[] = [
  {
    id: "luxury-gold",
    nameEn: "1. Classic Luxury Gold",
    nameMm: "ရွှေအိုရောင် ဇိမ်ခံဒီဇိုင်း (Classic Boutique)",
    descriptionMm:
      "နွေးထွေးသော ရွှေအိုရောင်နှင့် အညိုရင့်ရောင် ပေါင်းစပ်ထားပြီး ထောင့်ဝိုင်းကတ်ဒီဇိုင်းများဖြင့် တည်ငြိမ်အထက်တန်းကျသော ပုံစံ။",
    descriptionEn:
      "Warm ivory and espresso gold palette with soft rounded boutique cards for timeless elegance.",
    styleSummary: "Rounded Cards • Warm Ivory & Espresso Gold",
    previewBg: "#FAF7F2",
    previewHero: "linear-gradient(135deg, #1c1917, #451a03)",
    previewAccent: "#fbbf24",
  },
  {
    id: "rose-paris",
    nameEn: "2. Parisian Rose & Pastel",
    nameMm: "ပန်းနုရောင် ဖက်ရှင်ဒီဇိုင်း (Soft Feminine)",
    descriptionMm:
      "နူးညံ့လှပသော ပန်းနုရောင်၊ Rose-Gold နှင့် ကွေးညွတ်သော Arch ပုံစံ အိတ်ဓာတ်ပုံဘောင်များဖြင့် မိန်းကလေးအကြိုက် ချစ်စရာ ဖက်ရှင်ဆိုင်ပုံစံ။",
    descriptionEn:
      "Soft blush pink and rose-berry palette with feminine arch-framed product cards and pill buttons.",
    styleSummary: "Arch Frame Cards • Blush Pink & Rose Berry",
    previewBg: "#FFF5F7",
    previewHero: "linear-gradient(135deg, #881337, #be185d, #4c0519)",
    previewAccent: "#f43f5e",
  },
  {
    id: "minimal-noir",
    nameEn: "3. Modern Editorial Noir & Emerald",
    nameMm: "ခေတ်မီ အနက်နှင့် မြစိမ်းရောင် ဒီဇိုင်း (Sharp Editorial)",
    descriptionMm:
      "ထောင့်ချိုးပြတ်သားသော ဘောင်အထူ (Bold 2px Border + Hard Shadow) ကတ်ဒီဇိုင်း၊ အနက်ရောင်နှင့် မြစိမ်းရောင် ပေါင်းစပ်ထားသော ခေတ်မီ Magazine စတိုင်။",
    descriptionEn:
      "High-contrast jet black and emerald palette with sharp 2px brutalist borders and offset shadows.",
    styleSummary: "Sharp Brutalist Cards • Jet Black & Emerald",
    previewBg: "#F4F6F8",
    previewHero: "linear-gradient(135deg, #09090b, #064e3b)",
    previewAccent: "#10b981",
  },
];

export interface CategoryItem {
  id: string;
  labelEn: string;
}

export interface Product {
  id: string;
  nameEn: string;
  nameMm: string;
  category: string;
  categoryMm: string;
  price: number; // Retail price in MMK
  originalPrice?: number;
  wholesalePrice?: number; // လက်ကားဈေး (Wholesale price for 5+ pcs)
  image: string;
  colors: { name: string; hex: string }[];
  badge?: "Best Seller" | "New Arrival" | "Wholesale Hot" | "Sale";
  rating: number;
  reviewsCount: number;
  stock: number;
  material: string;
  dimensions: string;
  descriptionEn: string;
  descriptionMm: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  note?: string;
  paymentMethod: "KPay" | "WavePay" | "COD";
  transactionRef?: string;
  items: {
    productId: string;
    nameEn: string;
    nameMm: string;
    price: number;
    quantity: number;
    selectedColor: string;
    image: string;
  }[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: string;
  userEmail?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  city: string;
  address: string;
  role: "admin" | "customer";
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  tag: "Promotion" | "New Arrival" | "Notice" | "Wholesale";
  image?: string;
  createdAt: string;
  authorName?: string;
}

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-01",
    title: "ပုံ့ပုံ့ အိတ်ဆိုင် အထူး Promotion — 10% OFF ကူပွန်!",
    content:
      "အွန်လိုင်းမှ ဝယ်ယူအားပေးသူများအတွက် PONTPONT10 ကူပွန်ကုဒ်ကို အသုံးပြုပြီး အိတ်တိုင်းအတွက် 10% လျှော့ဈေး ရယူနိုင်ပါပြီ။ ၁ သိန်းကျပ်အထက် ဝယ်ယူပါက ပို့ဆောင်ခ အခမဲ့ (Free Delivery) ဖြစ်ပါသည်။",
    tag: "Promotion",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80",
    createdAt: "2026-11-16T08:00:00Z",
    authorName: "မပုံ့ (Admin)",
  },
  {
    id: "ann-02",
    title: "ဒီတစ်ပတ် အသစ်ဝင်ထားသော ဒီဇိုင်းဆန်း လက်ကိုင်အိတ်များ ရောက်ရှိပါပြီ!",
    content:
      "မန္တလေး ဆိုင်ခွဲ (၁)၊ (၂)၊ (၃) အားလုံးတွင် 2026 ဒီဇိုင်းသစ် Tote Bags, Sling Bags နှင့် Wallets အသစ်များ ရောက်ရှိနေပါပြီ။ လက်လီရော လက်ကားပါ စိတ်ကြိုက်ရွေးချယ် မှာယူနိုင်ပါသည်။",
    tag: "New Arrival",
    image:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80",
    createdAt: "2026-11-16T09:30:00Z",
    authorName: "မပုံ့ (Admin)",
  },
  {
    id: "ann-03",
    title: "နယ်ဝေး လက်ကားအော်ဒါများ နေ့ချင်း ကားဂိတ်တင်ပေးနေပါပြီ",
    content:
      "နယ်ပြန်ရောင်းချလိုသော လက်ကားမိတ်ဆွေများအတွက် အိတ် (၅) လုံးနှင့်အထက် လက်ကားဈေးနှုန်းဖြင့် မှာယူနိုင်ပြီး မန္တလေးမှ မြန်မာနိုင်ငံအနှံ့ ကားဂိတ်များသို့ နေ့ချင်း အမြန်ပို့ဆောင်ပေးနေပါသည်။ ဖုန်း 09-963000502 သို့ ဆက်သွယ်နိုင်ပါသည်။",
    tag: "Wholesale",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
    createdAt: "2026-11-16T10:00:00Z",
    authorName: "မပုံ့ (Admin)",
  },
];

export const SHOP_INFO = {
  nameEn: "Pont Pont Bag Shop",
  nameMm: "ပုံ့ပုံ့ အိတ်အမျိုးမျိုး ရောင်းဝယ်ရေး (မန္တလေး)",
  taglineMm: "အမျိုးသမီးနှင့် အမျိုးသား လက်ကိုင်အိတ်၊ ဘေးလွယ်အိတ်၊ ကျောပိုးအိတ် လက်လီ/လက်ကား ရောင်းဝယ်ရေး",
  ownerName: "မပုံ့ (Ma Pont Pont)",
  email: "pontpont@gmail.com",
  hours: "နေ့စဉ် မနက် 8:00 AM မှ ည 8:00 PM အထိ",
  phones: ["09-963000502", "09-750072752", "09-404448881"],
  primaryPhone: "09963000502",
  branches: [
    {
      name: "ပင်မဆိုင် - ၆၅ လမ်း",
      nameEn: "Main Store - 65th Street",
      addressMm: "၆၅ လမ်း၊ ၁၀၇ လမ်းနှင့် ၁၀၈ လမ်းကြား၊ မန္တလေးမြို့",
      addressEn: "65th Street, Between 107th & 108th Streets, Mandalay",
    },
    {
      name: "ဆိုင်ခွဲ (၂) - ၇၃ လမ်း",
      nameEn: "Branch (2) - 73rd Street",
      addressMm: "၇၃ လမ်း၊ ၃၆ လမ်းနှင့် ၃၇ လမ်းကြား၊ မန္တလေးမြို့",
      addressEn: "73rd Street, Between 36th & 37th Streets, Mandalay",
    },
    {
      name: "ဆိုင်ခွဲ (၃) - တံခွန်တိုင်",
      nameEn: "Branch (3) - Thakhun Taing",
      addressMm: "၇၈ လမ်း (ရန်ကုန်-မန္တလေး လမ်းမကြီး)၊ တံခွန်တိုင်ဈေးအနီး၊ ပြည်ကြီးတံခွန်မြို့နယ်၊ မန္တလေးမြို့",
      addressEn: "78th Street, Near Thakhun Taing Market/Roundabout, Pyigyitagun Tsp, Mandalay",
    },
  ],
};

export interface ChatbotConfig {
  provider: "mock" | "gemini" | "openai" | "groq";
  apiKey?: string;
  model?: string;
  systemPrompt: string;
  botName: string;
  welcomeMessageMm: string;
  welcomeMessageEn: string;
  enabled: boolean;
}

export const DEFAULT_CHATBOT_CONFIG: ChatbotConfig = {
  provider: "mock",
  apiKey: "",
  model: "gemini-1.5-flash",
  systemPrompt: `You are "Pont Pont AI" (ပုံ့ပုံ့ AI အကူအညီ), the polite, friendly and helpful customer assistant for "Pont Pont Handbag Shop" (ပုံ့ပုံ့ အိတ်အမျိုးမျိုး ရောင်းဝယ်ရေး) based in Mandalay, Myanmar.

Store Information:
- Owner: Ma Pont Pont (မပုံ့)
- Main Branch (ပင်မဆိုင်): 65th Street, Between 107th & 108th Streets, Mandalay (၆၅ လမ်း၊ ၁၀၇×၁၀၈ လမ်းကြား၊ မန္တလေးမြို့)
- Branch (2): 73rd Street, Between 36th & 37th Streets, Mandalay (၇၃ လမ်း၊ ၃၆×၃၇ လမ်းကြား၊ မန္တလေးမြို့)
- Branch (3): 78th Street, Near Thakhun Taing Market/Roundabout, Pyigyitagun Tsp, Mandalay (၇၈ လမ်း၊ တံခွန်တိုင်ဈေးအနီး၊ မန္တလေးမြို့)
- Opening Hours: Daily 8:00 AM – 8:00 PM (နေ့စဉ် မနက် 8:00 မှ ည 8:00 အထိ)
- Contact Phones / Viber: 09-963000502, 09-750072752, 09-404448881
- Delivery: Mandalay downtown 2,500 MMK (Cash on Delivery available), Yangon 3,500 MMK, Naypyitaw 3,500 MMK, other cities 4,000 MMK via Bus Gates. Free delivery for orders over 100,000 MMK.
- Payment Methods: KBZPay (09-963000502 - Ma Pont Pont), WavePay (09-963000502), Mobile Banking (KBZ, CB, AYA). No extra percentage fee.
- Wholesale: Minimum 5-10 bags for wholesale discount. Resellers can contact 09-963000502 directly.

Guidelines:
- Always reply politely in natural Myanmar language unless the customer speaks English.
- Use friendly customer service terms (e.g. ရှင်, ပါရှင်, မင်္ဂလာပါရှင်).
- If customer asks about bag recommendations, mention Tote bags, Crossbody bags, Shoulder bags, Wallets, and Backpacks.
- Always provide accurate branch address (65th Street is the Main Branch).`,
  botName: "Pont Pont AI Assistant",
  welcomeMessageMm: "မင်္ဂလာပါရှင် 👋 ပုံ့ပုံ့ အိတ်ဆိုင် (မန္တလေး) မှ ကြိုဆိုပါတယ်။ အိတ်ဒီဇိုင်းများ၊ ဈေးနှုန်း၊ ပို့ဆောင်ခ၊ ဆိုင်လိပ်စာနှင့် ဖုန်းနံပါတ်များ စိတ်ကြိုက်မေးမြန်းနိုင်ပါတယ်ရှင်။",
  welcomeMessageEn: "Hello! 👋 Welcome to Pont Pont Handbag Shop Mandalay. How can I help you today? Ask about bag designs, prices, branch locations, or delivery!",
  enabled: true,
};

export const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: "All", labelEn: "All Bags" },
  { id: "Tote", labelEn: "Tote & Handbags" },
  { id: "Crossbody", labelEn: "Sling & Crossbody" },
  { id: "Shoulder", labelEn: "Shoulder Bags" },
  { id: "Clutch", labelEn: "Wallets & Purses" },
  { id: "Backpack", labelEn: "Backpacks" },
];

export const CATEGORIES = INITIAL_CATEGORIES;

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "pp-bag-01",
    nameEn: "Pont Pont Signature Ladies Office Tote Bag",
    nameMm: "ပုံ့ပုံ့ ရုံးတက် လက်ဆွဲ သားရေ တုတ်အိတ်ကြီး",
    category: "Tote",
    categoryMm: "လက်ဆွဲအိတ် / တုတ်အိတ်",
    price: 38000,
    originalPrice: 45000,
    wholesalePrice: 31000,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
    colors: [
      { name: "Caramel Brown", hex: "#9C5B34" },
      { name: "Midnight Black", hex: "#1C1917" },
      { name: "Cream Ivory", hex: "#F5EFE6" },
    ],
    badge: "Best Seller",
    rating: 4.9,
    reviewsCount: 215,
    stock: 45,
    material: "High-Grade PU Pebbled Leather",
    dimensions: "34cm x 28cm x 14cm",
    descriptionEn:
      "Pont Pont Mandalay best-selling spacious tote bag for office and daily use. Available for both retail and wholesale orders.",
    descriptionMm:
      "ပုံ့ပုံ့ အိတ်ဆိုင် (မန္တလေး) ၏ လူကြိုက်အများဆုံး ရုံးတက်၊ ကျောင်းတက် နေ့စဉ်သုံး သားရေ လက်ဆွဲတုတ်အိတ်။ လက်လီဈေး 38,000 ကျပ် (လက်ကား ၅ လုံးအထက် 31,000 ကျပ်ဖြင့် မှာယူနိုင်ပါသည်)။",
  },
  {
    id: "pp-bag-02",
    nameEn: "Pont Pont Diamond Quilted Chain Sling Bag",
    nameMm: "ပုံ့ပုံ့ စိန်ကွက်ဖော် ရွှေကြိုးချိတ် ဘေးလွယ်အိတ်",
    category: "Crossbody",
    categoryMm: "ဘေးလွယ်အိတ်",
    price: 29500,
    originalPrice: 36000,
    wholesalePrice: 24000,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80",
    colors: [
      { name: "Champagne Rose", hex: "#E2B6B1" },
      { name: "Onyx Black", hex: "#18181B" },
      { name: "Emerald Green", hex: "#065F46" },
    ],
    badge: "Wholesale Hot",
    rating: 4.9,
    reviewsCount: 184,
    stock: 60,
    material: "Soft Quilted Leather & Gold Chain Strap",
    dimensions: "23cm x 15cm x 7.5cm",
    descriptionEn:
      "Trendy diamond-quilted women's sling bag with adjustable leather-woven gold chain. Popular wholesale item across Myanmar.",
    descriptionMm:
      "ပွဲတက်ရော အပြင်သွားပါ လိုက်ဖက်ညီသော စိန်ကွက်ဖော် ရွှေကြိုးချိတ် ဘေးလွယ်အိတ်။ နယ်ပြန်လက်ကားဆိုင်များ အထူးအဝယ်လိုက်သော ဒီဇိုင်းဖြစ်ပါသည် (လက်ကားဈေး - 24,000 ကျပ်)။",
  },
  {
    id: "pp-bag-03",
    nameEn: "Pont Pont Crescent Shoulder & Underarm Bag",
    nameMm: "ပုံ့ပုံ့ လခြမ်းပုံ ခေတ်မီ ပုခုံးလွယ်အိတ်",
    category: "Shoulder",
    categoryMm: "ပုခုံးလွယ်အိတ်",
    price: 26000,
    originalPrice: 32000,
    wholesalePrice: 21000,
    image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=900&q=80",
    colors: [
      { name: "Espresso", hex: "#4A2C2A" },
      { name: "Warm Sand", hex: "#D6C5B3" },
      { name: "Cherry Wine", hex: "#7F1D1D" },
    ],
    badge: "New Arrival",
    rating: 4.8,
    reviewsCount: 142,
    stock: 50,
    material: "Smooth Microfiber Leather",
    dimensions: "26cm x 16cm x 6.5cm",
    descriptionEn:
      "Chic minimalist crescent shoulder bag with smooth finish and durable brass hardware.",
    descriptionMm:
      "လူငယ်အကြိုက် ခေတ်မီလှပသော လခြမ်းပုံစံ ပုခုံးလွယ်အိတ်။ ပေါ့ပါးကျစ်လျစ်ပြီး မည်သည့်ဝတ်စုံနှင့်မဆို စတိုင်ကျလှပစေပါသည် (လက်ကားဈေး - 21,000 ကျပ်)။",
  },
  {
    id: "pp-bag-04",
    nameEn: "Pont Pont Pearl & Velvet Evening Purse",
    nameMm: "ပုံ့ပုံ့ ပုလဲစီ ပွဲတက် လက်ကိုင်အိတ်နှင့် ပိုက်ဆံအိတ်",
    category: "Clutch",
    categoryMm: "ပိုက်ဆံအိတ် / ပွဲတက်အိတ်",
    price: 32000,
    originalPrice: 39000,
    wholesalePrice: 26500,
    image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=900&q=80",
    colors: [
      { name: "Ruby Red", hex: "#991B1B" },
      { name: "Royal Gold", hex: "#CA8A04" },
      { name: "Pearl White", hex: "#FAF8F5" },
    ],
    badge: "Best Seller",
    rating: 5.0,
    reviewsCount: 98,
    stock: 30,
    material: "Satin Velvet & Pearl Clasp Frame",
    dimensions: "21cm x 12cm x 5cm",
    descriptionEn:
      "Elegant pearl-clasp evening clutch and purse for weddings and ceremonies. Comes with detachable chain strap.",
    descriptionMm:
      "အလှူ၊ မင်္ဂလာဆောင်နှင့် ပွဲလမ်းသဘင်များအတွက် အထူးသင့်တော်သော ပုလဲစီ ပွဲတက်လက်ကိုင်အိတ်။ ဖြုတ်တပ်နိုင်သော ကြိုးအရှည်ပါဝင်ပါသည် (လက်ကားဈေး - 26,500 ကျပ်)။",
  },
  {
    id: "pp-bag-05",
    nameEn: "Pont Pont Top-Handle Satchel (3-Compartment)",
    nameMm: "ပုံ့ပုံ့ အကန့် (၃) ကန့်ပါ လက်ဆွဲနှင့် ဘေးလွယ်အိတ်",
    category: "Shoulder",
    categoryMm: "ပုခုံးလွယ်အိတ်",
    price: 42000,
    originalPrice: 50000,
    wholesalePrice: 35000,
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80",
    colors: [
      { name: "Cognac Tan", hex: "#B45309" },
      { name: "Classic Black", hex: "#171717" },
      { name: "Olive Taupe", hex: "#6B705C" },
    ],
    badge: "Wholesale Hot",
    rating: 4.9,
    reviewsCount: 163,
    stock: 38,
    material: "Scratch-Resistant Saffiano Textured Leather",
    dimensions: "29cm x 22cm x 12cm",
    descriptionEn:
      "Structured triple-compartment handbag with top handle and detachable long sling strap.",
    descriptionMm:
      "အစင်းရာခံနိုင်ရည်ရှိသော Saffiano သားရေသားဖြင့် ပြုလုပ်ထားပြီး အကန့် (၃) ကန့် ပါဝင်သောကြောင့် ပစ္စည်းများကို စနစ်တကျ ခွဲခြားထည့်နိုင်ပါသည် (လက်ကားဈေး - 35,000 ကျပ်)။",
  },
  {
    id: "pp-bag-06",
    nameEn: "Pont Pont Unisex Waterproof Travel & Daily Backpack",
    nameMm: "ပုံ့ပုံ့ ရေစိုခံ ကျား/မ နှစ်မျိုးသုံး ကျောပိုးအိတ်",
    category: "Backpack",
    categoryMm: "ကျောပိုးအိတ်",
    price: 35000,
    originalPrice: 42000,
    wholesalePrice: 28500,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    colors: [
      { name: "Mocha Brown", hex: "#78350F" },
      { name: "Jet Black", hex: "#111827" },
      { name: "Blush Pink", hex: "#F4ACB7" },
    ],
    badge: "New Arrival",
    rating: 4.8,
    reviewsCount: 112,
    stock: 55,
    material: "Waterproof Soft Leather & Nylon Lining",
    dimensions: "26cm x 31cm x 14cm",
    descriptionEn:
      "Versatile waterproof backpack suitable for both men and women, travel, and school use.",
    descriptionMm:
      "အမျိုးသားရော အမျိုးသမီးပါ အသုံးပြုနိုင်သော ရေစိုခံ သားရေ ကျောပိုးအိတ်။ ခရီးသွားနှင့် ကျောင်းသုံးအတွက် အထူးခိုင်ခံ့ပါသည် (လက်ကားဈေး - 28,500 ကျပ်)။",
  },
  {
    id: "pp-bag-07",
    nameEn: "Pont Pont Woven Bucket Sling Bag",
    nameMm: "ပုံ့ပုံ့ ရက်လုပ် ဒီဇိုင်းဆန်း ပုံးပုံစံ ဘေးလွယ်အိတ်",
    category: "Crossbody",
    categoryMm: "ဘေးလွယ်အိတ်",
    price: 28000,
    originalPrice: 34000,
    wholesalePrice: 23000,
    image: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=80",
    colors: [
      { name: "Warm Hazelnut", hex: "#A16207" },
      { name: "Creamy Oat", hex: "#EAE0D5" },
    ],
    badge: "Sale",
    rating: 4.8,
    reviewsCount: 89,
    stock: 32,
    material: "Hand-Woven PU Leather with Inner Pouch",
    dimensions: "20cm x 22cm x 14cm",
    descriptionEn:
      "Artisanal woven texture bucket bag with removable inner drawstring pouch.",
    descriptionMm:
      "အနုစိတ်ရက်လုပ်ထားသော ဒီဇိုင်းဆန်း ဘေးလွယ်အိတ်ဖြစ်ပြီး အတွင်းအိတ်အပို တစ်လုံးပါဝင်ပါသည် (လက်ကားဈေး - 23,000 ကျပ်)။",
  },
  {
    id: "pp-bag-08",
    nameEn: "Pont Pont Luxury Long Zip Wallet & Clutch",
    nameMm: "ပုံ့ပုံ့ ဇစ်ဆွဲ ပိုက်ဆံအိတ်ရှည်နှင့် လက်ကိုင်အိတ်",
    category: "Clutch",
    categoryMm: "ပိုက်ဆံအိတ် / ပွဲတက်အိတ်",
    price: 18500,
    originalPrice: 23000,
    wholesalePrice: 14500,
    image: "https://images.unsplash.com/photo-1575032617751-6ddec2089882?auto=format&fit=crop&w=900&q=80",
    colors: [
      { name: "Champagne Gold", hex: "#D4AF37" },
      { name: "Midnight Navy", hex: "#1E3A8A" },
      { name: "Rose Quartz", hex: "#FDA4AF" },
    ],
    badge: "Wholesale Hot",
    rating: 4.9,
    reviewsCount: 240,
    stock: 80,
    material: "Satin & Textured Leather Multi-Card Slot",
    dimensions: "20cm x 10.5cm x 3.5cm",
    descriptionEn:
      "Spacious long wallet and clutch that fits smartphones, cash notes, and 12 cards effortlessly.",
    descriptionMm:
      "ဖုန်းအကြီး၊ ငွေစက္ကူနှင့် ကတ်များ လုံလောက်စွာ ထည့်သွင်းနိုင်သော ပုံ့ပုံ့ ပိုက်ဆံအိတ်ရှည်။ လက်ဆောင်ပေးရန်နှင့် လက်ကားပြန်ရောင်းရန် အရောင်းရဆုံးပစ္စည်း (လက်ကားဈေး - 14,500 ကျပ်)။",
  },
];

export const INITIAL_ORDERS: Order[] = [];

export const CITIES = [
  { name: "Mandalay (မန္တလေး - မြို့တွင်း)", fee: 2500 },
  { name: "Pyin Oo Lwin (ပြင်ဦးလွင်)", fee: 3500 },
  { name: "Sagaing / Monywa (စစ်ကိုင်း / မုံရွာ)", fee: 3500 },
  { name: "Yangon (ရန်ကုန်)", fee: 4000 },
  { name: "Naypyidaw (နေပြည်တော်)", fee: 3500 },
  { name: "Taunggyi (တောင်ကြီး)", fee: 4000 },
  { name: "Magway / Pakokku (မကွေး / ပခုက္ကူ)", fee: 4000 },
  { name: "Other Cities / ကားဂိတ်တင် (အခြားမြို့များ)", fee: 4500 },
];
