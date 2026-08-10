import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { list, create, update, remove } from "../controllers/resourceController.js";

const router = express.Router();
router.use(authenticateToken);

router.get("/", list("bookings"));
router.post("/", create("bookings"));
router.put("/:id", update("bookings"));
router.delete("/:id", remove("bookings"));

export default router;
