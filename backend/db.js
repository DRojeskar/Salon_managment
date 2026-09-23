

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ✅ Enable strict query mode for better MongoDB compatibility
mongoose.set('strictQuery', false);

function isMongoUrl(value) {
  return /^mongodb(\+srv)?:\/\//i.test(value || "");
}

function isJsonDbPath(value) {
  if (!value) return false;
  const normalized = value.replace(/\\/g, "/");
  return normalized.endsWith(".json") || normalized.endsWith("/db.json") || normalized === "db.json";
}

function resolveDbPath(dbUrl) {
  if (!dbUrl) {
    return path.join(__dirname, "db.json");
  }

  if (dbUrl.startsWith("file://")) {
    return fileURLToPath(dbUrl);
  }

  return path.isAbsolute(dbUrl) ? dbUrl : path.resolve(process.cwd(), dbUrl);
}

function getDbPath() {
  const localDbUrl = process.env.DB_URL || process.env.DB_PATH;
  return resolveDbPath(localDbUrl);
}

async function readDb() {
  const dbPath = getDbPath();
  try {
    const raw = await fs.readFile(dbPath, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === "ENOENT") {
      const empty = { users: [], salons: [], staff: [], services: [], slots: [], appointments: [], bookings: [] };
      await writeDb(empty);
      return empty;
    }
    throw error;
  }
}

async function writeDb(data) {
  const dbPath = getDbPath();
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), "utf-8");
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toPlainObject(doc) {
  const plain = doc?.toObject ? doc.toObject() : doc;
  if (!plain) return null;
  const { _id, __v, ...rest } = plain;
  return { ...rest, id: rest.id || _id?.toString() };
}

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, default: "" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, default: "customer" },
    salonIds: { type: [String], default: [] },
    activeSalonId: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const salonSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    email: { type: String, default: "" },
    openTime: { type: String, default: "09:00" },
    closeTime: { type: String, default: "21:00" },
    ownerId: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const staffSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    salonId: { type: String, default: "" },
    name: { type: String, required: true },
    role: { type: String, default: "Staff" },
    shift: { type: String, default: "" },
    status: { type: String, default: "Available" },
  },
  { timestamps: true }
);

const serviceSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    salonId: { type: String, default: "" },
    title: { type: String, required: true },
    price: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    category: { type: String, default: "" },
  },
  { timestamps: true }
);

const slotSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    salonId: { type: String, default: "" },
    day: { type: String, required: true },
    time: { type: String, required: true },
    status: { type: String, default: "Open" },
  },
  { timestamps: true }
);

const appointmentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    salonId: { type: String, default: "" },
    client: { type: String, required: true },
    service: { type: String, required: true },
    time: { type: String, required: true },
    staff: { type: String, required: true },
    status: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

const bookingSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    salonId: { type: String, default: "" },
    salonName: { type: String, default: "" },
    customerId: { type: String, default: "" },
    client: { type: String, required: true },
    service: { type: String, required: true },
    serviceId: { type: String, default: "" },
    displayName: { type: String, default: "" },
    staff: { type: String, default: "" },
    source: { type: String, default: "normal" },
    price: { type: Number, default: 0, min: 0 },
    finalPrice: { type: Number, default: 0, min: 0 },
    originalPrice: { type: Number, default: 0, min: 0 },
    isPayable: { type: Boolean, default: false },
    leadTag: { type: String, default: "" },
    match: { type: String, default: "" },
    faceShape: { type: String, default: "" },
    skinTone: { type: String, default: "" },
    clientPhoto: { type: String, default: "" },
    clientPhotoExpiresAt: { type: Date, default: null },
    date: { type: String, required: true },
    amount: { type: Number, default: 0, min: 0 },
    paymentStatus: { type: String, default: "NotRequired" },
    status: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

const models = {
  users: mongoose.models.User || mongoose.model("User", userSchema),
  salons: mongoose.models.Salon || mongoose.model("Salon", salonSchema),
  staff: mongoose.models.Staff || mongoose.model("Staff", staffSchema),
  services: mongoose.models.Service || mongoose.model("Service", serviceSchema),
  slots: mongoose.models.Slot || mongoose.model("Slot", slotSchema),
  appointments: mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema),
  bookings: mongoose.models.Booking || mongoose.model("Booking", bookingSchema),
};

let dbMode = "json";
let connectionPromise = null;

