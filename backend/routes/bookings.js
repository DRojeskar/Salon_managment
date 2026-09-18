import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { create, update, remove } from "../controllers/resourceController.js";
import { getCollection } from "../db.js";
import { filterBySalon, resolveTenant } from "../middleware/tenantMiddleware.js";

const router = express.Router();
router.use(authenticateToken);
router.use(resolveTenant);

router.get("/", async (req, res, next) => {
	try {
		const bookings = await getCollection("bookings");
		let visibleBookings = bookings;

		if (req.user?.role === "admin" || req.user?.role === "superadmin") {
			visibleBookings = req.user?.role === "superadmin" && !req.salonId
				? bookings
				: filterBySalon(bookings, req.salonId);
		} else {
			visibleBookings = filterBySalon(bookings, req.salonId).filter(
				(booking) => booking.customerId === req.user?.id || (!booking.customerId && booking.client === req.user?.name)
			);
		}

		res.json({ success: true, bookings: visibleBookings });
	} catch (error) {
		next(error);
	}
});
router.post("/", create("bookings"));
router.put("/:id", async (req, res, next) => {
	try {
		if (req.user?.role === "admin" || req.user?.role === "superadmin") {
			return update("bookings")(req, res, next);
		}

		const bookings = await getCollection("bookings");
		const existing = bookings.find((item) => String(item.id) === String(req.params.id));
		if (!existing) {
		 return res.status(404).json({ success: false, message: "Booking not found" });
		}

		const ownsBooking = existing.customerId === req.user?.id
			|| (!existing.customerId && existing.client === req.user?.name);
		if (!ownsBooking) {
			return res.status(403).json({ success: false, message: "You can only update your own booking" });
		}

		const allowedFields = [
			"paymentStatus", "paymentId", "status", "hdUnlocked", "advance", "remaining", "phone", "client",
		];
		const updates = Object.fromEntries(
			Object.entries(req.body || {}).filter(([key]) => allowedFields.includes(key))
		);

		req.body = updates;
		return update("bookings")(req, res, next);
	} catch (error) {
		next(error);
	}
});
router.delete("/:id", remove("bookings"));

export default router;
