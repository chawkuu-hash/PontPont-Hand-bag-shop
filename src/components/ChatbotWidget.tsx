"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Phone, MapPin, Sparkles, ShoppingBag } from "lucide-react";
import { Product, ChatbotConfig } from "@/data/initialData";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  time: string;
  suggestedAction?: {
    label: string;
    actionType: "filter_category" | "call_phone" | "view_branches" | "view_cart";
    value?: string;
  };
}

interface ChatbotWidgetProps {
  products: Product[];
  lang: "mm" | "en";
  chatbotConfig?: ChatbotConfig;
  onSelectCategory?: (category: string) => void;
  onOpenCart?: () => void;
  onSelectProduct?: (product: Product) => void;
}

export default function ChatbotWidget({
  products,
  lang,
  chatbotConfig,
  onSelectCategory,
  onOpenCart,
  onSelectProduct,
}: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      sender: "bot",
      text:
        lang === "en"
          ? "Hello! 👋 Welcome to Pont Pont Handbag Shop Mandalay. How can I help you today? You can ask about our bags, prices, delivery, branch addresses, or contact info!"
          : "မင်္ဂလာပါရှင် 👋 ပုံ့ပုံ့ အိတ်ဆိုင် (မန္တလေး) မှ ကြိုဆိုပါတယ်။ အိတ်ဒီဇိုင်းများ၊ ဈေးနှုန်း၊ ပို့ဆောင်ခ၊ ဆိုင်လိပ်စာနှင့် ဖုန်းနံပါတ်များ စိတ်ကြိုက်မေးမြန်းနိုင်ပါတယ်ရှင်။",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const quickPrompts =
    lang === "en"
      ? [
          "📍 Main Branch Address",
          "👜 Popular Bags",
          "🚚 Delivery & Fees",
          "📞 Contact Phone",
          "💰 Payment Methods",
        ]
      : [
          "📍 ပင်မဆိုင်လိပ်စာ",
          "👜 ရောင်းအားအကောင်းဆုံးအိတ်များ",
          "🚚 ပို့ဆောင်ခနှင့် ကားဂိတ်",
          "📞 ဆက်သွယ်ရန်ဖုန်း",
          "💰 ငွေပေးချေမှုစနစ်",
        ];

  function getBotResponse(userQuery: string): {
    text: string;
    suggestedAction?: Message["suggestedAction"];
  } {
    const q = userQuery.toLowerCase().trim();

    // 1. Branches / Address
    if (
      q.includes("လိပ်စာ") ||
      q.includes("ဆိုင်") ||
      q.includes("ပင်မဆိုင်") ||
      q.includes("မန္တလေး") ||
      q.includes("address") ||
      q.includes("branch") ||
      q.includes("location") ||
      q.includes("where")
    ) {
      return {
        text:
          lang === "en"
            ? "🏪 Our Mandalay Branches:\n\n• Main Store: 65th St, Bet 107th & 108th St, Mandalay\n• Branch (2): 73rd St, Bet 36th & 37th St, Mandalay\n• Branch (3): 78th St, Near Thakhun Taing Market\n\n⏰ Opening Hours: Daily 8:00 AM – 8:00 PM"
            : "🏪 မန္တလေးမြို့ ဆိုင်ခွဲ (၃) ဆိုင် လိပ်စာများ:\n\n• ပင်မဆိုင်: ၆၅ လမ်း၊ ၁၀၇×၁၀၈ လမ်းကြား၊ မန္တလေးမြို့\n• ဆိုင်ခွဲ (၂): ၇၃ လမ်း၊ ၃၆×၃၇ လမ်းကြား၊ မန္တလေးမြို့\n• ဆိုင်ခွဲ (၃): ၇၈ လမ်း (ရန်ကုန်-မန္တလေးလမ်း)၊ တံခွန်တိုင်ဈေးအနီး\n\n⏰ ဆိုင်ဖွင့်ချိန်: နေ့စဉ် မနက် 8:00 AM မှ ည 8:00 PM အထိ",
        suggestedAction: {
          label: lang === "en" ? "View Branches on Page" : "ဆိုင်ခွဲများ အသေးစိတ်ကြည့်မည်",
          actionType: "view_branches",
        },
      };
    }

    // 2. Phone / Contact
    if (
      q.includes("ဖုန်း") ||
      q.includes("ဆက်သွယ်") ||
      q.includes("phone") ||
      q.includes("call") ||
      q.includes("contact") ||
      q.includes("viber")
    ) {
      return {
        text:
          lang === "en"
            ? "📞 You can contact us directly at:\n• 09-963000502 (Viber & Primary)\n• 09-750072752\n• 09-404448881\n\nWe accept inquiries daily from 8:00 AM to 8:00 PM."
            : "📞 ဆက်သွယ်ရန် ဖုန်းနံပါတ်များ:\n• 09-963000502 (ပင်မဖုန်း / Viber)\n• 09-750072752\n• 09-404448881\n\nနေ့စဉ် မနက် 8:00 မှ ည 8:00 ထိ ဆက်သွယ်စုံစမ်းနိုင်ပါတယ်ရှင်။",
        suggestedAction: {
          label: lang === "en" ? "Call 09-963000502" : "ဖုန်းတိုက်ရိုက်ခေါ်မည်",
          actionType: "call_phone",
          value: "09963000502",
        },
      };
    }

    // 3. Delivery / Delivery Fees
    if (
      q.includes("ပို့") ||
      q.includes("ပို့ဆောင်ခ") ||
      q.includes("deli") ||
      q.includes("delivery") ||
      q.includes("ကားဂိတ်") ||
      q.includes("ရန်ကုန်") ||
      q.includes("နယ်")
    ) {
      return {
        text:
          lang === "en"
            ? "🚚 Delivery Information:\n• Mandalay Downtown: 2,500 MMK (Cash on Delivery available)\n• Yangon: 3,500 MMK\n• Naypyitaw: 3,500 MMK\n• Other regions: 4,000 MMK (Sent via Bus Terminal / Highway Gate)\n\n⚡ Delivery usually takes 1-3 days."
            : "🚚 ပို့ဆောင်ခနှင့် ပို့ဆောင်ရေး အချက်အလက်များ:\n• မန္တလေးမြို့တွင်း: ၂,၅၀၀ ကျပ် (အိမ်အရောက် ငွေချေစနစ် ရပါသည်)\n• ရန်ကုန်မြို့တွင်း: ၃,၅၀၀ ကျပ်\n• နေပြည်တော်: ၃,၅၀၀ ကျပ်\n• အခြား နယ်မြို့များ: ၄,၀၀၀ ကျပ် (ကားဂိတ်တင် စနစ်ဖြင့် ပို့ဆောင်ပေးပါသည်)\n\n⚡ မန္တလေးမြို့တွင်း အမြန်ပို့ဆောင်ပေးပြီး နယ်ဝေး ၁-၃ ရက်အတွင်း ရောက်ရှိပါသည်။",
      };
    }

    // 4. Payment Methods
    if (
      q.includes("ငွေ") ||
      q.includes("ရှင်း") ||
      q.includes("kpay") ||
      q.includes("kbz") ||
      q.includes("wave") ||
      q.includes("payment") ||
      q.includes("pay") ||
      q.includes("ဘဏ်")
    ) {
      return {
        text:
          lang === "en"
            ? "💰 Payment Methods:\n• KBZPay (09-963000502 - Ma Pont Pont)\n• WavePay (09-963000502 - Ma Pont Pont)\n• Cash on Delivery (COD for Mandalay)\n• Mobile Banking (KBZ, CB, AYA)\n\nPlease note: No extra % fee for KBZPay/WavePay transfers."
            : "💰 ငွေပေးချေနိုင်သော နည်းလမ်းများ:\n• KBZPay (09-963000502 - Ma Pont Pont)\n• WavePay (09-963000502 - Ma Pont Pont)\n• မန္တလေးမြို့တွင်း အိမ်အရောက်ငွေချေ (Cash on Delivery)\n• KBZ / CB / AYA Mobile Banking\n\n% ပေးစရာမလိုဘဲ တိုက်ရိုက် လွှဲပြောင်းပေးချေနိုင်ပါတယ်ရှင်။",
      };
    }

    // 5. Wholesale / Wholesale price
    if (
      q.includes("ကား") ||
      q.includes("လက်ကား") ||
      q.includes("wholesale") ||
      q.includes("bulk")
    ) {
      return {
        text:
          lang === "en"
            ? "📦 Wholesale Orders:\nWe offer special wholesale prices for boutique resellers and bulk purchases (minimum 5-10 items per batch). Please contact our direct phone 09-963000502 or Viber to get wholesale catalogs and discount rates!"
            : "📦 လက်ကား မှာယူမှုများ:\nဆိုင်ရှင်များ၊ ပြန်လည်ရောင်းချလိုသူများအတွက် အထူးလက်ကားဈေးနှုန်း သီးသန့်ရှိပါသည် (အနည်းဆုံး ၅ လုံးမှ ၁၀ လုံးအထက်)။ လက်ကားကတ်တလောက်နှင့် ဈေးနှုန်းညှိနှိုင်းရန် ဖုန်း 09-963000502 (Viber) သို့ တိုက်ရိုက် ဆက်သွယ်စုံစမ်းနိုင်ပါတယ်ရှင်။",
        suggestedAction: {
          label: lang === "en" ? "Call Wholesale Manager" : "လက်ကားဌာန သို့ ဆက်သွယ်ရန်",
          actionType: "call_phone",
          value: "09963000502",
        },
      };
    }

    // 6. Bags search & Product inquiries
    const bagKeywords = [
      { key: "tote", cat: "Tote", mm: "လက်ကိုင်အိတ် / Tote Bag" },
      { key: "crossbody", cat: "Crossbody", mm: "ဘေးလွယ်အိတ် / Crossbody" },
      { key: "shoulder", cat: "Shoulder", mm: "ပခုံးလွယ်အိတ် / Shoulder Bag" },
      { key: "clutch", cat: "Clutch", mm: "ပိုက်ဆံအိတ် / Clutch" },
      { key: "wallet", cat: "Clutch", mm: "ပိုက်ဆံအိတ်" },
      { key: "backpack", cat: "Backpack", mm: "ကျောပိုးအိတ် / Backpack" },
    ];

    for (const b of bagKeywords) {
      if (q.includes(b.key) || q.includes(b.mm)) {
        const matches = products.filter((p) => p.category === b.cat);
        const count = matches.length;
        return {
          text:
            lang === "en"
              ? `👜 We have ${count} wonderful designs in ${b.cat} bags! Starting from ${Math.min(...matches.map((m) => m.price)).toLocaleString()} MMK.`
              : `👜 ${b.mm} အမျိုးအစားတွင် လှပသပ်ရပ်သော ဒီဇိုင်းသစ် (${count}) မျိုး ရရှိနိုင်ပါသည်ရှင်။ စတင်ဈေးနှုန်း ${Math.min(...matches.map((m) => m.price)).toLocaleString()} ကျပ်မှ စတင်ပါသည်။`,
          suggestedAction: {
            label: lang === "en" ? `View ${b.cat} Bags` : `${b.cat} အိတ်များ ကြည့်ရှုမည်`,
            actionType: "filter_category",
            value: b.cat,
          },
        };
      }
    }

    if (
      q.includes("အိတ်") ||
      q.includes("bag") ||
      q.includes("ဈေး") ||
      q.includes("price") ||
      q.includes("item") ||
      q.includes("ရောင်း")
    ) {
      const topProducts = products.slice(0, 3);
      const list = topProducts
        .map(
          (p) =>
            `• ${lang === "en" ? p.nameEn : p.nameMm} (${p.price.toLocaleString()} MMK)`
        )
        .join("\n");
      return {
        text:
          lang === "en"
            ? `✨ Top featured products available right now:\n\n${list}\n\nYou can click below to explore the full catalog!`
            : `✨ လက်ရှိ ရောင်းအားအကောင်းဆုံး အိတ်ဒီဇိုင်းသစ်များ:\n\n${list}\n\nကတ်တလောက်ထဲတွင် အိတ်အမျိုးအစားစုံလင်စွာ ကြည့်ရှုနိုင်ပါတယ်ရှင်။`,
        suggestedAction: {
          label: lang === "en" ? "View All Bags" : "အိတ်အားလုံး ကြည့်ရှုမည်",
          actionType: "filter_category",
          value: "All",
        },
      };
    }

    // Default polite response
    return {
      text:
        lang === "en"
          ? "Thank you for reaching out! 🙏 You can ask me about our Mandalay branches, bag designs, prices, delivery rates, or call us at 09-963000502."
          : "စုံစမ်းမေးမြန်းမှုအတွက် ကျေးဇူးတင်ပါတယ်ရှင် 🙏 ပင်မဆိုင်လိပ်စာ (၆၅ လမ်း၊ ၁၀၇×၁၀၈ ကြား)၊ အိတ်ဒီဇိုင်းသစ်များ၊ ဈေးနှုန်း၊ ပို့ဆောင်ခ (သို့မဟုတ်) ဖုန်း 09-963000502 သို့ တိုက်ရိုက် မေးမြန်းနိုင်ပါတယ်ရှင်။",
    };
  }

  async function handleSend(textToSend?: string) {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    try {
      // First try live server AI if configured
      const res = await fetch("/api/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CHAT_MESSAGE", message: query }),
      });
      const data = await res.json();

      if (data.reply) {
        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: data.reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
        return;
      }
    } catch {
      // Fallback to local rule engine
    }

    // Fallback rule engine with local shop data & actions
    const localRes = getBotResponse(query);
    const botMsg: Message = {
      id: `bot-${Date.now()}`,
      sender: "bot",
      text: localRes.text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      suggestedAction: localRes.suggestedAction,
    };
    setMessages((prev) => [...prev, botMsg]);
    setIsTyping(false);
  }

  function handleActionClick(action: Message["suggestedAction"]) {
    if (!action) return;
    if (action.actionType === "filter_category" && onSelectCategory) {
      onSelectCategory(action.value || "All");
      const el = document.getElementById("catalog");
      el?.scrollIntoView({ behavior: "smooth" });
    } else if (action.actionType === "call_phone") {
      window.open(`tel:${action.value || "09963000502"}`);
    } else if (action.actionType === "view_branches") {
      const el = document.getElementById("branches") || document.querySelector("footer");
      el?.scrollIntoView({ behavior: "smooth" });
    } else if (action.actionType === "view_cart" && onOpenCart) {
      onOpenCart();
    }
  }

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-5 z-50 group flex items-center gap-2.5 bg-gradient-to-r from-amber-600 via-rose-600 to-amber-700 text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all duration-200 border border-amber-300/40"
          aria-label="Open Chatbot"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-stone-900" />
          </div>
          <span className="text-xs font-bold tracking-wide hidden sm:inline">
            {lang === "en" ? "Chat with Shop" : "အိတ်ဆိုင် Chatbot"}
          </span>
          <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold uppercase">
            AI
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[85vh] h-[540px] bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white px-4 py-3.5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-2xl bg-amber-600/30 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
                <Bot className="w-6 h-6" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-stone-900" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                  Pont Pont AI Assistant
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h3>
                <p className="text-[11px] text-amber-300/90 font-medium">
                  {lang === "en" ? "Mandalay Handbag Helper • Online" : "ပုံ့ပုံ့ အိတ်ဆိုင် အကူအညီ • အသင့်ရှိပါသည်"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition"
              aria-label="Close Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-stone-50/70 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "bot" && (
                  <div className="w-7 h-7 rounded-xl bg-amber-100 border border-amber-300/60 text-amber-900 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 shadow-xs ${
                    m.sender === "user"
                      ? "bg-amber-600 text-white rounded-br-none"
                      : "bg-white text-stone-800 border border-stone-200/80 rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed text-[12px]">{m.text}</p>
                  
                  {m.suggestedAction && (
                    <button
                      onClick={() => handleActionClick(m.suggestedAction)}
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-xl text-[11px] border border-amber-300 transition shadow-xs"
                    >
                      {m.suggestedAction.actionType === "call_phone" && <Phone className="w-3.5 h-3.5" />}
                      {m.suggestedAction.actionType === "filter_category" && <ShoppingBag className="w-3.5 h-3.5" />}
                      {m.suggestedAction.actionType === "view_branches" && <MapPin className="w-3.5 h-3.5" />}
                      <span>{m.suggestedAction.label}</span>
                    </button>
                  )}

                  <span
                    className={`block text-[10px] mt-1 ${
                      m.sender === "user" ? "text-amber-200 text-right" : "text-stone-400"
                    }`}
                  >
                    {m.time}
                  </span>
                </div>

                {m.sender === "user" && (
                  <div className="w-7 h-7 rounded-xl bg-stone-900 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 items-center text-stone-500 text-[11px] bg-white w-fit px-3 py-2 rounded-2xl border border-stone-200">
                <Bot className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                <span>ပုံ့ပုံ့ AI ပြန်လည်ဖြေကြားနေပါသည်...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-stone-100/90 border-t border-stone-200 overflow-x-auto flex gap-1.5 no-scrollbar">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white text-stone-700 hover:bg-amber-50 hover:text-amber-800 text-[11px] font-medium border border-stone-200 transition shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-stone-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                lang === "en"
                  ? "Ask about bags, branch, delivery..."
                  : "အိတ်များ၊ ဆိုင်လိပ်စာ၊ ပို့ဆောင်ခ မေးပါ..."
              }
              className="flex-1 bg-stone-100 text-stone-900 text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white rounded-xl shadow-md transition shrink-0"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
