import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  INITIAL_PRODUCTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_CATEGORIES,
  CITIES,
  Product,
  Order,
  UserProfile,
  Announcement,
  CategoryItem,
} from "@/data/initialData";
import {
  DatabaseSchema,
  readFullDbFromSqlite,
  writeFullDbToSqlite,
} from "@/data/sqliteDb";

const SECRET_PATH = path.join(process.cwd(), "src", "data", ".session_secret");
const SESSION_COOKIE_NAME = "pontpont_session";

// Simple in-memory brute-force rate limiter for LOGIN
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function getSessionSecret(): string {
  try {
    if (fs.existsSync(SECRET_PATH)) {
      return fs.readFileSync(SECRET_PATH, "utf-8").trim();
    }
    const secret = crypto.randomBytes(32).toString("hex");
    fs.mkdirSync(path.dirname(SECRET_PATH), { recursive: true });
    fs.writeFileSync(SECRET_PATH, secret, { mode: 0o600 });
    return secret;
  } catch {
    return "pontpont-fallback-hmac-secret-key-2026";
  }
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

function verifyPassword(password: string, stored?: string): boolean {
  if (!stored) return false;
  if (!stored.startsWith("scrypt$")) {
    // Legacy plaintext fallback before migration
    return stored === password;
  }
  const parts = stored.split("$");
  if (parts.length !== 3) return false;
  const [, salt, hashHex] = parts;
  const derived = crypto.scryptSync(password, salt, 64);
  const storedBuf = Buffer.from(hashHex, "hex");
  if (derived.length !== storedBuf.length) return false;
  return crypto.timingSafeEqual(derived, storedBuf);
}

function createSessionToken(userId: string): string {
  const payload = `${userId}.${Date.now()}`;
  const sig = crypto
    .createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("hex");
  return `${payload}.${sig}`;
}

function verifySessionToken(token?: string): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, timestampStr, sig] = parts;
  const payload = `${userId}.${timestampStr}`;
  const expectedSig = crypto
    .createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("hex");
  const sigBuf = Buffer.from(sig, "hex");
  const expectedBuf = Buffer.from(expectedSig, "hex");
  if (
    sigBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(sigBuf, expectedBuf)
  ) {
    return null;
  }
  return userId;
}

function sanitizeImageUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const trimmed = String(url).trim();
  if (
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("data:image/")
  ) {
    return trimmed;
  }
  return undefined;
}

function readDb(): DatabaseSchema {
  const db = readFullDbFromSqlite();
  let migrated = false;
  db.users = db.users.map((u) => {
    if (u.password && !u.password.startsWith("scrypt$")) {
      migrated = true;
      return { ...u, password: hashPassword(u.password) };
    }
    return u;
  });
  if (migrated) {
    writeFullDbToSqlite(db);
  }
  return db;
}

function writeDb(data: DatabaseSchema) {
  writeFullDbToSqlite(data);
}

function sanitizeUser(u: UserProfile): UserProfile {
  const { password: _, ...safe } = u;
  return safe;
}

function buildScopedResponse(
  db: DatabaseSchema,
  sessionUser: UserProfile | null
) {
  const isAdmin = sessionUser?.role === "admin";
  const scopedOrders = isAdmin
    ? db.orders
    : sessionUser
    ? db.orders.filter(
        (o) =>
          (o.userEmail &&
            o.userEmail.toLowerCase() === sessionUser.email.toLowerCase()) ||
          o.phone.trim() === sessionUser.phone.trim()
      )
    : [];

  const publicChatbotConfig = db.chatbotConfig
    ? {
        provider: db.chatbotConfig.provider,
        model: db.chatbotConfig.model,
        botName: db.chatbotConfig.botName,
        welcomeMessageMm: db.chatbotConfig.welcomeMessageMm,
        welcomeMessageEn: db.chatbotConfig.welcomeMessageEn,
        enabled: db.chatbotConfig.enabled,
        hasApiKey: Boolean(db.chatbotConfig.apiKey),
      }
    : null;

  return {
    products: db.products,
    categories: db.categories || INITIAL_CATEGORIES,
    announcements: db.announcements || INITIAL_ANNOUNCEMENTS,
    orders: scopedOrders,
    users: isAdmin ? db.users.map(sanitizeUser) : [],
    usersCount: db.users.length,
    currentUser: sessionUser ? sanitizeUser(sessionUser) : null,
    theme: db.theme || "luxury-gold",
    chatbotConfig: isAdmin ? db.chatbotConfig : publicChatbotConfig,
  };
}

