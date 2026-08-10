import bcrypt from "bcryptjs";
import { UserModel } from "../models/userModel.js";
import { signToken } from "../middleware/authMiddleware.js";

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

    const normalizedRole = isAdminRequest ? "admin" : requestedRole === "staff" ? "staff" : "customer";

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      name,
      phone,
      email,
      password: hashedPassword,
      role: normalizedRole,
      createdAt: new Date().toISOString(),
    };

    await UserModel.save(newUser);
    const token = signToken(newUser);
    const responseUser = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
    res.json({ success: true, token, user: responseUser });
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

    const token = signToken(user);
    const responseUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    res.json({ success: true, token, user: responseUser });
  } catch (error) {
    next(error);
  }
}
