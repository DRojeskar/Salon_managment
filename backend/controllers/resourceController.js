import { ResourceModel } from "../models/resourceModel.js";
import { filterBySalon, findSalonService } from "../middleware/tenantMiddleware.js";
import { findById } from "../db.js";

export function list(name) {
  return async (req, res, next) => {
    try {
      const data = await ResourceModel.list(name);
      const scoped = req.user?.role === "superadmin" && !req.salonId
        ? data
        : filterBySalon(data, req.salonId);
      res.json({ success: true, [name]: scoped });
    } catch (error) {
      next(error);
    }
  };
}

function singularName(name) {
  if (name === "staff") return "staff";
  if (name.endsWith("ies")) return `${name.slice(0, -3)}y`;
  if (name.endsWith("s")) return name.slice(0, -1);
  return name;
}

export function create(name, singular = singularName(name)) {
  return async (req, res, next) => {
    try {
      if (name === "bookings") {
        const { service, client, date } = req.body || {};
        if (!service || !client || !date) {
          return res.status(400).json({ success: false, message: "Booking requires service, client, and date" });
        }

        if (!req.salonId) {
          return res.status(400).json({ success: false, message: "Salon context is required for bookings" });
        }

        const salon = await findById("salons", req.salonId);
        const services = filterBySalon(await ResourceModel.list("services"), req.salonId);
        const selectedService = findSalonService(services, {
          service,
          serviceId: req.body.serviceId,
        });
        const isProAiBooking = req.body.source === "AI Try-On";
        const isLegacyAiBooking = req.body.source === "ai_style_studio";
        const isAiBooking = isProAiBooking || isLegacyAiBooking;
        const aiPrice = Number(req.body.finalPrice ?? req.body.price ?? 0);
        const serviceListPrice = Number(selectedService?.price ?? 0);

        if (!selectedService) {
          return res.status(400).json({ success: false, message: "Selected service is not available at this salon" });
        }

        if (isProAiBooking && aiPrice <= 0) {
          return res.status(400).json({ success: false, message: "AI Try-On booking requires a valid price" });
        }
        if (isLegacyAiBooking && serviceListPrice <= 0 && aiPrice <= 0) {
          return res.status(400).json({ success: false, message: "This service has no price for AI Style Studio checkout" });
        }

        const paidStatus = req.body.paymentStatus || (isAiBooking ? "Pending" : "NotRequired");

        req.body = {
          ...req.body,
          salonId: req.salonId,
          salonName: req.body.salonName || salon?.name || "",
          customerId: req.user?.id || "",
          source: isProAiBooking ? "AI Try-On" : isLegacyAiBooking ? "ai_style_studio" : "normal",
          amount: isProAiBooking ? aiPrice : isLegacyAiBooking ? Math.round(Number(selectedService.price) * 0.9) : 0,
          price: isProAiBooking ? aiPrice : Number(selectedService?.price || req.body.price || 0),
          finalPrice: isProAiBooking ? aiPrice : req.body.finalPrice || Number(selectedService?.price || 0),
          leadTag: isProAiBooking ? "AI Try-On Lead" : req.body.leadTag || "",
          clientPhotoExpiresAt: isProAiBooking ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : req.body.clientPhotoExpiresAt || null,
          isPayable: isAiBooking ? true : Boolean(req.body.isPayable),
          paymentStatus: paidStatus,
        };
      } else if (req.salonId) {
        req.body = { ...req.body, salonId: req.salonId };
      }

      const item = await ResourceModel.create(name, req.body);
      res.status(201).json({ success: true, [singular]: item });
    } catch (error) {
      next(error);
    }
  };
}

export function update(name, singular = singularName(name)) {
  return async (req, res, next) => {
    try {
      const updated = await ResourceModel.update(name, req.params.id, req.body);
      const found = await ResourceModel.findById(name, req.params.id);
      if (!found) {
        return res.status(404).json({ success: false, message: `${singular} not found` });
      }
      res.json({ success: true, [singular]: updated });
    } catch (error) {
      next(error);
    }
  };
}

export function remove(name) {
  return async (req, res, next) => {
    try {
      await ResourceModel.delete(name, req.params.id);
      res.json({ success: true, message: `${name.slice(0, -1)} deleted` });
    } catch (error) {
      next(error);
    }
  };
}