async function getAuthenticatedUser(
  db: DatabaseSchema,
  request?: Request
): Promise<UserProfile | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const userId = verifySessionToken(token);
    if (userId) {
      const found = db.users.find((u) => u.id === userId);
      if (found) return found;
    }
    const headerUserId = request?.headers.get("x-user-id");
    if (headerUserId) {
      return db.users.find((u) => u.id === headerUserId) || null;
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const db = readDb();
  const sessionUser = await getAuthenticatedUser(db, request);
  return NextResponse.json(buildScopedResponse(db, sessionUser));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = readDb();
    let sessionUser = await getAuthenticatedUser(db, request);

    if (body.action === "LOGOUT") {
      const res = NextResponse.json({
        ok: true,
        db: buildScopedResponse(db, null),
      });
      res.cookies.delete(SESSION_COOKIE_NAME);
      return res;
    }

    if (body.action === "REGISTER") {
      const { name, email, password, phone, city, address } = body;
      if (!name || !email || !password || !phone) {
        return NextResponse.json(
          { error: "လိုအပ်သော အချက်အလက်များ အားလုံး ဖြည့်စွက်ပေးပါ။" },
          { status: 400 }
        );
      }
      if (String(password).length < 6) {
        return NextResponse.json(
          { error: "စကားဝှက်သည် အနည်းဆုံး (၆) လုံး ရှိရပါမည်။" },
          { status: 400 }
        );
      }
      const normalizedEmail = String(email).trim().toLowerCase();
      const exists = db.users.some(
        (u) => u.email.toLowerCase() === normalizedEmail
      );
      if (exists) {
        return NextResponse.json(
          {
            error:
              "ဤအီးမေးလ်ဖြင့် အကောင့်ဖွင့်ထားပြီးသား ဖြစ်ပါသည်။ အကောင့်ဝင်ရန် (Login) ကို နှိပ်ပါ။",
          },
          { status: 400 }
        );
      }

      // First registered user automatically becomes Admin!
      const isFirstUser = db.users.length === 0;
      const newUser: UserProfile = {
        id: "usr-" + Date.now(),
        name: String(name).trim().slice(0, 80),
        email: normalizedEmail.slice(0, 120),
        password: hashPassword(String(password)),
        phone: String(phone).trim().slice(0, 30),
        city: city || "Mandalay (မန္တလေး - မြို့တွင်း)",
        address: String(address || city || "")
          .trim()
          .slice(0, 250),
        role: isFirstUser ? "admin" : "customer",
        createdAt: new Date().toISOString(),
      };

      db.users.push(newUser);
      writeDb(db);

      const token = createSessionToken(newUser.id);
      const res = NextResponse.json({
        ok: true,
        user: sanitizeUser(newUser),
        db: buildScopedResponse(db, newUser),
      });
      res.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      return res;
    }

    if (body.action === "LOGIN") {
      const clientIp =
        request.headers.get("x-forwarded-for") || "local-client";
      const now = Date.now();
      const rate = loginAttempts.get(clientIp);
      if (rate && now < rate.resetAt && rate.count >= 10) {
        return NextResponse.json(
          {
            error:
              "စကားဝှက် မှားယွင်းမှု များနေပါသဖြင့် ၅ မိနစ်ခန့် စောင့်ဆိုင်းပြီးမှ ပြန်လည်ကြိုးစားပါ။",
          },
          { status: 429 }
        );
      }

      const { email, password } = body;
      const normalizedEmail = String(email || "")
        .trim()
        .toLowerCase();
      const found = db.users.find(
        (u) =>
          u.email.toLowerCase() === normalizedEmail &&
          verifyPassword(String(password || ""), u.password)
      );
      if (!found) {
        const currentCount = rate && now < rate.resetAt ? rate.count + 1 : 1;
        loginAttempts.set(clientIp, {
          count: currentCount,
          resetAt: now + 5 * 60 * 1000,
        });
        return NextResponse.json(
          {
            error:
              "အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်။ အကောင့်မရှိသေးပါက Sign Up လုပ်ပေးပါ။",
          },
          { status: 401 }
        );
      }

      loginAttempts.delete(clientIp);
      const token = createSessionToken(found.id);
      const res = NextResponse.json({
        ok: true,
        user: sanitizeUser(found),
        db: buildScopedResponse(db, found),
      });
      res.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return res;
    }

    if (body.action === "UPDATE_PROFILE") {
      const { userId, name, phone, city, address, newPassword } = body;
      if (
        !sessionUser ||
        (sessionUser.id !== userId && sessionUser.role !== "admin")
      ) {
        return NextResponse.json(
          { error: "Unauthorized profile update" },
          { status: 403 }
        );
      }
      const idx = db.users.findIndex((u) => u.id === userId);
      if (idx === -1) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      const existing = db.users[idx];
      const updatedUser: UserProfile = {
        ...existing,
        name: name ? String(name).trim().slice(0, 80) : existing.name,
        phone: phone ? String(phone).trim().slice(0, 30) : existing.phone,
        city: city || existing.city,
        address:
          address !== undefined
            ? String(address).trim().slice(0, 250)
            : existing.address,
        password:
          newPassword && String(newPassword).trim().length >= 6
            ? hashPassword(String(newPassword))
            : existing.password,
      };
      db.users[idx] = updatedUser;
      writeDb(db);
      return NextResponse.json({
        ok: true,
        user: sanitizeUser(updatedUser),
        db: buildScopedResponse(db, updatedUser),
      });
    }

    if (body.action === "CREATE_ORDER") {
      const incoming: Order = body.order;
      if (
        !incoming ||
        !Array.isArray(incoming.items) ||
        incoming.items.length === 0
      ) {
        return NextResponse.json({ error: "Invalid order" }, { status: 400 });
      }

      // Server-side price calculation to prevent price tampering
      let calculatedSubtotal = 0;
      const verifiedItems = [];

      for (const item of incoming.items) {
        const qty = Math.max(1, Math.min(99, Math.floor(Number(item.quantity) || 1)));
        const product = db.products.find((p) => p.id === item.productId);
        const unitPrice = product ? product.price : Math.max(0, Number(item.price) || 0);
        calculatedSubtotal += unitPrice * qty;

        if (product) {
          product.stock = Math.max(0, product.stock - qty);
        }

        verifiedItems.push({
          productId: item.productId,
          nameEn: product ? product.nameEn : String(item.nameEn || ""),
          nameMm: product ? product.nameMm : String(item.nameMm || ""),
          price: unitPrice,
          quantity: qty,
          selectedColor: String(item.selectedColor || "Default").slice(0, 40),
          image: product ? product.image : sanitizeImageUrl(item.image) || "",
        });
      }

      const discount =
        incoming.discount && incoming.discount > 0
          ? Math.round(calculatedSubtotal * 0.1)
          : 0;
      const cityObj =
        CITIES.find((c) => c.name === incoming.city) || CITIES[0];
      const deliveryFee =
        calculatedSubtotal - discount >= 100000 ? 0 : cityObj.fee;
      const calculatedTotal = calculatedSubtotal - discount + deliveryFee;

      const safeOrder: Order = {
        id: `PP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: String(incoming.customerName || "")
          .trim()
          .slice(0, 80),
        phone: String(incoming.phone || "")
          .trim()
          .slice(0, 30),
        city: cityObj.name,
        address: String(incoming.address || "")
          .trim()
          .slice(0, 250),
        note: incoming.note
          ? String(incoming.note).trim().slice(0, 200)
          : undefined,
        paymentMethod: ["KPay", "WavePay", "COD"].includes(
          incoming.paymentMethod
        )
          ? incoming.paymentMethod
          : "COD",
        transactionRef: incoming.transactionRef
          ? String(incoming.transactionRef).trim().slice(0, 20)
          : undefined,
        items: verifiedItems,
        subtotal: calculatedSubtotal,
        discount,
        deliveryFee,
        total: calculatedTotal,
        status: "Pending",
        createdAt: new Date().toISOString(),
        userEmail: sessionUser?.email || incoming.userEmail,
      };

      db.orders = [safeOrder, ...db.orders];
      writeDb(db);
      return NextResponse.json({
        ok: true,
        order: safeOrder,
        db: buildScopedResponse(db, sessionUser),
      });
    }

    if (body.action === "CHAT_MESSAGE") {
      const message = String(body.message || "").trim();
      if (!message) {
        return NextResponse.json({ error: "Empty message" }, { status: 400 });
      }

      const cfg = db.chatbotConfig;
      if (!cfg || !cfg.enabled) {
        return NextResponse.json({
          reply: "Chatbot ဝန်ဆောင်မှု ခေတ္တပိတ်ထားပါသည်ရှင်။",
        });
      }

      // If provider is Gemini and API key is provided
      if (cfg.provider === "gemini" && cfg.apiKey) {
        try {
          const modelName = cfg.model || "gemini-1.5-flash";
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${cfg.apiKey}`;
          
          const promptPayload = {
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `System Prompt Instructions: ${cfg.systemPrompt}\n\nCustomer Message: ${message}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800,
            },
          };

          const aiRes = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(promptPayload),
          });

          if (aiRes.ok) {
            const data = await aiRes.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              return NextResponse.json({ reply: text });
            }
          }
        } catch (err) {
          console.error("Gemini API call failed:", err);
        }
      }

      // If provider is OpenAI compatible (OpenAI, Groq)
      if ((cfg.provider === "openai" || cfg.provider === "groq") && cfg.apiKey) {
        try {
          const endpoint =
            cfg.provider === "groq"
              ? "https://api.groq.com/openai/v1/chat/completions"
              : "https://api.openai.com/v1/chat/completions";
          const defaultModel =
            cfg.provider === "groq" ? "llama-3.1-8b-instant" : "gpt-4o-mini";

          const aiRes = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${cfg.apiKey}`,
            },
            body: JSON.stringify({
              model: cfg.model || defaultModel,
              messages: [
                { role: "system", content: cfg.systemPrompt },
                { role: "user", content: message },
              ],
              temperature: 0.7,
              max_tokens: 800,
            }),
          });

          if (aiRes.ok) {
            const data = await aiRes.json();
            const text = data?.choices?.[0]?.message?.content;
            if (text) {
              return NextResponse.json({ reply: text });
            }
          }
        } catch (err) {
          console.error("OpenAI/Groq API call failed:", err);
        }
      }

      // If custom or open-webui / local endpoint
      if (cfg.provider === "custom" && cfg.apiUrl) {
        try {
          const endpoint = cfg.apiUrl.endsWith("/chat/completions")
            ? cfg.apiUrl
            : cfg.apiUrl.replace(/\/+$/, "") + "/chat/completions";

          const headers: Record<string, string> = { "Content-Type": "application/json" };
          if (cfg.apiKey) {
            headers["Authorization"] = `Bearer ${cfg.apiKey}`;
          }

          const aiRes = await fetch(endpoint, {
            method: "POST",
            headers,
            body: JSON.stringify({
              model: cfg.model || "gpt-3.5-turbo",
              messages: [
                { role: "system", content: cfg.systemPrompt },
                { role: "user", content: message },
              ],
              temperature: 0.7,
              max_tokens: 800,
            }),
          });

          if (aiRes.ok) {
            const data = await aiRes.json();
            const text = data?.choices?.[0]?.message?.content;
            if (text) {
              return NextResponse.json({ reply: text });
            }
          }
        } catch (err) {
          console.error("Custom AI call failed:", err);
        }
      }

      // Fallback: Handled by client-side rule-engine or basic response
      return NextResponse.json({
        reply: null, // Signals frontend to use its intelligent local knowledgebase
      });
    }

    if (body.action === "FETCH_AI_MODELS") {
      const { apiUrl, apiKey, provider } = body;
      const models: string[] = [];

      try {
        if (provider === "gemini" || (!provider && apiKey?.startsWith("AIzaSy"))) {
          const key = apiKey?.trim();
          const url = apiUrl?.trim() || `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
          const res = await fetch(url.includes("key=") ? url : `${url}?key=${key}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.models)) {
              for (const m of data.models) {
                // Keep only generateContent compatible models
                if (m.supportedGenerationMethods?.includes("generateContent") || m.name?.includes("gemini")) {
                  const cleanName = m.name?.replace("models/", "");
                  if (cleanName) models.push(cleanName);
                }
              }
            }
          }
        } else {
          // OpenAI, Groq, Ollama, OpenWebUI, or Custom OpenAI-compatible endpoints
          let url = apiUrl?.trim();
          if (!url) {
            if (provider === "groq") url = "https://api.groq.com/openai/v1/models";
            else url = "https://api.openai.com/v1/models";
          } else {
            // Append /models if needed
            if (!url.endsWith("/models")) {
              url = url.replace(/\/+$/, "") + "/models";
            }
          }

          const headers: Record<string, string> = {};
          if (apiKey?.trim()) {
            headers["Authorization"] = `Bearer ${apiKey.trim()}`;
          }

          const res = await fetch(url, { headers });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.data)) {
              for (const m of data.data) {
                if (m.id) models.push(m.id);
              }
            } else if (Array.isArray(data.models)) {
              for (const m of data.models) {
                if (m.id) models.push(m.id);
                else if (m.name) models.push(m.name);
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch models from API:", err);
      }

      return NextResponse.json({ ok: true, models });
    }

    // All remaining actions strictly require Admin role!
    if (!sessionUser || sessionUser.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin privileges required." },
        { status: 403 }
      );
    }

    if (body.action === "UPDATE_USER_ROLE") {
      const { userId, role } = body;
      if (userId === sessionUser.id) {
        return NextResponse.json(
          { error: "Cannot change your own admin role" },
          { status: 400 }
        );
      }
      if (role === "admin" || role === "customer") {
        db.users = db.users.map((u) =>
          u.id === userId ? { ...u, role } : u
        );
        writeDb(db);
      }
      return NextResponse.json({
        ok: true,
        db: buildScopedResponse(db, sessionUser),
      });
    }

    if (body.action === "DELETE_USER") {
      const { userId } = body;
      if (userId === sessionUser.id) {
        return NextResponse.json(
          { error: "Cannot delete your own admin account" },
          { status: 400 }
        );
      }
      db.users = db.users.filter((u) => u.id !== userId);
      writeDb(db);
      return NextResponse.json({
        ok: true,
        db: buildScopedResponse(db, sessionUser),
      });
    }

    if (body.action === "UPDATE_ORDER_STATUS") {
      const { orderId, status } = body;
      const allowedStatuses = [
        "Pending",
        "Confirmed",
        "Shipped",
        "Delivered",
        "Cancelled",
      ];
      if (allowedStatuses.includes(status)) {
        db.orders = db.orders.map((o) =>
          o.id === orderId ? { ...o, status } : o
        );
        writeDb(db);
      }
      return NextResponse.json({
        ok: true,
        db: buildScopedResponse(db, sessionUser),
      });
    }

    if (body.action === "ADD_PRODUCT") {
      const newProduct: Product = body.product;
      newProduct.price = Math.max(0, Number(newProduct.price) || 0);
      newProduct.stock = Math.max(0, Math.floor(Number(newProduct.stock) || 0));
      newProduct.image =
        sanitizeImageUrl(newProduct.image) || INITIAL_PRODUCTS[0].image;
      db.products = [newProduct, ...db.products];
      writeDb(db);
      return NextResponse.json({
        ok: true,
        db: buildScopedResponse(db, sessionUser),
      });
    }

    if (body.action === "UPDATE_PRODUCT") {
      const updated: Product = body.product;
      updated.price = Math.max(0, Number(updated.price) || 0);
      updated.stock = Math.max(0, Math.floor(Number(updated.stock) || 0));
      db.products = db.products.map((p) =>
        p.id === updated.id ? updated : p
      );
      writeDb(db);
      return NextResponse.json({
        ok: true,
        db: buildScopedResponse(db, sessionUser),
      });
    }

    if (body.action === "DELETE_PRODUCT") {
      const { productId } = body;
      db.products = db.products.filter((p) => p.id !== productId);
      writeDb(db);
      return NextResponse.json({
        ok: true,
        db: buildScopedResponse(db, sessionUser),
      });
    }

    if (body.action === "ADD_ANNOUNCEMENT") {
      const newAnn: Announcement = body.announcement;
      newAnn.image = sanitizeImageUrl(newAnn.image);
      db.announcements = [newAnn, ...(db.announcements || [])];
      writeDb(db);
      return NextResponse.json({
        ok: true,
        db: buildScopedResponse(db, sessionUser),
      });
    }

    if (body.action === "DELETE_ANNOUNCEMENT") {
      const { announcementId } = body;
      db.announcements = (db.announcements || []).filter(
        (a) => a.id !== announcementId
      );
      writeDb(db);
      return NextResponse.json({
        ok: true,
        db: buildScopedResponse(db, sessionUser),
      });
    }

    if (body.action === "ADD_CATEGORY") {
      const newCat: CategoryItem = body.category;
      const exists = (db.categories || []).some(
        (c) =>
          c.id.toLowerCase() === newCat.id.toLowerCase() ||
          c.labelEn.toLowerCase() === newCat.labelEn.toLowerCase()
      );
      if (!exists) {
        db.categories = [...(db.categories || INITIAL_CATEGORIES), newCat];
        writeDb(db);
      }
      return NextResponse.json({
        ok: true,
        db: buildScopedResponse(db, sessionUser),
      });
    }

    if (body.action === "DELETE_CATEGORY") {
      const { categoryId } = body;
      if (categoryId !== "All") {
        db.categories = (db.categories || INITIAL_CATEGORIES).filter(
          (c) => c.id !== categoryId
        );
        writeDb(db);
      }
      return NextResponse.json({
        ok: true,
        db: buildScopedResponse(db, sessionUser),
      });
    }

    if (body.action === "UPDATE_THEME") {
      const { theme } = body;
      if (
        theme === "luxury-gold" ||
        theme === "rose-paris" ||
        theme === "minimal-noir"
      ) {
        db.theme = theme;
        writeDb(db);
      }
      return NextResponse.json({
        ok: true,
        db: buildScopedResponse(db, sessionUser),
      });
    }

    if (body.action === "UPDATE_CHATBOT_CONFIG") {
      const incomingConfig = body.chatbotConfig;
      if (incomingConfig) {
        db.chatbotConfig = {
          provider: ["mock", "gemini", "openai", "groq", "custom"].includes(incomingConfig.provider)
            ? incomingConfig.provider
            : "mock",
          apiUrl: typeof incomingConfig.apiUrl === "string" ? incomingConfig.apiUrl.trim() : "",
          apiKey: typeof incomingConfig.apiKey === "string" ? incomingConfig.apiKey.trim() : "",
          model: String(incomingConfig.model || "gemini-1.5-flash").trim(),
          systemPrompt: String(incomingConfig.systemPrompt || "").trim(),
          botName: String(incomingConfig.botName || "Pont Pont AI Assistant").trim(),
          welcomeMessageMm: String(incomingConfig.welcomeMessageMm || "").trim(),
          welcomeMessageEn: String(incomingConfig.welcomeMessageEn || "").trim(),
          enabled: Boolean(incomingConfig.enabled),
        };
        writeDb(db);
      }
      return NextResponse.json({
        ok: true,
        db: buildScopedResponse(db, sessionUser),
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
