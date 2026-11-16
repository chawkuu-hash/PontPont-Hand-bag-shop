import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_CATEGORIES,
  Product,
  Order,
  UserProfile,
  Announcement,
  CategoryItem,
} from "@/data/initialData";

const DB_PATH = path.join(process.cwd(), "src", "data", "db.json");

interface DatabaseSchema {
  products: Product[];
  orders: Order[];
  users: UserProfile[];
  announcements: Announcement[];
  categories: CategoryItem[];
}

function readDb(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        products: parsed.products || INITIAL_PRODUCTS,
        orders: parsed.orders || INITIAL_ORDERS,
        users: parsed.users || [],
        announcements: parsed.announcements || INITIAL_ANNOUNCEMENTS,
        categories: parsed.categories || INITIAL_CATEGORIES,
      };
    }
  } catch (err) {
    console.error("Error reading db.json:", err);
  }
  const initialData: DatabaseSchema = {
    products: INITIAL_PRODUCTS,
    orders: INITIAL_ORDERS,
    users: [],
    announcements: INITIAL_ANNOUNCEMENTS,
    categories: INITIAL_CATEGORIES,
  };
  writeDb(initialData);
  return initialData;
}

function writeDb(data: DatabaseSchema) {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing db.json:", err);
  }
}

function sanitizeUser(u: UserProfile): UserProfile {
  const { password: _, ...safe } = u;
  return safe;
}

function sanitizeDb(db: DatabaseSchema) {
  return {
    products: db.products,
    orders: db.orders,
    users: db.users.map(sanitizeUser),
    announcements: db.announcements || INITIAL_ANNOUNCEMENTS,
    categories: db.categories || INITIAL_CATEGORIES,
  };
}

export async function GET() {
  const db = readDb();
  return NextResponse.json(sanitizeDb(db));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = readDb();

    if (body.action === "REGISTER") {
      const { name, email, password, phone, city, address } = body;
      if (!name || !email || !password || !phone) {
        return NextResponse.json(
          { error: "လိုအပ်သော အချက်အလက်များ အားလုံး ဖြည့်စွက်ပေးပါ။" },
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
        name: String(name).trim(),
        email: normalizedEmail,
        password: String(password),
        phone: String(phone).trim(),
        city: city || "Mandalay (မန္တလေး - မြို့တွင်း)",
        address: String(address || city || "").trim(),
        role: isFirstUser ? "admin" : "customer",
        createdAt: new Date().toISOString(),
      };

      db.users.push(newUser);
      writeDb(db);
      return NextResponse.json({
        ok: true,
        user: sanitizeUser(newUser),
        db: sanitizeDb(db),
      });
    }

    if (body.action === "LOGIN") {
      const { email, password } = body;
      const normalizedEmail = String(email || "")
        .trim()
        .toLowerCase();
      const found = db.users.find(
        (u) =>
          u.email.toLowerCase() === normalizedEmail &&
          u.password === String(password)
      );
      if (!found) {
        return NextResponse.json(
          {
            error:
              "အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်။ အကောင့်မရှိသေးပါက Sign Up လုပ်ပေးပါ။",
          },
          { status: 401 }
        );
      }
      return NextResponse.json({
        ok: true,
        user: sanitizeUser(found),
        db: sanitizeDb(db),
      });
    }

    if (body.action === "UPDATE_PROFILE") {
      const { userId, name, phone, city, address, newPassword } = body;
      const idx = db.users.findIndex((u) => u.id === userId);
      if (idx === -1) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      const existing = db.users[idx];
      const updatedUser: UserProfile = {
        ...existing,
        name: name ? String(name).trim() : existing.name,
        phone: phone ? String(phone).trim() : existing.phone,
        city: city || existing.city,
        address: address !== undefined ? String(address).trim() : existing.address,
        password:
          newPassword && String(newPassword).trim().length > 0
            ? String(newPassword)
            : existing.password,
      };
      db.users[idx] = updatedUser;
      writeDb(db);
      return NextResponse.json({
        ok: true,
        user: sanitizeUser(updatedUser),
        db: sanitizeDb(db),
      });
    }

    if (body.action === "UPDATE_USER_ROLE") {
      const { userId, role } = body;
      db.users = db.users.map((u) =>
        u.id === userId ? { ...u, role } : u
      );
      writeDb(db);
      return NextResponse.json({ ok: true, db: sanitizeDb(db) });
    }

    if (body.action === "DELETE_USER") {
      const { userId } = body;
      db.users = db.users.filter((u) => u.id !== userId);
      writeDb(db);
      return NextResponse.json({ ok: true, db: sanitizeDb(db) });
    }

    if (body.action === "CREATE_ORDER") {
      const newOrder: Order = body.order;
      db.orders = [newOrder, ...db.orders];
      for (const item of newOrder.items) {
        const product = db.products.find((p) => p.id === item.productId);
        if (product) {
          product.stock = Math.max(0, product.stock - item.quantity);
        }
      }
      writeDb(db);
      return NextResponse.json({ ok: true, db: sanitizeDb(db) });
    }

    if (body.action === "UPDATE_ORDER_STATUS") {
      const { orderId, status } = body;
      db.orders = db.orders.map((o) =>
        o.id === orderId ? { ...o, status } : o
      );
      writeDb(db);
      return NextResponse.json({ ok: true, db: sanitizeDb(db) });
    }

    if (body.action === "ADD_PRODUCT") {
      const newProduct: Product = body.product;
      db.products = [newProduct, ...db.products];
      writeDb(db);
      return NextResponse.json({ ok: true, db: sanitizeDb(db) });
    }

    if (body.action === "UPDATE_PRODUCT") {
      const updated: Product = body.product;
      db.products = db.products.map((p) =>
        p.id === updated.id ? updated : p
      );
      writeDb(db);
      return NextResponse.json({ ok: true, db: sanitizeDb(db) });
    }

    if (body.action === "DELETE_PRODUCT") {
      const { productId } = body;
      db.products = db.products.filter((p) => p.id !== productId);
      writeDb(db);
      return NextResponse.json({ ok: true, db: sanitizeDb(db) });
    }

    if (body.action === "ADD_ANNOUNCEMENT") {
      const newAnn: Announcement = body.announcement;
      db.announcements = [newAnn, ...(db.announcements || [])];
      writeDb(db);
      return NextResponse.json({ ok: true, db: sanitizeDb(db) });
    }

    if (body.action === "DELETE_ANNOUNCEMENT") {
      const { announcementId } = body;
      db.announcements = (db.announcements || []).filter(
        (a) => a.id !== announcementId
      );
      writeDb(db);
      return NextResponse.json({ ok: true, db: sanitizeDb(db) });
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
      return NextResponse.json({ ok: true, db: sanitizeDb(db) });
    }

    if (body.action === "DELETE_CATEGORY") {
      const { categoryId } = body;
      if (categoryId !== "All") {
        db.categories = (db.categories || INITIAL_CATEGORIES).filter(
          (c) => c.id !== categoryId
        );
        writeDb(db);
      }
      return NextResponse.json({ ok: true, db: sanitizeDb(db) });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
