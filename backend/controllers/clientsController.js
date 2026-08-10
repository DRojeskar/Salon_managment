import { ResourceModel } from "../models/resourceModel.js";

export async function list(req, res, next) {
  try {
    const appointments = await ResourceModel.list("appointments");
    const bookings = await ResourceModel.list("bookings");
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
