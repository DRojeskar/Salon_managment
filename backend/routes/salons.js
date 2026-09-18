import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { createSalon, deleteSalon, listSalons, setActiveSalon } from "../controllers/salonController.js";

const router = express.Router();

router.use(authenticateToken);
router.get("/", listSalons);
router.post("/", createSalon);
router.patch("/active", setActiveSalon);
router.post("/remove", (req, res, next) => {
  req.params.id = String(req.body?.salonId || req.body?.id || "");
  return deleteSalon(req, res, next);
});
router.delete("/:id", deleteSalon);

export default router;
