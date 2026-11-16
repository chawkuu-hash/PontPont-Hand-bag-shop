import Database from "better-sqlite3";
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
  ShopThemeId,
} from "@/data/initialData";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const SQLITE_PATH = path.join(DATA_DIR, "pontpont.sqlite");
const LEGACY_JSON_PATH = path.join(DATA_DIR, "db.json");

export interface DatabaseSchema {
  products: Product[];
  orders: Order[];
  users: UserProfile[];
  announcements: Announcement[];
  categories: CategoryItem[];
  theme?: ShopThemeId;
}

let dbInstance: Database.Database | null = null;

export function getSqliteDb(): Database.Database {
  if (dbInstance) {
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
    return dbInstance;
  }

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const isFirstInit = !fs.existsSync(SQLITE_PATH);
  const db = new Database(SQLITE_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // Create relational tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      labelEn TEXT NOT NULL,
      sortOrder INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      nameEn TEXT NOT NULL,
      nameMm TEXT NOT NULL,
      category TEXT NOT NULL,
      categoryMm TEXT NOT NULL,
      price INTEGER NOT NULL,
      originalPrice INTEGER,
      wholesalePrice INTEGER,
      image TEXT NOT NULL,
      colorsJson TEXT NOT NULL,
      badge TEXT,
      rating REAL NOT NULL DEFAULT 5.0,
      reviewsCount INTEGER NOT NULL DEFAULT 1,
      stock INTEGER NOT NULL DEFAULT 0,
      material TEXT NOT NULL,
      dimensions TEXT NOT NULL,
      descriptionEn TEXT NOT NULL,
      descriptionMm TEXT NOT NULL,
      sortOrder INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      phone TEXT NOT NULL,
      city TEXT NOT NULL,
      address TEXT NOT NULL,
      role TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customerName TEXT NOT NULL,
      phone TEXT NOT NULL,
      city TEXT NOT NULL,
      address TEXT NOT NULL,
      note TEXT,
      paymentMethod TEXT NOT NULL,
      transactionRef TEXT,
      itemsJson TEXT NOT NULL,
      subtotal INTEGER NOT NULL,
      discount INTEGER NOT NULL,
      deliveryFee INTEGER NOT NULL,
      total INTEGER NOT NULL,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      userEmail TEXT
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      tag TEXT NOT NULL,
      image TEXT,
      createdAt TEXT NOT NULL,
      authorName TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  dbInstance = db;

  // Seed or migrate from db.json if SQLite tables are empty
  const catCount = (
    db.prepare("SELECT COUNT(*) as c FROM categories").get() as { c: number }
  ).c;
  const prodCount = (
    db.prepare("SELECT COUNT(*) as c FROM products").get() as { c: number }
  ).c;

  if (isFirstInit || (catCount === 0 && prodCount === 0)) {
    let seedData: DatabaseSchema = {
      products: INITIAL_PRODUCTS,
      orders: INITIAL_ORDERS,
      users: [],
      announcements: INITIAL_ANNOUNCEMENTS,
      categories: INITIAL_CATEGORIES,
    };

    if (fs.existsSync(LEGACY_JSON_PATH)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(LEGACY_JSON_PATH, "utf-8"));
        seedData = {
          products: parsed.products || INITIAL_PRODUCTS,
          orders: parsed.orders || INITIAL_ORDERS,
          users: parsed.users || [],
          announcements: parsed.announcements || INITIAL_ANNOUNCEMENTS,
          categories: parsed.categories || INITIAL_CATEGORIES,
        };
      } catch (e) {
        console.error("Failed reading legacy db.json for migration:", e);
      }
    }

    writeFullDbToSqlite(seedData);

    // Remove legacy db.json after migrating to SQLite
    if (fs.existsSync(LEGACY_JSON_PATH)) {
      try {
        fs.unlinkSync(LEGACY_JSON_PATH);
      } catch {}
    }
  }

  return db;
}

