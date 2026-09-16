import { ResourceModel } from "../models/resourceModel.js";

export function list(name) {
  return async (req, res, next) => {
    try {
      const data = await ResourceModel.list(name);
      res.json({ success: true, [name]: data });
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

        const services = await ResourceModel.list("services");
        const selectedService = services.find((item) => String(item.title).toLowerCase() === String(service).toLowerCase());
        const isProAiBooking = req.body.source === "AI Try-On";
        const isLegacyAiBooking = req.body.source === "ai_style_studio";
        const isAiBooking = isProAiBooking || isLegacyAiBooking;
        const aiPrice = Number(req.body.finalPrice ?? req.body.price ?? 0);
        const hasLegacyPrice = selectedService && Number(selectedService.price) > 0;
        if ((!isAiBooking && !hasLegacyPrice) || (isLegacyAiBooking && !hasLegacyPrice)) {
          return res.status(400).json({ success: false, message: "This service is unavailable or has no payable price" });
        }

        // AI lead ka custom style catalog service se alag hota hai, isliye client price validate karte hain.
        req.body = {
          ...req.body,
          customerId: req.user?.id || "",
          source: isProAiBooking ? "AI Try-On" : isLegacyAiBooking ? "ai_style_studio" : "normal",
          amount: isProAiBooking ? aiPrice : isLegacyAiBooking ? Math.round(Number(selectedService.price) * 0.9) : 0,
          price: isProAiBooking ? aiPrice : Number(selectedService.price),
          finalPrice: isProAiBooking ? aiPrice : req.body.finalPrice || Number(selectedService.price),
          leadTag: isProAiBooking ? "AI Try-On Lead" : req.body.leadTag || "",
          clientPhotoExpiresAt: isProAiBooking ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : req.body.clientPhotoExpiresAt || null,
          isPayable: isAiBooking ? true : Boolean(req.body.isPayable),
          paymentStatus: isAiBooking ? "Pending" : "NotRequired",
        };
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
