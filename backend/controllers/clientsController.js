import { ResourceModel } from "../models/resourceModel.js";
import { filterBySalon } from "../middleware/tenantMiddleware.js";

export async function list(req, res, next) {
  try {
    const appointments = filterBySalon(await ResourceModel.list("appointments"), req.salonId);
    const bookings = filterBySalon(await ResourceModel.list("bookings"), req.salonId);
    const clients = [];

    appointments.forEach((item) => {
      if (item.client && !clients.includes(item.client)) {
        clients.push(item.client);
      }
    });

    bookings.forEach((item) => {
      if (item.client && !clients.includes(item.client)) {
        clients.push(item.client);
      }
    });

    res.json({ success: true, clients });
  } catch (error) {
    next(error);
  }
}