export function readFullDbFromSqlite(): DatabaseSchema {
  const db = getSqliteDb();

  const catRows = db
    .prepare("SELECT id, labelEn FROM categories ORDER BY sortOrder ASC")
    .all() as CategoryItem[];

  const prodRows = db
    .prepare("SELECT * FROM products ORDER BY sortOrder ASC")
    .all() as Record<string, unknown>[];

  const products: Product[] = prodRows.map((r) => ({
    id: String(r.id),
    nameEn: String(r.nameEn),
    nameMm: String(r.nameMm),
    category: String(r.category),
    categoryMm: String(r.categoryMm),
    price: Number(r.price),
    originalPrice:
      r.originalPrice !== null && r.originalPrice !== undefined
        ? Number(r.originalPrice)
        : undefined,
    wholesalePrice:
      r.wholesalePrice !== null && r.wholesalePrice !== undefined
        ? Number(r.wholesalePrice)
        : undefined,
    image: String(r.image),
    colors: JSON.parse(String(r.colorsJson || "[]")),
    badge: r.badge ? (String(r.badge) as Product["badge"]) : undefined,
    rating: Number(r.rating),
    reviewsCount: Number(r.reviewsCount),
    stock: Number(r.stock),
    material: String(r.material),
    dimensions: String(r.dimensions),
    descriptionEn: String(r.descriptionEn),
    descriptionMm: String(r.descriptionMm),
  }));

  const userRows = db
    .prepare("SELECT * FROM users ORDER BY createdAt ASC")
    .all() as UserProfile[];

  const orderRows = db
    .prepare("SELECT * FROM orders ORDER BY createdAt DESC")
    .all() as Record<string, unknown>[];

  const orders: Order[] = orderRows.map((r) => ({
    id: String(r.id),
    customerName: String(r.customerName),
    phone: String(r.phone),
    city: String(r.city),
    address: String(r.address),
    note: r.note ? String(r.note) : undefined,
    paymentMethod: String(r.paymentMethod) as Order["paymentMethod"],
    transactionRef: r.transactionRef ? String(r.transactionRef) : undefined,
    items: JSON.parse(String(r.itemsJson || "[]")),
    subtotal: Number(r.subtotal),
    discount: Number(r.discount),
    deliveryFee: Number(r.deliveryFee),
    total: Number(r.total),
    status: String(r.status) as Order["status"],
    createdAt: String(r.createdAt),
    userEmail: r.userEmail ? String(r.userEmail) : undefined,
  }));

  const annRows = db
    .prepare("SELECT * FROM announcements ORDER BY createdAt DESC")
    .all() as Record<string, unknown>[];

  const announcements: Announcement[] = annRows.map((r) => ({
    id: String(r.id),
    title: String(r.title),
    content: String(r.content),
    tag: String(r.tag) as Announcement["tag"],
    image: r.image ? String(r.image) : undefined,
    createdAt: String(r.createdAt),
    authorName: r.authorName ? String(r.authorName) : undefined,
  }));

  return {
    categories: catRows.length > 0 ? catRows : INITIAL_CATEGORIES,
    products,
    users: userRows,
    orders,
    announcements,
    theme: (() => {
      try {
        const row = db
          .prepare("SELECT value FROM settings WHERE key = 'theme'")
          .get() as { value: string } | undefined;
        if (
          row &&
          (row.value === "luxury-gold" ||
            row.value === "rose-paris" ||
            row.value === "minimal-noir")
        ) {
          return row.value as ShopThemeId;
        }
      } catch {}
      return "luxury-gold" as ShopThemeId;
    })(),
  };
}

export function writeFullDbToSqlite(data: DatabaseSchema) {
  const db = getSqliteDb();

  const tx = db.transaction(() => {
    db.prepare("DELETE FROM categories").run();
    const insertCat = db.prepare(
      "INSERT INTO categories (id, labelEn, sortOrder) VALUES (?, ?, ?)"
    );
    (data.categories || INITIAL_CATEGORIES).forEach((c, idx) => {
      insertCat.run(c.id, c.labelEn, idx);
    });

    db.prepare("DELETE FROM products").run();
    const insertProd = db.prepare(`
      INSERT INTO products (
        id, nameEn, nameMm, category, categoryMm, price, originalPrice, wholesalePrice,
        image, colorsJson, badge, rating, reviewsCount, stock, material, dimensions,
        descriptionEn, descriptionMm, sortOrder
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    (data.products || []).forEach((p, idx) => {
      insertProd.run(
        p.id,
        p.nameEn,
        p.nameMm,
        p.category,
        p.categoryMm,
        p.price,
        p.originalPrice ?? null,
        p.wholesalePrice ?? null,
        p.image,
        JSON.stringify(p.colors || []),
        p.badge ?? null,
        p.rating ?? 5.0,
        p.reviewsCount ?? 1,
        p.stock ?? 0,
        p.material,
        p.dimensions,
        p.descriptionEn,
        p.descriptionMm,
        idx
      );
    });

    db.prepare("DELETE FROM users").run();
    const insertUser = db.prepare(`
      INSERT INTO users (id, name, email, password, phone, city, address, role, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    (data.users || []).forEach((u) => {
      insertUser.run(
        u.id,
        u.name,
        u.email,
        u.password || "",
        u.phone,
        u.city,
        u.address,
        u.role,
        u.createdAt || new Date().toISOString()
      );
    });

    db.prepare("DELETE FROM orders").run();
    const insertOrder = db.prepare(`
      INSERT INTO orders (
        id, customerName, phone, city, address, note, paymentMethod, transactionRef,
        itemsJson, subtotal, discount, deliveryFee, total, status, createdAt, userEmail
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    (data.orders || []).forEach((o) => {
      insertOrder.run(
        o.id,
        o.customerName,
        o.phone,
        o.city,
        o.address,
        o.note ?? null,
        o.paymentMethod,
        o.transactionRef ?? null,
        JSON.stringify(o.items || []),
        o.subtotal,
        o.discount,
        o.deliveryFee,
        o.total,
        o.status,
        o.createdAt,
        o.userEmail ?? null
      );
    });

    db.prepare("DELETE FROM announcements").run();
    const insertAnn = db.prepare(`
      INSERT INTO announcements (id, title, content, tag, image, createdAt, authorName)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    (data.announcements || []).forEach((a) => {
      insertAnn.run(
        a.id,
        a.title,
        a.content,
        a.tag,
        a.image ?? null,
        a.createdAt,
        a.authorName ?? null
      );
    });

    if (data.theme) {
      db.prepare(
        "INSERT OR REPLACE INTO settings (key, value) VALUES ('theme', ?)"
      ).run(data.theme);
    }
  });

  tx();
}
