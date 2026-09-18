import { createItem, deleteItem, findById, getCollection, findUserById, updateUser } from "../db.js";
import { filterBySalon } from "../middleware/tenantMiddleware.js";

export async function listSalons(req, res, next) {
  try {
    const all = await getCollection("salons");
    const user = req.user;

    if (user.role === "superadmin") {
      return res.json({ success: true, salons: all, scope: "platform" });
    }

    if (user.role === "admin") {
      const owned = all.filter((salon) => salon.ownerId === user.id);
      return res.json({ success: true, salons: owned, scope: "owned" });
    }

    return res.json({ success: true, salons: all, scope: "public" });
  } catch (error) {
    next(error);
  }
}

export async function createSalon(req, res, next) {
  try {
    if (req.user?.role !== "admin" && req.user?.role !== "superadmin") {
      return res.status(403).json({ success: false, message: "Only admins can create salons" });
    }

    const { name, phone, address, openTime, closeTime, email } = req.body || {};
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "Salon name is required" });
    }

    const salon = await createItem("salons", {
      name: String(name).trim(),
      phone: String(phone || "").trim(),
      address: String(address || "").trim(),
      email: String(email || req.user?.email || "").trim(),
      openTime: openTime || "09:00",
      closeTime: closeTime || "21:00",
      ownerId: req.user.id,
      createdAt: new Date().toISOString(),
    });

    const fullUser = await findUserById(req.user.id);
    const salonIds = Array.from(new Set([...(fullUser?.salonIds || []), salon.id]));
    await updateUser(req.user.id, {
      salonIds,
      activeSalonId: salon.id,
    });

    res.status(201).json({ success: true, salon, activeSalonId: salon.id });
  } catch (error) {
    next(error);
  }
}

export async function deleteSalon(req, res, next) {
  try {
    if (req.user?.role !== "admin" && req.user?.role !== "superadmin") {
      return res.status(403).json({ success: false, message: "Only admins can delete salons" });
    }

    const salonId = String(req.params.id || req.body?.salonId || req.body?.id || "").trim();
    if (!salonId) {
      return res.status(400).json({ success: false, message: "Salon id is required" });
    }

    const salon = await findById("salons", salonId);
    if (!salon) {
      return res.status(404).json({ success: false, message: "Salon not found on server. Refresh the list or re-add this salon." });
    }

    if (req.user.role === "admin" && salon.ownerId !== req.user.id) {
      return res.status(403).json({ success: false, message: "You do not manage this salon" });
    }

    const fullUser = await findUserById(req.user.id);
    const ownedSalons = (await getCollection("salons")).filter((item) => item.ownerId === req.user.id);
    if (req.user.role === "admin" && ownedSalons.length <= 1) {
      return res.status(400).json({
        success: false,
        message: "At least one salon profile must remain. Add another salon before deleting this one.",
      });
    }

    const bookings = filterBySalon(await getCollection("bookings"), salonId);
    const hasOpenBookings = bookings.some((item) => !["Completed", "Cancelled"].includes(String(item.status || "")));
    if (hasOpenBookings) {
      return res.status(400).json({
        success: false,
        message: "This salon has pending or active bookings. Complete or cancel them before deleting the profile.",
      });
    }

    await deleteItem("salons", salonId);

    const nextSalonIds = (fullUser?.salonIds || []).filter((id) => String(id) !== salonId);
    const fallbackSalon = ownedSalons.find((item) => String(item.id) !== salonId);
    const nextActive = String(fullUser?.activeSalonId) === salonId
      ? String(fallbackSalon?.id || nextSalonIds[0] || "")
      : String(fullUser?.activeSalonId || "");

    if (req.user.role === "admin" || req.user.role === "superadmin") {
      await updateUser(req.user.id, {
        salonIds: nextSalonIds,
        activeSalonId: nextActive,
      });
    }

    res.json({
      success: true,
      message: "Salon profile deleted",
      activeSalonId: nextActive,
    });
  } catch (error) {
    next(error);
  }
}

export async function setActiveSalon(req, res, next) {
  try {
    const { salonId } = req.body || {};
    if (!salonId) {
      return res.status(400).json({ success: false, message: "salonId is required" });
    }

    const salon = await findById("salons", salonId);
    if (!salon) {
      return res.status(404).json({ success: false, message: "Salon not found" });
    }

    if (req.user.role === "admin" && salon.ownerId !== req.user.id) {
      return res.status(403).json({ success: false, message: "You do not manage this salon" });
    }

    if (req.user.role === "admin" || req.user.role === "superadmin") {
      await updateUser(req.user.id, { activeSalonId: String(salonId) });
    }

    res.json({ success: true, activeSalonId: String(salonId), salon });
  } catch (error) {
    next(error);
  }
}
