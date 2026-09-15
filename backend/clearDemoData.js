import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "db.json");
const emptyDatabase = {
  users: [],
  staff: [],
  services: [],
  slots: [],
  appointments: [],
  bookings: [],
};

await fs.writeFile(dbPath, JSON.stringify(emptyDatabase, null, 2), "utf-8");
console.log("Demo data removed from", dbPath);
