import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function isMongoUrl(value) {
  return /^mongodb(\+srv)?:\/\//i.test(value || "");
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
      const empty = { users: [], staff: [], services: [], slots: [], appointments: [], bookings: [] };
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
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const staffSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
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
    day: { type: String, required: true },
    time: { type: String, required: true },
    status: { type: String, default: "Open" },
  },
  { timestamps: true }
);

const appointmentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
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
    client: { type: String, required: true },
    service: { type: String, required: true },
    date: { type: String, required: true },
    status: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

const models = {
  users: mongoose.models.User || mongoose.model("User", userSchema),
  staff: mongoose.models.Staff || mongoose.model("Staff", staffSchema),
  services: mongoose.models.Service || mongoose.model("Service", serviceSchema),
  slots: mongoose.models.Slot || mongoose.model("Slot", slotSchema),
  appointments: mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema),
  bookings: mongoose.models.Booking || mongoose.model("Booking", bookingSchema),
};

let dbMode = "json";
let connectionPromise = null;

export async function connectDatabase() {
  const dbUrl = process.env.DB_URL || process.env.DB_PATH;

  if (!dbUrl || !isMongoUrl(dbUrl)) {
    dbMode = "json";
    return null;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(dbUrl, {
        serverSelectionTimeoutMS: 5000,
      })
      .then(() => {
        dbMode = "mongo";
        console.log("MongoDB connected");
        return true;
      })
      .catch((error) => {
        dbMode = "json";
        console.warn("MongoDB connection failed, using JSON fallback:", error.message);
        return false;
      });
  }

  await connectionPromise;
  return dbMode === "mongo";
}

export async function getCollection(name) {
  if (dbMode === "mongo") {
    const Model = models[name];
    if (!Model) {
      return [];
    }

    const docs = await Model.find().lean();
    return docs.map((doc) => toPlainObject(doc));
  }

  const db = await readDb();
  return db[name] || [];
}

export async function findById(name, id) {
  if (dbMode === "mongo") {
    const Model = models[name];
    if (!Model) {
      return null;
    }

    const doc = await Model.findOne({ id: String(id) }).lean();
    return toPlainObject(doc);
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

    const payload = { ...item, id: item.id || generateId() };
    const created = await Model.create(payload);
    return toPlainObject(created);
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

    const updated = await Model.findOneAndUpdate({ id: String(id) }, { $set: updates }, { new: true, runValidators: true }).lean();
    return toPlainObject(updated);
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

    await Model.deleteOne({ id: String(id) });
    return true;
  }

  const db = await readDb();
  const original = db[name] || [];
  db[name] = original.filter((item) => item.id !== id && item.id !== Number(id));
  await writeDb(db);
  return db[name];
}

export async function findUserByEmail(email) {
  if (dbMode === "mongo") {
    const userDoc = await models.users.findOne({ email: String(email).toLowerCase() }).lean();
    return toPlainObject(userDoc);
  }

  const users = await getCollection("users");
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export async function saveUser(user) {
  if (dbMode === "mongo") {
    const created = await models.users.create(user);
    return toPlainObject(created);
  }

  const db = await readDb();
  db.users = [user, ...(db.users || [])];
  await writeDb(db);
  return user;
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
