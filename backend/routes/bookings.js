import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { list, create, update, remove } from "../controllers/resourceController.js";
import { getCollection } from "../db.js";

const router = express.Router();
router.use(authenticateToken);

router.get("/", async (req, res, next) => {
	try {
		const bookings = await getCollection("bookings");
		const visibleBookings = req.user?.role === "admin"
			? bookings
			: bookings.filter((booking) => booking.customerId === req.user?.id || (!booking.customerId && booking.client === req.user?.name));
		res.json({ success: true, bookings: visibleBookings });
	} catch (error) {
		next(error);
	}
});
router.post("/", create("bookings"));
router.put("/:id", (req, res, next) => {
	if (req.user?.role !== "admin") {
		return res.status(403).json({ success: false, message: "Only admin can update booking status" });
	}
	return update("bookings")(req, res, next);
});
router.delete("/:id", remove("bookings"));

export default router;
