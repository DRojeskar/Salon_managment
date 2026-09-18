import bcrypt from "bcryptjs";
import { UserModel } from "../models/userModel.js";
import { signToken } from "../middleware/authMiddleware.js";
import { createItem, getCollection, updateUser, findUserById } from "../db.js";

export async function register(req, res, next) {
  try {
    const { name, phone, email, password, role } = req.body;
    if (!name || !phone || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const requestedRole = typeof role === "string" ? role.toLowerCase() : "customer";
    const adminSecret = process.env.ADMIN_CREATE_SECRET || "salon-admin-secret";
    const suppliedSecret = req.headers["x-admin-secret"] || req.body?.adminSecret;
    const isAdminRequest = requestedRole === "admin" || (suppliedSecret && suppliedSecret === adminSecret && requestedRole !== "customer");

    if (requestedRole === "admin" && suppliedSecret !== adminSecret) {
      return res.status(403).json({ success: false, message: "Admin access requires a valid secret" });
    }

    const superadminEmail = String(process.env.SUPERADMIN_EMAIL || "").toLowerCase();
    let normalizedRole = isAdminRequest ? "admin" : requestedRole === "staff" ? "staff" : "customer";
    if (superadminEmail && String(email).toLowerCase() === superadminEmail) {
      normalizedRole = "superadmin";
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      name,
      phone,
      email,
      password: hashedPassword,
      role: normalizedRole,
      salonIds: [],
      activeSalonId: "",
      createdAt: new Date().toISOString(),
    };

    await UserModel.save(newUser);

    let salon = null;
    if (normalizedRole === "admin") {
      const {
        salonName,
        salonPhone,
        salonAddress,
        openTime,
        closeTime,
      } = req.body || {};

      salon = await createItem("salons", {
        name: String(salonName || `${name} Salon`).trim(),
        phone: String(salonPhone || phone || "").trim(),
        address: String(salonAddress || "").trim(),
        email: String(email).trim(),
        openTime: openTime || "09:00",
        closeTime: closeTime || "21:00",
        ownerId: newUser.id,
        createdAt: new Date().toISOString(),
      });

      await updateUser(newUser.id, {
        salonIds: [salon.id],
        activeSalonId: salon.id,
      });
      newUser.salonIds = [salon.id];
      newUser.activeSalonId = salon.id;
    }

    const token = signToken(newUser);
    const responseUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      salonIds: newUser.salonIds || [],
      activeSalonId: newUser.activeSalonId || "",
    };
    res.json({ success: true, token, user: responseUser, salon, activeSalonId: newUser.activeSalonId || "" });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const fullUser = await findUserById(user.id);
    const allSalons = await getCollection("salons");
    const role = fullUser?.role || user.role;
    const salons = role === "admin"
      ? allSalons.filter((item) => item.ownerId === user.id)
      : allSalons;

    const token = signToken(fullUser || user);
    const responseUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role,
      salonIds: fullUser?.salonIds || [],
      activeSalonId: fullUser?.activeSalonId || salons[0]?.id || "",
    };
    res.json({
      success: true,
      token,
      user: responseUser,
      salons,
      activeSalonId: responseUser.activeSalonId,
    });
  } catch (error) {
    next(error);
  }
}
