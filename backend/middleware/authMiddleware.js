import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "salon-secret-key";

export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "Authentication token required" });
  }

  jwt.verify(token, SECRET_KEY, (err, payload) => {
    if (err) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
    req.user = payload;
    next();
  });
}

export function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || "customer",
      activeSalonId: user.activeSalonId || "",
    },
    SECRET_KEY,
    { expiresIn: "7d" }
  );
}
