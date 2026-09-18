import { findById, findUserById } from "../db.js";

export async function resolveTenant(req, res, next) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const headerSalon = req.headers["x-salon-id"];

    if (user.role === "superadmin") {
      req.salonId = headerSalon ? String(headerSalon) : "";
      return next();
    }

    if (user.role === "admin") {
      const fullUser = await findUserById(user.id);
      const ownedIds = fullUser?.salonIds || [];

      let salonId = headerSalon ? String(headerSalon) : String(fullUser?.activeSalonId || ownedIds[0] || "");

      if (salonId) {
        const salon = await findById("salons", salonId);
        if (!salon) {
          return res.status(404).json({ success: false, message: "Salon not found" });
        }
        if (salon.ownerId && salon.ownerId !== user.id) {
          return res.status(403).json({ success: false, message: "You do not manage this salon" });
        }
      }

      req.salonId = salonId;
      req.ownedSalonIds = ownedIds;
      return next();
    }

    if (!headerSalon) {
      return res.status(400).json({ success: false, message: "Select a salon before continuing (missing salon context)" });
    }

    const salon = await findById("salons", String(headerSalon));
    if (!salon) {
      return res.status(404).json({ success: false, message: "Salon not found" });
    }

    req.salonId = String(headerSalon);
    return next();
  } catch (error) {
    return next(error);
  }
}

export function filterBySalon(items, salonId) {
  if (!salonId) return items;
  return items.filter((item) => {
    const itemSalonId = String(item.salonId || "").trim();
    // Legacy rows without salonId are treated as available at every salon.
    return !itemSalonId || itemSalonId === String(salonId);
  });
}

export function serviceDisplayName(item) {
  return String(item?.title || item?.name || "").trim();
}

export function findSalonService(services, { service, serviceId } = {}) {
  const idNeedle = String(serviceId || "").trim();
  if (idNeedle) {
    const byId = services.find((item) => String(item.id) === idNeedle);
    if (byId) return byId;
  }

  const labelNeedle = String(service || "").trim().toLowerCase();
  if (!labelNeedle) return null;

  return services.find((item) => {
    if (String(item.id) === labelNeedle) return true;
    return serviceDisplayName(item).toLowerCase() === labelNeedle;
  });
}