// db.js me ye wala function change kar de
export async function connectDatabase() {
  const dbUrl = process.env.DB_URL || process.env.MONGODB_URI;
  
  if (!dbUrl) {
    console.error("❌ DB_URL / MONGODB_URI missing in ENV");
    throw new Error("DB_URL missing");
  }

  console.log("🔄 Connecting to MongoDB Atlas...");
  
  // Force IPv4 + Retry - ye tera DNS wala glitch fix karega
  const options = {
    serverSelectionTimeoutMS: 20000,
    socketTimeoutMS: 45000,
    family: 4,
  };

  // Retry loop - Render pe cold start me zaruri hai
  for (let i = 1; i <= 5; i++) {
    try {
      await mongoose.connect(dbUrl, options);
      console.log("✅ MongoDB Atlas connected!");
      console.log(`📊 DB: ${mongoose.connection.db.databaseName}`);
      return true;
    } catch (err) {
      console.error(`❌ Attempt ${i}/5 failed: ${err.message}`);
      if (i === 5) throw err;
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

export async function getCollection(name) {
  if (dbMode === "mongo") {
    const Model = models[name];
    if (!Model) {
      return [];
    }

    try {
      const docs = await Model.find().lean();
      const plainDocs = docs.map((doc) => toPlainObject(doc));
      if (name !== "bookings") return plainDocs;

      // Expired photos ko read ke waqt bhi remove karte hain, restart ke baad bhi privacy bani rahe.
      const now = Date.now();
      await Promise.all(plainDocs.filter((item) => item.clientPhoto && item.clientPhotoExpiresAt && new Date(item.clientPhotoExpiresAt).getTime() <= now).map((item) => Model.updateOne({ id: item.id }, { $unset: { clientPhoto: "", clientPhotoExpiresAt: "" } })));
      return plainDocs.map((item) => {
        if (!item.clientPhotoExpiresAt || new Date(item.clientPhotoExpiresAt).getTime() > now) return item;
        const { clientPhoto, clientPhotoExpiresAt, ...safeItem } = item;
        return safeItem;
      });
    } catch (error) {
      console.error(`Error fetching ${name} from MongoDB:`, error.message);
      return [];
    }
  }

  const db = await readDb();
  const collection = db[name] || [];
  if (name !== "bookings") return collection;

  const now = Date.now();
  let changed = false;
  const safeCollection = collection.map((item) => {
    if (!item.clientPhoto || !item.clientPhotoExpiresAt || new Date(item.clientPhotoExpiresAt).getTime() > now) return item;
    changed = true;
    const { clientPhoto, clientPhotoExpiresAt, ...safeItem } = item;
    return safeItem;
  });
  if (changed) {
    db[name] = safeCollection;
    await writeDb(db);
  }
  return safeCollection;
}

export async function findById(name, id) {
  if (dbMode === "mongo") {
    const Model = models[name];
    if (!Model) {
      return null;
    }

    try {
      const doc = await Model.findOne({ id: String(id) }).lean();
      return toPlainObject(doc);
    } catch (error) {
      console.error(`Error finding ${name} in MongoDB:`, error.message);
      return null;
    }
  }

  const collection = await getCollection(name);
  return collection.find((item) => item.id === id || item.id === Number(id));
}

export async function createItem(name, item) {
  if (dbMode === "mongo") {
    const Model = models[name];
    if (!Model) {
      return null;
    }

    try {
      const payload = { ...item, id: item.id || generateId() };
      const created = await Model.create(payload);
      return toPlainObject(created);
    } catch (error) {
      console.error(`Error creating ${name} in MongoDB:`, error.message);
      return null;
    }
  }

  const db = await readDb();
  const payload = { ...item, id: generateId() };
  db[name] = [payload, ...(db[name] || [])];
  await writeDb(db);
  return payload;
}

export async function updateItem(name, id, updates) {
  if (dbMode === "mongo") {
    const Model = models[name];
    if (!Model) {
      return null;
    }

    try {
      const updated = await Model.findOneAndUpdate(
        { id: String(id) }, 
        { $set: updates }, 
        { new: true, runValidators: true }
      ).lean();
      return toPlainObject(updated);
    } catch (error) {
      console.error(`Error updating ${name} in MongoDB:`, error.message);
      return null;
    }
  }

  const db = await readDb();
  db[name] = (db[name] || []).map((item) => {
    const match = item.id === id || item.id === Number(id);
    return match ? { ...item, ...updates } : item;
  });
  await writeDb(db);
  return db[name].find((item) => item.id === id || item.id === Number(id));
}

export async function deleteItem(name, id) {
  if (dbMode === "mongo") {
    const Model = models[name];
    if (!Model) {
      return true;
    }

    try {
      await Model.deleteOne({ id: String(id) });
      return true;
    } catch (error) {
      console.error(`Error deleting ${name} from MongoDB:`, error.message);
      return false;
    }
  }

  const db = await readDb();
  const original = db[name] || [];
  db[name] = original.filter((item) => item.id !== id && item.id !== Number(id));
  await writeDb(db);
  return true;
}

export async function findUserByEmail(email) {
  if (dbMode === "mongo") {
    try {
      const userDoc = await models.users.findOne({ email: String(email).toLowerCase() }).lean();
      return toPlainObject(userDoc);
    } catch (error) {
      console.error("Error finding user in MongoDB:", error.message);
      return null;
    }
  }

  const users = await getCollection("users");
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export async function saveUser(user) {
  if (dbMode === "mongo") {
    try {
      const created = await models.users.create(user);
      return toPlainObject(created);
    } catch (error) {
      console.error("Error saving user in MongoDB:", error.message);
      return null;
    }
  }

  const db = await readDb();
  db.users = [user, ...(db.users || [])];
  await writeDb(db);
  return user;
}

export async function findUserById(id) {
  if (dbMode === "mongo") {
    try {
      const userDoc = await models.users.findOne({ id: String(id) }).lean();
      return toPlainObject(userDoc);
    } catch (error) {
      console.error("Error finding user by id in MongoDB:", error.message);
      return null;
    }
  }

  const users = await getCollection("users");
  return users.find((user) => String(user.id) === String(id)) || null;
}

export async function updateUser(id, updates) {
  if (dbMode === "mongo") {
    try {
      const updated = await models.users.findOneAndUpdate(
        { id: String(id) },
        { $set: updates },
        { new: true, runValidators: true }
      ).lean();
      return toPlainObject(updated);
    } catch (error) {
      console.error("Error updating user in MongoDB:", error.message);
      return null;
    }
  }

  const db = await readDb();
  db.users = (db.users || []).map((user) => (String(user.id) === String(id) ? { ...user, ...updates } : user));
  await writeDb(db);
  return db.users.find((user) => String(user.id) === String(id)) || null;
}

export async function getNextId(name) {
  const collection = await getCollection(name);
  return collection.length + 1;
}

export default {
  readDb,
  writeDb,
  getCollection,
  findById,
  createItem,
  updateItem,
  deleteItem,
  findUserByEmail,
  saveUser,
};